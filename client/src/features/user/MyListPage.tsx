import { useState, useMemo } from 'react'
import { type Anime } from '@/shared/data/animeData'
import { useApp, type ListStatus, type ListEntry } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import AnimeCard from '@/features/anime/AnimeCard'

interface MyListPageProps {
  onAnimeClick: (anime: Anime) => void
  onWatch: (anime: Anime) => void
}

type TabType = ListStatus | 'Favorites' | 'Bookmarks'

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  Favorites: { color: '#ff4db8', bg: 'rgba(255,77,184,0.15)', label: '♥ Favorites' },
  Bookmarks: { color: '#6d3bff', bg: 'rgba(109,59,255,0.15)', label: '🔖 Bookmarks' },
  Watching: { color: '#6d3bff', bg: 'rgba(109,59,255,0.15)', label: '▶ Watching' },
  Completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: '✓ Completed' },
  'On Hold': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: '⏸ On Hold' },
  Dropped: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '✕ Dropped' },
  'Plan to Watch': { color: '#4a8dff', bg: 'rgba(74,141,255,0.12)', label: '☰ Planning' },
}

const SORT_OPTS = ['Last Updated', 'Title A-Z', 'Rating ↓', 'Year ↓']

export default function MyListPage({ onAnimeClick, onWatch }: MyListPageProps) {
  const { isAuthenticated } = useAuth()
  const {
    listEntries,
    favoriteAnimeList,
    bookmarkAnimeList,
    toggleFavorite,
    toggleBookmark,
    removeFromList,
    updateListEntry,
    isDataLoading
  } = useApp()

  const [activeTab, setActiveTab] = useState<TabType>('Favorites')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('Last Updated')
  const [search, setSearch] = useState('')

  const allLibraryEntries = Object.values(listEntries)

  // Current list items depending on tab
  const rawTabItems = useMemo(() => {
    if (activeTab === 'Favorites') {
      return favoriteAnimeList
    }
    if (activeTab === 'Bookmarks') {
      return bookmarkAnimeList
    }
    return allLibraryEntries.filter(e => e.status === activeTab).map(e => e.anime)
  }, [activeTab, favoriteAnimeList, bookmarkAnimeList, allLibraryEntries])

  // Filter & sort
  const currentAnimeList = useMemo(() => {
    let list = rawTabItems.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    if (sortBy === 'Title A-Z') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    else if (sortBy === 'Rating ↓') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sortBy === 'Year ↓') list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0))
    return list
  }, [rawTabItems, search, sortBy])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ paddingTop: 80 }}>
        <div className="p-8 rounded-3xl text-center max-w-md w-full" style={{ background: '#111216', border: '1px solid #23252b' }}>
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold mb-2 text-white">Sign In Required</h2>
          <p className="text-sm text-gray-400 mb-6">Please log in to your Aniflux account to view and manage your Favorites, Bookmarks, and Library.</p>
          <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = 'login' }} className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}>
            Go to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: 80 }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">My Library</h1>
            <p className="text-sm mt-1" style={{ color: '#a0a0a0' }}>
              Saved anime, favorites, and watch lists
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Favorites', value: favoriteAnimeList.length, color: '#ff4db8' },
            { label: 'Bookmarks', value: bookmarkAnimeList.length, color: '#6d3bff' },
            { label: 'Completed', value: allLibraryEntries.filter(e => e.status === 'Completed').length, color: '#22c55e' },
            { label: 'Watching', value: allLibraryEntries.filter(e => e.status === 'Watching').length, color: '#4a8dff' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-2xl text-center" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Status & Favorites/Bookmarks tabs */}
        <div className="flex border-b mb-5 overflow-x-auto scrollbar-hide" style={{ borderColor: '#23252b' }}>
          {(Object.keys(statusConfig) as TabType[]).map(tab => {
            let count = 0
            if (tab === 'Favorites') count = favoriteAnimeList.length
            else if (tab === 'Bookmarks') count = bookmarkAnimeList.length
            else count = allLibraryEntries.filter(e => e.status === tab).length

            const cfg = statusConfig[tab]
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 transition-all border-b-2 cursor-pointer"
                style={{
                  color: activeTab === tab ? cfg.color : '#a0a0a0',
                  borderColor: activeTab === tab ? cfg.color : 'transparent'
                }}
              >
                {cfg.label}
                <span
                  className="min-w-[20px] text-center text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: activeTab === tab ? cfg.bg : '#1b1d23',
                    color: activeTab === tab ? cfg.color : '#6b6b6b'
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <div className="flex-1 min-w-0 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#a0a0a0' }}><SearchIcon /></div>
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#111216', border: '1px solid #23252b', color: 'white' }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: '#111216', border: '1px solid #23252b', color: '#a0a0a0' }}
          >
            {SORT_OPTS.map(s => <option key={s} value={s} style={{ background: '#111216' }}>{s}</option>)}
          </select>
          <button
            onClick={() => setView('grid')}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            style={{ background: view === 'grid' ? '#6d3bff' : '#111216', border: '1px solid #23252b', color: view === 'grid' ? 'white' : '#a0a0a0' }}
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setView('list')}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            style={{ background: view === 'list' ? '#6d3bff' : '#111216', border: '1px solid #23252b', color: view === 'list' ? 'white' : '#a0a0a0' }}
          >
            <ListIcon />
          </button>
        </div>

        {/* Loading State */}
        {isDataLoading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium" style={{ color: '#a0a0a0' }}>Loading your saved library...</p>
          </div>
        ) : currentAnimeList.length === 0 ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl mb-2">{activeTab === 'Favorites' ? '❤️' : activeTab === 'Bookmarks' ? '🔖' : '📭'}</span>
            <p className="font-bold text-lg text-white">No {activeTab.toLowerCase()} yet</p>
            <p className="text-sm max-w-sm" style={{ color: '#a0a0a0' }}>
              {search
                ? `No results matching "${search}"`
                : activeTab === 'Favorites'
                ? 'Start exploring anime and add your favorites here.'
                : activeTab === 'Bookmarks'
                ? 'Your bookmarked anime will appear here.'
                : 'Browse anime and add them to your watchlist.'}
            </p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentAnimeList.map(anime => (
              <AnimeCard key={anime.id} anime={anime} onClick={onAnimeClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {currentAnimeList.map(anime => (
              <ListItem
                key={anime.id}
                anime={anime}
                activeTab={activeTab}
                onAnimeClick={onAnimeClick}
                onWatch={onWatch}
                onRemoveFav={() => toggleFavorite(anime.id)}
                onRemoveBm={() => toggleBookmark(anime.id)}
                onRemoveLib={() => removeFromList(anime.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="h-20 md:h-10" />
    </div>
  )
}

function ListItem({
  anime,
  activeTab,
  onAnimeClick,
  onWatch,
  onRemoveFav,
  onRemoveBm,
  onRemoveLib
}: {
  anime: Anime
  activeTab: TabType
  onAnimeClick: (a: Anime) => void
  onWatch: (a: Anime) => void
  onRemoveFav: () => void
  onRemoveBm: () => void
  onRemoveLib: () => void
}) {
  return (
    <div className="p-3 rounded-xl transition-all hover:bg-white/[0.02]" style={{ background: '#111216', border: '1px solid #23252b' }}>
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-12 h-16 rounded-xl overflow-hidden cursor-pointer" onClick={() => onAnimeClick(anime)}>
          <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <button className="text-sm font-semibold truncate block text-left text-white hover:text-purple-400 transition-colors cursor-pointer" onClick={() => onAnimeClick(anime)}>{anime.title}</button>
          <p className="text-xs mt-0.5 truncate" style={{ color: '#a0a0a0' }}>{anime.studio} · {anime.year}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-amber-400">★ {anime.rating}</span>
            <span className="text-xs text-gray-500">· {anime.episodes} eps</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => onWatch(anime)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.25)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg>
          </button>
          <button
            onClick={() => {
              if (activeTab === 'Favorites') onRemoveFav()
              else if (activeTab === 'Bookmarks') onRemoveBm()
              else onRemoveLib()
            }}
            title="Remove"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            style={{ background: '#1b1d23', color: '#a0a0a0', border: '1px solid #23252b' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5l.5-7"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/></svg>
const GridIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
const ListIcon = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h10M2 7h10M2 11h10"/></svg>
