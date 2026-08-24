import { useState, useMemo } from 'react'
import { animeData, type Anime, type AnimeType } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'

interface Props { onAnimeClick: (anime: Anime) => void }

const GENRE_OPTS = ['Action', 'Fantasy', 'Romance', 'Sci-Fi', 'Comedy', 'Isekai', 'Mystery', 'Drama', 'Slice of Life', 'Horror', 'Sports', 'Supernatural', 'Mecha', 'Psychological', 'Historical', 'Music', 'Magic', 'Military', 'School', 'Adventure', 'Thriller']
const YEAR_OPTS = ['2024', '2023', '2022', '2021', '2020']
const SEASON_OPTS = ['Winter', 'Spring', 'Summer', 'Fall']
const STATUS_OPTS = ['Airing', 'Completed', 'Upcoming']
const SORT_OPTS = ['Rating ↓', 'MAL Score ↓', 'Popularity ↑', 'Members ↓', 'Year ↓', 'Title A-Z', 'Episodes ↓']
const TYPE_OPTS: (AnimeType | 'All')[] = ['All', 'TV', 'Movie', 'OVA', 'ONA']
const PER_PAGE = 18

export default function AnimeListPage({ onAnimeClick }: Props) {
  const [search, setSearch] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [year, setYear] = useState('')
  const [season, setSeason] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState<AnimeType | 'All'>('All')
  const [sort, setSort] = useState('Rating ↓')
  const [scoreMin, setScoreMin] = useState(0)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const { animeList, bookmarks, toggleBookmark } = useApp()

  const toggleGenre = (g: string) => { setPage(1); setGenres(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]) }

  const allFiltered = useMemo(() => {
    let list = [...animeList]
    if (search) list = list.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.studio.toLowerCase().includes(search.toLowerCase()) || a.genres.some(g => g.toLowerCase().includes(search.toLowerCase())))
    if (genres.length) list = list.filter(a => genres.every(g => a.genres.includes(g)))
    if (year) list = list.filter(a => String(a.year) === year)
    if (season) list = list.filter(a => a.season === season)
    if (status) list = list.filter(a => a.status === status)
    if (type !== 'All') list = list.filter(a => a.type === type)
    if (scoreMin > 0) list = list.filter(a => a.rating >= scoreMin)
    if (sort === 'Rating ↓') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'MAL Score ↓') list.sort((a, b) => b.malScore - a.malScore)
    else if (sort === 'Popularity ↑') list.sort((a, b) => a.popularity - b.popularity)
    else if (sort === 'Members ↓') list.sort((a, b) => b.membersK - a.membersK)
    else if (sort === 'Year ↓') list.sort((a, b) => b.year - a.year)
    else if (sort === 'Title A-Z') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'Episodes ↓') list.sort((a, b) => b.episodes - a.episodes)
    return list
  }, [animeList, search, genres, year, season, status, type, scoreMin, sort])

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PER_PAGE))
  const paged = allFiltered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const hasFilters = genres.length > 0 || !!year || !!season || !!status || scoreMin > 0 || type !== 'All'
  const clearAll = () => { setGenres([]); setYear(''); setSeason(''); setStatus(''); setScoreMin(0); setType('All'); setPage(1) }

  const filterCount = genres.length + (year ? 1 : 0) + (season ? 1 : 0) + (status ? 1 : 0) + (scoreMin > 0 ? 1 : 0) + (type !== 'All' ? 1 : 0)

  return (
    <div className="min-h-screen" style={{ paddingTop: 80 }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">Browse Anime</h1>
            <p className="text-sm mt-0.5" style={{ color: '#5a5a5a' }}>{allFiltered.length} titles{search ? ` matching "${search}"` : ''}</p>
          </div>
          <div className="flex gap-2">
            <ViewBtn active={view === 'grid'} onClick={() => setView('grid')}><GridIcon /></ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')}><ListIcon /></ViewBtn>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block shrink-0 w-52">
            <Sidebar genres={genres} toggleGenre={toggleGenre} year={year} setYear={(v: string) => { setYear(v); setPage(1) }} season={season} setSeason={(v: string) => { setSeason(v); setPage(1) }} status={status} setStatus={(v: string) => { setStatus(v); setPage(1) }} scoreMin={scoreMin} setScoreMin={(v: number) => { setScoreMin(v); setPage(1) }} hasFilters={hasFilters} clearAll={clearAll} />
          </aside>

          <div className="flex-1 min-w-0">
            {/* Search + controls */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-0">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a5a' }}><SearchIcon /></div>
                <input type="text" placeholder="Search titles, genres, studios..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none bg-transparent"
                  style={{ background: '#111216', border: '1px solid #23252b', color: 'white' }} />
              </div>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} className="px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer shrink-0" style={{ background: '#111216', border: '1px solid #23252b', color: '#9a9a9a' }}>
                {SORT_OPTS.map(s => <option key={s} value={s} style={{ background: '#111216' }}>{s}</option>)}
              </select>
              <button onClick={() => setFilterOpen(true)} className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: hasFilters ? 'rgba(109,59,255,0.2)' : '#111216', border: `1px solid ${hasFilters ? '#6d3bff55' : '#23252b'}`, color: hasFilters ? '#6d3bff' : '#9a9a9a' }}>
                <FilterIcon /> {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
              </button>
            </div>

            {/* Type tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
              {TYPE_OPTS.map(t => (
                <button key={t} onClick={() => { setType(t); setPage(1) }} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
                  style={{ background: type === t ? '#6d3bff' : '#111216', color: type === t ? 'white' : '#5a5a5a', border: `1px solid ${type === t ? '#6d3bff' : '#23252b'}` }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Active chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {genres.map(g => <FilterChip key={g} label={g} color="#6d3bff" onRemove={() => toggleGenre(g)} />)}
                {year && <FilterChip label={year} color="#4a8dff" onRemove={() => { setYear(''); setPage(1) }} />}
                {season && <FilterChip label={season} color="#ff4db8" onRemove={() => { setSeason(''); setPage(1) }} />}
                {status && <FilterChip label={status} color="#22c55e" onRemove={() => { setStatus(''); setPage(1) }} />}
                {type !== 'All' && <FilterChip label={type} color="#f59e0b" onRemove={() => { setType('All'); setPage(1) }} />}
                {scoreMin > 0 && <FilterChip label={`≥${scoreMin} score`} color="#a855f7" onRemove={() => { setScoreMin(0); setPage(1) }} />}
                <button onClick={clearAll} className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:text-red-400" style={{ color: '#5a5a5a' }}>Clear all</button>
              </div>
            )}

            {/* Grid / List */}
            {paged.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <span className="text-6xl">🔎</span>
                <p className="text-lg font-semibold">No results found</p>
                <p className="text-sm" style={{ color: '#5a5a5a' }}>Try adjusting your filters or search term</p>
                {hasFilters && <button onClick={clearAll} className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: '#6d3bff', color: 'white' }}>Clear filters</button>}
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {paged.map(a => <BrowseCard key={a.id} anime={a} bookmarked={bookmarks.has(a.id)} onToggleBookmark={() => toggleBookmark(a.id)} onClick={() => onAnimeClick(a)} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="hidden sm:grid px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ gridTemplateColumns: '1fr 72px 80px 64px 96px', color: '#3a3a3a' }}>
                  <span>Title</span><span className="text-center">Type</span><span className="text-center">Episodes</span><span className="text-center">Rating</span><span className="text-center">Status</span>
                </div>
                {paged.map((a, idx) => <ListRowItem key={a.id} anime={a} rank={(page - 1) * PER_PAGE + idx + 1} bookmarked={bookmarks.has(a.id)} onToggleBookmark={() => toggleBookmark(a.id)} onClick={() => onAnimeClick(a)} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</PageBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2).reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, []).map((p, i) =>
                  p === '…' ? <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: '#3a3a3a' }}>…</span>
                    : <PageBtn key={p} active={page === p} onClick={() => setPage(p as number)}>{p}</PageBtn>
                )}
                <PageBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</PageBtn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end fade-in" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setFilterOpen(false)}>
          <div className="w-full rounded-t-3xl p-5 overflow-y-auto slide-in" style={{ background: '#111216', border: '1px solid #23252b', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Filters</h2>
              <button onClick={() => setFilterOpen(false)} style={{ color: '#5a5a5a' }}>✕</button>
            </div>
            <Sidebar genres={genres} toggleGenre={toggleGenre} year={year} setYear={(v: string) => { setYear(v); setPage(1) }} season={season} setSeason={(v: string) => { setSeason(v); setPage(1) }} status={status} setStatus={(v: string) => { setStatus(v); setPage(1) }} scoreMin={scoreMin} setScoreMin={(v: number) => { setScoreMin(v); setPage(1) }} hasFilters={hasFilters} clearAll={clearAll} />
            <button onClick={() => setFilterOpen(false)} className="w-full mt-5 py-3 rounded-xl font-bold text-sm" style={{ background: '#6d3bff', color: 'white' }}>
              Show {allFiltered.length} results
            </button>
          </div>
        </div>
      )}
      <div className="h-20 md:h-10" />
    </div>
  )
}

interface SidebarProps { genres: string[]; toggleGenre: (g: string) => void; year: string; setYear: (v: string) => void; season: string; setSeason: (v: string) => void; status: string; setStatus: (v: string) => void; scoreMin: number; setScoreMin: (v: number) => void; hasFilters: boolean; clearAll: () => void }
function Sidebar({ genres, toggleGenre, year, setYear, season, setSeason, status, setStatus, scoreMin, setScoreMin, hasFilters, clearAll }: SidebarProps) {
  return (
    <div className="flex flex-col gap-5">
      {hasFilters && <button onClick={clearAll} className="text-xs font-semibold text-left" style={{ color: '#ef4444' }}>Clear all filters</button>}
      <FilterSection title="Genres">
        <div className="flex flex-wrap gap-1.5">
          {GENRE_OPTS.map(g => (
            <button key={g} onClick={() => toggleGenre(g)} className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ background: genres.includes(g) ? '#6d3bff' : '#1b1d23', color: genres.includes(g) ? 'white' : '#5a5a5a', border: `1px solid ${genres.includes(g) ? '#6d3bff' : '#23252b'}` }}>
              {g}
            </button>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Year">
        <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: '#1b1d23', border: '1px solid #23252b', color: year ? 'white' : '#5a5a5a' }}>
          <option value="" style={{ background: '#111216' }}>Any year</option>
          {YEAR_OPTS.map(y => <option key={y} value={y} style={{ background: '#111216' }}>{y}</option>)}
        </select>
      </FilterSection>
      <FilterSection title="Season">
        <div className="grid grid-cols-2 gap-1.5">
          {SEASON_OPTS.map(s => (
            <button key={s} onClick={() => setSeason(season === s ? '' : s)} className="py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: season === s ? '#6d3bff' : '#1b1d23', color: season === s ? 'white' : '#5a5a5a', border: `1px solid ${season === s ? '#6d3bff' : '#23252b'}` }}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Status">
        {STATUS_OPTS.map(s => (
          <button key={s} onClick={() => setStatus(status === s ? '' : s)} className="w-full py-2 px-3 rounded-lg text-xs font-medium text-left mb-1 transition-all"
            style={{ background: status === s ? 'rgba(109,59,255,0.18)' : '#1b1d23', color: status === s ? '#6d3bff' : '#5a5a5a', border: `1px solid ${status === s ? '#6d3bff44' : '#23252b'}` }}>
            {s}
          </button>
        ))}
      </FilterSection>
      <FilterSection title={`Min Score: ${scoreMin > 0 ? scoreMin.toFixed(1) : 'Any'}`}>
        <input type="range" min="0" max="9.5" step="0.5" value={scoreMin} onChange={e => setScoreMin(Number(e.target.value))} className="w-full" style={{ accentColor: '#6d3bff' }} />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#3a3a3a' }}><span>0</span><span>9.5</span></div>
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#3a3a3a' }}>{title}</p>
      {children}
    </div>
  )
}

function FilterChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${color}1a`, color, border: `1px solid ${color}33` }}>
      {label}
      <button onClick={onRemove} className="opacity-70 hover:opacity-100 transition-opacity">✕</button>
    </span>
  )
}

function BrowseCard({ anime, bookmarked, onToggleBookmark, onClick }: { anime: Anime; bookmarked: boolean; onToggleBookmark: () => void; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="cursor-pointer group" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}>
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: '2/3', transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease', transform: hov ? 'translateY(-4px) scale(1.03)' : 'scale(1)', boxShadow: hov ? '0 18px 44px rgba(0,0,0,0.55)' : 'none' }}>
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, transparent 55%)' }} />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {anime.isNew && <span className="px-1 py-0.5 rounded text-xs font-bold" style={{ background: '#ff4db8', color: 'white', fontSize: 9 }}>NEW</span>}
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5"><svg width="9" height="9" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg><span style={{ fontSize: 11, fontWeight: 700 }}>{anime.rating}</span></div>
          <button onClick={e => { e.stopPropagation(); onToggleBookmark() }} className="w-6 h-6 rounded-md flex items-center justify-center transition-all" style={{ background: bookmarked ? '#6d3bff' : 'rgba(0,0,0,0.7)', color: bookmarked ? 'white' : '#9a9a9a' }}>
            <svg width="10" height="10" viewBox="0 0 14 16" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/></svg>
          </button>
        </div>
        {hov && <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'fadeIn 0.15s ease' }}><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.92)' }}><svg width="14" height="14" viewBox="0 0 14 14" fill="white"><path d="M4 2.5l7 4.5-7 4.5V2.5z"/></svg></div></div>}
      </div>
      <p className="text-xs font-semibold mt-2 truncate">{anime.title}</p>
      <p className="text-xs truncate" style={{ color: '#5a5a5a', fontSize: 10 }}>{anime.genres[0]} · {anime.year}</p>
    </div>
  )
}

function ListRowItem({ anime, rank, bookmarked, onToggleBookmark, onClick }: { anime: Anime; rank: number; bookmarked: boolean; onToggleBookmark: () => void; onClick: () => void }) {
  const statusColor = anime.status === 'Airing' ? '#6d3bff' : anime.status === 'Upcoming' ? '#f59e0b' : '#22c55e'
  return (
    <button className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.03] active:scale-[0.99]" style={{ background: '#111216', border: '1px solid #23252b' }} onClick={onClick}>
      <span className="text-sm font-mono shrink-0 w-7 text-center" style={{ color: '#3a3a3a' }}>{rank}</span>
      <div className="shrink-0 w-10 h-[60px] rounded-lg overflow-hidden"><img src={anime.poster} alt="" className="w-full h-full object-cover" style={{ background: '#1b1d23' }} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{anime.title}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#5a5a5a' }}>{anime.genres.slice(0, 3).join(' · ')}</p>
        <p className="text-xs mt-0.5" style={{ color: '#3a3a3a' }}>{anime.studio} · {anime.year}</p>
      </div>
      <span className="hidden sm:inline px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: statusColor + '18', color: statusColor, border: `1px solid ${statusColor}30` }}>{anime.type}</span>
      <span className="hidden sm:inline text-xs shrink-0 w-12 text-center" style={{ color: '#5a5a5a' }}>{anime.episodes} ep</span>
      <div className="hidden sm:flex items-center gap-1 shrink-0"><svg width="10" height="10" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg><span className="text-sm font-bold">{anime.rating}</span></div>
      <span className="hidden md:inline px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: statusColor + '18', color: statusColor }}>{anime.status}</span>
      <button onClick={e => { e.stopPropagation(); onToggleBookmark() }} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: bookmarked ? 'rgba(109,59,255,0.2)' : '#1b1d23', color: bookmarked ? '#6d3bff' : '#3a3a3a', border: `1px solid ${bookmarked ? '#6d3bff44' : '#23252b'}` }}>
        <svg width="11" height="11" viewBox="0 0 14 16" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/></svg>
      </button>
    </button>
  )
}

function ViewBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: active ? '#6d3bff' : '#111216', border: '1px solid #23252b', color: active ? 'white' : '#5a5a5a' }}>{children}</button>
}

function PageBtn({ active, disabled, onClick, children }: { active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} disabled={disabled} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all disabled:opacity-30" style={{ background: active ? '#6d3bff' : '#111216', color: active ? 'white' : '#5a5a5a', border: `1px solid ${active ? '#6d3bff' : '#23252b'}` }}>{children}</button>
}

const GridIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
const ListIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h10M2 7h10M2 11h10"/></svg>
const FilterIcon = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 2h12M3 7h8M5 12h4"/></svg>
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M11 11l2.5 2.5"/></svg>
