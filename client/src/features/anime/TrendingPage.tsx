import { useState } from 'react'
import { animeData, type Anime } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'

interface Props { onAnimeClick: (a: Anime) => void; onWatch: (a: Anime) => void }

const PERIODS = ['Today', 'This Week', 'This Month', 'All Time']

const rankBg = (r: number) => r === 1 ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : r === 2 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : r === 3 ? 'linear-gradient(135deg,#cd7c3a,#92400e)' : '#1b1d23'

export default function TrendingPage({ onAnimeClick, onWatch }: Props) {
  const [period, setPeriod] = useState('This Week')
  const [layout, setLayout] = useState<'list' | 'grid'>('list')
  const { animeList, bookmarks, toggleBookmark, addToList } = useApp()

  const sorted = [...animeList].sort((a, b) => b.membersK - a.membersK)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3, 20)

  return (
    <div className="min-h-screen" style={{ paddingTop: 80 }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🔥 Trending</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#5a5a5a' }}>What the community is watching right now</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: period === p ? '#6d3bff' : 'transparent', color: period === p ? 'white' : '#5a5a5a' }}>{p}</button>
              ))}
            </div>
            <button onClick={() => setLayout(l => l === 'list' ? 'grid' : 'list')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#111216', border: '1px solid #23252b', color: '#5a5a5a' }}>
              {layout === 'list' ? <GridIcon /> : <ListIcon />}
            </button>
          </div>
        </div>

        {/* Podium top-3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {top3.map((a, i) => (
            <PodiumCard key={a.id} anime={a} rank={i + 1} bookmarked={bookmarks.has(a.id)} onToggleBookmark={() => toggleBookmark(a.id)} onClick={() => onAnimeClick(a)} onWatch={() => onWatch(a)} onAddToList={() => addToList(a, 'Plan to Watch')} />
          ))}
        </div>

        {/* Rest list / grid */}
        {layout === 'list' ? (
          <div className="flex flex-col gap-2">
            <div className="hidden sm:grid px-4 pb-2 text-xs font-bold uppercase tracking-widest" style={{ gridTemplateColumns: '36px 56px 1fr 80px 100px 80px 80px', color: '#3a3a3a' }}>
              <span>#</span><span></span><span>Title</span><span className="text-center">Members</span><span className="text-center">Genres</span><span className="text-center">Rating</span><span className="text-center">Actions</span>
            </div>
            {rest.map((a, i) => <TrendRow key={a.id} anime={a} rank={i + 4} bookmarked={bookmarks.has(a.id)} onToggleBookmark={() => toggleBookmark(a.id)} onClick={() => onAnimeClick(a)} onWatch={() => onWatch(a)} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rest.map((a, i) => <TrendGridCard key={a.id} anime={a} rank={i + 4} bookmarked={bookmarks.has(a.id)} onToggleBookmark={() => toggleBookmark(a.id)} onClick={() => onAnimeClick(a)} />)}
          </div>
        )}
      </div>
      <div className="h-20 md:h-10" />
    </div>
  )
}

function PodiumCard({ anime, rank, bookmarked, onToggleBookmark, onClick, onWatch, onAddToList }: { anime: Anime; rank: number; bookmarked: boolean; onToggleBookmark: () => void; onClick: () => void; onWatch: () => void; onAddToList: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="relative overflow-hidden rounded-2xl cursor-pointer" style={{ aspectRatio: rank === 1 ? '16/10' : '16/12', transition: 'transform 0.25s ease, box-shadow 0.25s ease', transform: hov ? 'translateY(-4px)' : 'none', boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.3)' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      <img src={anime.banner} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.3) 60%, transparent 100%)' }} />
      <div className="absolute top-3 left-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: rankBg(rank), color: rank <= 3 ? 'white' : '#9a9a9a', boxShadow: rank <= 3 ? '0 4px 12px rgba(0,0,0,0.4)' : 'none' }}>#{rank}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleBookmark() }} className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bookmarked ? '#6d3bff' : 'rgba(0,0,0,0.6)', color: bookmarked ? 'white' : '#9a9a9a' }}>
        <BookmarkIcon filled={bookmarked} />
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="font-bold text-sm truncate mb-0.5">{anime.title}</p>
        <p className="text-xs truncate mb-3" style={{ color: '#9a9a9a' }}>{anime.genres.slice(0, 2).join(' · ')} · {anime.year}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-auto"><svg width="11" height="11" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg><span className="text-sm font-bold">{anime.rating}</span></div>
          <button onClick={e => { e.stopPropagation(); onAddToList() }} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(109,59,255,0.25)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.35)' }}>+ List</button>
          <button onClick={e => { e.stopPropagation(); onWatch() }} className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#6d3bff', color: 'white' }}>Watch</button>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 text-xs font-semibold" style={{ color: '#5a5a5a' }}>{anime.membersK}k members</div>
    </div>
  )
}

function TrendRow({ anime, rank, bookmarked, onToggleBookmark, onClick, onWatch }: { anime: Anime; rank: number; bookmarked: boolean; onToggleBookmark: () => void; onClick: () => void; onWatch: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="grid items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors" style={{ gridTemplateColumns: '36px 56px 1fr 80px 100px 80px 80px', background: hov ? 'rgba(255,255,255,0.025)' : '#111216', border: '1px solid #23252b' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      <span className="text-sm font-mono text-center" style={{ color: rank <= 5 ? '#f59e0b' : '#3a3a3a' }}>#{rank}</span>
      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0"><img src={anime.poster} alt="" className="w-full h-full object-cover" /></div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{anime.title}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#5a5a5a' }}>{anime.studio} · {anime.year}</p>
        <p className="text-xs mt-0.5" style={{ color: '#3a3a3a' }}>{anime.episodes} episodes · {anime.type}</p>
      </div>
      <span className="hidden sm:block text-sm font-semibold text-center" style={{ color: '#4a8dff' }}>{anime.membersK}k</span>
      <div className="hidden sm:flex flex-wrap gap-1 justify-center">
        {anime.genres.slice(0, 2).map(g => <span key={g} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1b1d23', color: '#5a5a5a', fontSize: 10 }}>{g}</span>)}
      </div>
      <div className="hidden sm:flex items-center gap-1 justify-center"><svg width="10" height="10" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg><span className="text-sm font-bold">{anime.rating}</span></div>
      <div className="flex items-center gap-1.5 justify-end">
        <button onClick={e => { e.stopPropagation(); onWatch() }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.2)', color: '#6d3bff' }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg>
        </button>
        <button onClick={e => { e.stopPropagation(); onToggleBookmark() }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bookmarked ? 'rgba(109,59,255,0.2)' : '#1b1d23', color: bookmarked ? '#6d3bff' : '#5a5a5a', border: '1px solid #23252b' }}>
          <BookmarkIcon filled={bookmarked} />
        </button>
      </div>
    </div>
  )
}

function TrendGridCard({ anime, rank, bookmarked, onToggleBookmark, onClick }: { anime: Anime; rank: number; bookmarked: boolean; onToggleBookmark: () => void; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="cursor-pointer" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: '2/3', transition: 'transform 0.25s ease', transform: hov ? 'scale(1.03) translateY(-3px)' : 'scale(1)' }}>
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, transparent 55%)' }} />
        <div className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: rankBg(rank), color: rank <= 3 ? 'white' : '#9a9a9a' }}>#{rank}</div>
        <button onClick={e => { e.stopPropagation(); onToggleBookmark() }} className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bookmarked ? '#6d3bff' : 'rgba(0,0,0,0.65)', color: bookmarked ? 'white' : '#9a9a9a' }}>
          <BookmarkIcon filled={bookmarked} />
        </button>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5"><svg width="9" height="9" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg><span style={{ fontSize: 11, fontWeight: 700 }}>{anime.rating}</span></div>
          <span style={{ fontSize: 10, color: '#5a5a5a' }}>{anime.membersK}k</span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-1.5 truncate">{anime.title}</p>
      <p style={{ fontSize: 10, color: '#5a5a5a' }} className="truncate">{anime.genres[0]} · {anime.year}</p>
    </div>
  )
}

const BookmarkIcon = ({ filled }: { filled: boolean }) => <svg width="12" height="12" viewBox="0 0 14 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/></svg>
const GridIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
const ListIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h10M2 7h10M2 11h10"/></svg>
