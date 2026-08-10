import { useState, useEffect } from 'react'
import { useApp, type ListStatus } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { type Anime } from '../data/animeData'

interface AnimeProfilePageProps {
  anime: Anime
  onBack: () => void
  onWatch: (anime: Anime) => void
  onAnimeClick: (anime: Anime) => void
}

const TABS = ['Overview', 'Episodes', 'Characters', 'Staff', 'Reviews', 'Recommendations']
const STATUS_OPTS: ListStatus[] = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch']
const STATUS_COLORS: Record<string, string> = {
  Watching: '#6d3bff',
  Completed: '#22c55e',
  'On Hold': '#f59e0b',
  Dropped: '#ef4444',
  'Plan to Watch': '#4a8dff',
  Favorites: '#ff4db8',
  Bookmarks: '#6d3bff'
}

const REVIEWS = [
  { user: 'OtakuCritic', score: 9, text: 'An absolute masterpiece of modern anime. The world-building is unlike anything I\'ve seen this decade. Every episode ends on a cliffhanger that leaves you desperately wanting more.', date: 'Jan 14, 2024', helpful: 234 },
  { user: 'AnimeScholar', score: 8, text: 'Exceptional animation quality from start to finish. The character development could use a bit more depth in the second cour, but overall a highly recommended watch for any fan of the genre.', date: 'Dec 28, 2023', helpful: 89 },
  { user: 'SakuraBlossom', score: 10, text: 'I rarely give 10s but this deserves every point. The soundtrack alone is worth the watch — one of the best musical scores in recent memory. The finale absolutely destroyed me.', date: 'Feb 2, 2024', helpful: 156 },
]

export default function AnimeProfilePage({ anime: initialAnime, onBack, onWatch, onAnimeClick }: AnimeProfilePageProps) {
  const [animeDataObj, setAnimeDataObj] = useState<Anime>(initialAnime)
  const [activeTab, setActiveTab] = useState('Overview')
  const [listMenuOpen, setListMenuOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()
  const { getListStatus, addToList, removeFromList, bookmarks, favorites, toggleBookmark, toggleFavorite } = useApp()

  const anime = animeDataObj
  const listStatus = getListStatus(anime.id)
  const bookmarked = bookmarks.has(anime.id)
  const favorited = favorites.has(anime.id)

  // Fetch real details from backend DB on mount or when anime ID changes
  useEffect(() => {
    let isMounted = true
    async function loadBackendDetails() {
      setIsLoadingDetails(true)
      setDetailsError(null)
      try {
        const res = await fetch(`/api/anime/${initialAnime.id}`, { credentials: 'include' })
        if (res.ok) {
          const json = await res.json()
          if (isMounted && json.anime) {
            setAnimeDataObj(json.anime)
          }
        }
      } catch (err: any) {
        if (isMounted) setDetailsError(err.message || 'Failed to load details')
      } finally {
        if (isMounted) setIsLoadingDetails(false)
      }
    }
    loadBackendDetails()
  }, [initialAnime.id])

  useEffect(() => { setActiveTab('Overview') }, [anime.id])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleToggleFav = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add to favorites')
      return
    }
    const success = await toggleFavorite(anime.id)
    if (success) {
      showToast(favorited ? 'Removed from favorites' : 'Added to favorites')
    }
  }

  const handleToggleBm = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to bookmark anime')
      return
    }
    const success = await toggleBookmark(anime.id)
    if (success) {
      showToast(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    }
  }

  const scoreRows = [
    { label: '10', pct: 32 }, { label: '9', pct: 28 }, { label: '8', pct: 20 },
    { label: '7', pct: 11 }, { label: '6', pct: 5 }, { label: '≤5', pct: 4 },
  ].map(r => ({ ...r, pct: Math.round(r.pct * ((anime.malScore || 8.5) / 10) * 1.1) }))

  return (
    <div className="min-h-screen relative" style={{ background: '#09090b' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-2xl flex items-center gap-2 slide-in" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span>✨ {toastMsg}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ height: 420, marginTop: 64 }}>
        <img src={anime.banner || anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.3)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,0.2) 0%, rgba(9,9,11,0.8) 70%, #09090b 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.6) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: `radial-gradient(ellipse, rgba(109,59,255,0.2) 0%, transparent 70%)` }} />

        <button
          onClick={onBack}
          className="absolute top-5 left-5 flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all hover:bg-white/10 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', backdropFilter: 'blur(8px)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
          Back
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 -mt-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] gap-8">
          {/* Left — poster + actions */}
          <div>
            <div className="sticky" style={{ top: 88 }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl mb-5" style={{ aspectRatio: '2/3', border: '2px solid #23252b' }}>
                <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
              </div>

              {/* Watch button */}
              <button
                onClick={() => onWatch(anime)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mb-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6d3bff, #4a8dff)', color: 'white', boxShadow: '0 8px 28px rgba(109,59,255,0.38)' }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="white"><path d="M4 2.5l9 5-9 5V2.5z"/></svg>
                Watch Now
              </button>

              {/* Add to List */}
              <div className="relative mb-2">
                <button
                  onClick={() => setListMenuOpen(!listMenuOpen)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    background: listStatus ? `${STATUS_COLORS[listStatus]}18` : '#1b1d23',
                    border: `1px solid ${listStatus ? STATUS_COLORS[listStatus] + '44' : '#23252b'}`,
                    color: listStatus ? STATUS_COLORS[listStatus] : '#9a9a9a',
                  }}
                >
                  {listStatus ? <CheckIcon /> : <PlusIcon />}
                  {listStatus ?? 'Add to List'}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="ml-auto"><path d="M2 4l4 4 4-4"/></svg>
                </button>
                {listMenuOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-hidden shadow-2xl slide-in" style={{ background: '#16181f', border: '1px solid #23252b', zIndex: 20 }}>
                    {STATUS_OPTS.map(opt => (
                      <button key={opt} className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2.5 transition-all hover:bg-white/5 cursor-pointer" style={{ color: listStatus === opt ? STATUS_COLORS[opt] : '#9a9a9a' }}
                        onClick={() => {
                          if (!isAuthenticated) { showToast('Please sign in to manage your list'); setListMenuOpen(false); return }
                          addToList(anime, opt); setListMenuOpen(false); showToast(`Set status to ${opt}`)
                        }}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[opt] }} />{opt}
                        {listStatus === opt && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ml-auto"><path d="M2 6l3 3 5-5"/></svg>}
                      </button>
                    ))}
                    {listStatus && (
                      <>
                        <div className="h-px mx-3" style={{ background: '#23252b' }} />
                        <button className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2.5 transition-all hover:bg-red-500/10 cursor-pointer" style={{ color: '#ef4444' }}
                          onClick={() => { removeFromList(anime.id); setListMenuOpen(false); showToast('Removed from list') }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5l.5-7"/></svg>
                          Remove from List
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-5">
                <button
                  onClick={handleToggleFav}
                  title="Favorite"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: favorited ? 'rgba(255,77,184,0.15)' : '#1b1d23', border: `1px solid ${favorited ? 'rgba(255,77,184,0.4)' : '#23252b'}`, color: favorited ? '#ff4db8' : '#9a9a9a' }}
                >
                  <HeartIcon filled={favorited} />
                </button>
                <button
                  onClick={handleToggleBm}
                  title="Bookmark"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: bookmarked ? 'rgba(109,59,255,0.15)' : '#1b1d23', border: `1px solid ${bookmarked ? 'rgba(109,59,255,0.4)' : '#23252b'}`, color: bookmarked ? '#6d3bff' : '#9a9a9a' }}
                >
                  <BookmarkIcon filled={bookmarked} />
                </button>
                <button
                  onClick={() => showToast('Share link copied to clipboard!')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5 cursor-pointer"
                  style={{ background: '#1b1d23', border: '1px solid #23252b', color: '#9a9a9a' }}
                >
                  <ShareIcon />
                </button>
              </div>

              {/* Info table */}
              <div className="p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4a4a4a' }}>Information</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    ['Type', anime.type], ['Studio', anime.studio], ['Producer', anime.producer],
                    ['Season', `${anime.season} ${anime.year}`], ['Episodes', `${anime.episodes} eps`],
                    ['Duration', anime.duration], ['Status', anime.status],
                    ['Source', anime.source], ['Rating', anime.contentRating],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-xs shrink-0" style={{ color: '#5a5a5a' }}>{k}</span>
                      <span className="text-xs font-medium text-right truncate text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — content */}
          <div>
            {/* Title */}
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: anime.status === 'Airing' ? 'rgba(109,59,255,0.2)' : anime.status === 'Upcoming' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)', color: anime.status === 'Airing' ? '#6d3bff' : anime.status === 'Upcoming' ? '#f59e0b' : '#22c55e', border: `1px solid ${anime.status === 'Airing' ? 'rgba(109,59,255,0.35)' : anime.status === 'Upcoming' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.25)'}` }}>
                  {anime.status}
                </span>
                {anime.isNew && <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,77,184,0.15)', color: '#ff4db8', border: '1px solid rgba(255,77,184,0.3)' }}>New Episode</span>}
                {anime.isDub && <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(74,141,255,0.15)', color: '#4a8dff', border: '1px solid rgba(74,141,255,0.3)' }}>DUB</span>}
              </div>
              <h1 className="font-black leading-none mb-1.5 text-white" style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', letterSpacing: '-0.025em' }}>{anime.title}</h1>
              {anime.titleJp && <p className="text-base" style={{ color: '#888', fontStyle: 'italic' }}>{anime.titleJp}</p>}
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <ScoreCard label="Rating" value={`${anime.rating}`} sub="Community Score" icon="⭐" accent="#f59e0b" />
              <ScoreCard label="MAL" value={`${anime.malScore}`} sub="MyAnimeList" icon="📊" accent="#4a8dff" />
              <ScoreCard label="Rank" value={`#${anime.popularity}`} sub="Popularity" icon="🔥" accent="#ff4db8" />
              <ScoreCard label="Members" value={`${(anime.membersK / 1000).toFixed(1)}M`} sub="Tracking" icon="👥" accent="#6d3bff" />
            </div>

            {/* Genres + Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {anime.genres.map(g => (
                <span key={g} className="px-3 py-1.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-purple-600/20" style={{ background: 'rgba(109,59,255,0.1)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.22)' }}>{g}</span>
              ))}
              {anime.tags.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-xl text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#a0a0a0', border: '1px solid #23252b' }}>{t}</span>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-5 overflow-x-auto scrollbar-hide" style={{ borderColor: '#23252b' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-2.5 text-sm font-semibold shrink-0 transition-all border-b-2 cursor-pointer"
                  style={{ color: activeTab === tab ? '#6d3bff' : '#5a5a5a', borderColor: activeTab === tab ? '#6d3bff' : 'transparent' }}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Overview' && (
              <div className="fade-in flex flex-col gap-6">
                <p className="text-sm leading-7" style={{ color: '#b0b0b0' }}>{anime.synopsis}</p>

                <div className="p-5 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#4a4a4a' }}>Score Distribution</p>
                  <div className="flex flex-col gap-2.5">
                    {scoreRows.map(({ label, pct }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs font-mono w-5 text-right tabular-nums" style={{ color: '#5a5a5a' }}>{label}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1b1d23' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg, #6d3bff, #4a8dff)', transition: 'width 0.8s cubic-bezier(.22,.68,0,1)' }} />
                        </div>
                        <span className="text-xs tabular-nums w-7 text-right" style={{ color: '#5a5a5a' }}>{Math.min(pct, 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Episodes' && (
              <div className="fade-in">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <p className="text-sm" style={{ color: '#a0a0a0' }}>{anime.episodes} episodes available</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {(anime.episodeTitles || []).slice(0, 12).map((title, i) => (
                    <button key={i} className="flex items-center gap-4 p-3 rounded-xl text-left transition-all hover:bg-white/5 active:scale-[0.99] cursor-pointer" style={{ background: '#111216', border: '1px solid #23252b' }} onClick={() => onWatch(anime)}>
                      <div className="relative shrink-0 w-24 h-[54px] rounded-lg overflow-hidden">
                        <img src={anime.banner || anime.poster} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.45)', background: '#1b1d23' }} />
                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.9)' }}><svg width="9" height="9" viewBox="0 0 9 9" fill="white"><path d="M2 1l6 3.5L2 8V1z"/></svg></div></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>Episode {i + 1} · {anime.duration} · HD</p>
                      </div>
                      <div className="hidden sm:flex gap-1 shrink-0">
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.25)' }}>SUB</span>
                        {anime.isDub && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(74,141,255,0.15)', color: '#4a8dff', border: '1px solid rgba(74,141,255,0.25)' }}>DUB</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Characters' && (
              <div className="fade-in grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(anime.characters || []).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0 text-white" style={{ background: `hsl(${i * 55 + 220}, 60%, 25%)`, border: '2px solid rgba(255,255,255,0.05)' }}>{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-white">{c.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>{c.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: '#5a5a5a' }}>Voice</p>
                      <p className="text-xs font-semibold text-white">{c.va}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Staff' && (
              <div className="fade-in grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(anime.staff || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0" style={{ background: 'rgba(109,59,255,0.12)', color: '#6d3bff' }}>{s.name[0]}</div>
                    <div><p className="text-sm font-semibold text-white">{s.name}</p><p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>{s.role}</p></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="fade-in flex flex-col gap-4">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="p-5 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background: `hsl(${i * 80 + 200}, 55%, 28%)` }}>{r.user[0]}</div>
                        <div><p className="text-sm font-semibold text-white">{r.user}</p><p className="text-xs" style={{ color: '#5a5a5a' }}>{r.date}</p></div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                        <StarMini /><span className="text-sm font-black" style={{ color: '#f59e0b' }}>{r.score}/10</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#b0b0b0' }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-24 md:h-12" />
    </div>
  )
}

function ScoreCard({ label, value, sub, icon, accent }: { label: string; value: string; sub: string; icon: string; accent: string }) {
  return (
    <div className="p-4 rounded-2xl flex flex-col items-center text-center" style={{ background: '#111216', border: '1px solid #23252b' }}>
      <span className="text-xl mb-1">{icon}</span>
      <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5 text-white">{label}</p>
      <p className="text-xs mt-0.5" style={{ color: '#5a5a5a', fontSize: 10 }}>{sub}</p>
    </div>
  )
}

const StarMini = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg>
const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
const CheckIcon = () => <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
const HeartIcon = ({ filled }: { filled: boolean }) => <svg width="15" height="15" viewBox="0 0 16 16" fill={filled ? '#ff4db8' : 'none'} stroke={filled ? '#ff4db8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 13.5s-6-3.8-6-7.5a4 4 0 0 1 6-3.4A4 4 0 0 1 14 6c0 3.7-6 7.5-6 7.5z"/></svg>
const BookmarkIcon = ({ filled }: { filled: boolean }) => <svg width="15" height="15" viewBox="0 0 16 16" fill={filled ? '#6d3bff' : 'none'} stroke={filled ? '#6d3bff' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h8a1 1 0 0 1 1 1v11l-5-2.5L3 14V3a1 1 0 0 1 1-1z"/></svg>
const ShareIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="1.5"/><circle cx="13" cy="12" r="1.5"/><circle cx="3" cy="8" r="1.5"/><path d="M4.5 8.5l7-3.5M4.5 8l7 3"/></svg>
