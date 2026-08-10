import { useState, useRef, useEffect } from 'react'
import { animeData, type Anime } from '../data/animeData'
import { useApp } from '../context/AppContext'

interface WatchPageProps {
  anime: Anime
  onBack: () => void
  onAnimeClick: (anime: Anime) => void
}

const qualities = ['1080p', '720p', '480p', '360p']
const servers = ['VidStream', 'StreamSB', 'Doodstream', 'MyCloud']
const speeds = ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x']

export default function WatchPage({ anime, onBack, onAnimeClick }: WatchPageProps) {
  const { addHistory } = useApp()
  const [currentEp, setCurrentEp] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(80)
  const [quality, setQuality] = useState('1080p')
  const [server, setServer] = useState('VidStream')
  const [activeTab, setActiveTab] = useState('Episodes')
  const [comment, setComment] = useState('')

  const totalEps = anime.episodes

  useEffect(() => { addHistory(anime, currentEp) }, [anime.id, currentEp])

  const comments = [
    { user: 'KiritoFan99', text: 'This episode was absolutely insane! The animation quality is off the charts 🔥', time: '2h ago', likes: 142 },
    { user: 'AnimeQueen', text: 'The fight scene at 18:32 literally gave me chills. MAPPA did not miss!', time: '5h ago', likes: 89 },
    { user: 'SakuraBlossom', text: 'Can someone explain the ending? I\'m so confused but also hyped for next week', time: '8h ago', likes: 67 },
    { user: 'TokyoGhoulFan', text: 'Been waiting 3 years for this arc. Worth every second of the wait.', time: '1d ago', likes: 215 },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#09090b', paddingTop: 0 }}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 glass border-b px-4 sm:px-8 h-14 flex items-center gap-4" style={{ borderColor: '#23252b' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-all hover:text-white"
          style={{ color: '#a0a0a0' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          Back
        </button>
        <div className="h-4 w-px" style={{ background: '#23252b' }} />
        <p className="text-sm font-semibold truncate">{anime.title}</p>
        <span className="text-sm" style={{ color: '#a0a0a0' }}>— Episode {currentEp}</span>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Left: Player + Info */}
          <div>
            {/* Video Player */}
            <div
              className="relative w-full overflow-hidden rounded-2xl cursor-pointer"
              style={{ background: '#000', aspectRatio: '16/9' }}
              onClick={() => setPlaying(!playing)}
            >
              <img
                src={anime.banner}
                alt="player"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.3)', opacity: 0.6 }}
              />

              {/* Play/Pause overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!playing ? (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(109,59,255,0.9)', boxShadow: '0 0 40px rgba(109,59,255,0.5)' }}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="white"><path d="M10 7l18 9-18 9V7z"/></svg>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="white"><rect x="5" y="4" width="6" height="20" rx="2"/><rect x="17" y="4" width="6" height="20" rx="2"/></svg>
                  </div>
                )}
              </div>

              {/* Skip buttons */}
              <div className="absolute top-4 right-4 flex gap-2" onClick={e => e.stopPropagation()}>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/20" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                  Skip Intro
                </button>
              </div>

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} onClick={e => e.stopPropagation()}>
                {/* Progress */}
                <div
                  className="h-1 rounded-full mb-3 cursor-pointer relative"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setProgress(((e.clientX - rect.left) / rect.width) * 100)
                  }}
                >
                  <div className="h-full rounded-full relative" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6d3bff, #ff4db8)' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPlaying(!playing)} className="text-white">
                      {playing
                        ? <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><rect x="4" y="3" width="4" height="14" rx="1.5"/><rect x="12" y="3" width="4" height="14" rx="1.5"/></svg>
                        : <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><path d="M6 4l12 6-12 6V4z"/></svg>
                      }
                    </button>

                    <button
                      onClick={() => setCurrentEp(Math.max(1, currentEp - 1))}
                      className="text-white opacity-70 hover:opacity-100"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 3L6 9l6 6"/><line x1="4" y1="3" x2="4" y2="15"/></svg>
                    </button>
                    <button
                      onClick={() => setCurrentEp(Math.min(totalEps, currentEp + 1))}
                      className="text-white opacity-70 hover:opacity-100"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M6 3l6 6-6 6"/><line x1="14" y1="3" x2="14" y2="15"/></svg>
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M3 5.5h2l3-3v11l-3-3H3v-5z"/><path d="M11 5a3 3 0 0 1 0 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={e => setVolume(Number(e.target.value))}
                        className="w-16 h-1 rounded-full accent-purple-500"
                        style={{ accentColor: '#6d3bff' }}
                      />
                    </div>

                    <span className="text-xs text-white opacity-70">
                      {Math.floor(progress * 0.24)}:{String(Math.floor((progress * 0.24 % 1) * 60)).padStart(2,'0')} / 24:00
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={quality}
                      onChange={e => setQuality(e.target.value)}
                      className="text-xs bg-transparent text-white border rounded px-1 py-0.5 cursor-pointer"
                      style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      {qualities.map(q => <option key={q} value={q} style={{ background: '#111216' }}>{q}</option>)}
                    </select>
                    <button className="text-white opacity-70 hover:opacity-100">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="14" height="14" rx="2"/><path d="M7 6l5 3-5 3V6z" fill="white"/>
                      </svg>
                    </button>
                    <button className="text-white opacity-70 hover:opacity-100">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 3h5V8M15 15h-5v-5M3 15h5v-5M15 3h-5v5"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ep info + Server selector */}
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold">{anime.title} — Episode {currentEp}</h1>
                <p className="text-sm mt-0.5" style={{ color: '#a0a0a0' }}>
                  {anime.studio} · {anime.year} · {anime.duration}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {servers.map(s => (
                  <button
                    key={s}
                    onClick={() => setServer(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: server === s ? 'rgba(109,59,255,0.2)' : '#1b1d23',
                      color: server === s ? '#6d3bff' : '#a0a0a0',
                      border: `1px solid ${server === s ? '#6d3bff' : '#23252b'}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b mt-6 mb-4 overflow-x-auto scrollbar-hide" style={{ borderColor: '#23252b' }}>
              {['Episodes', 'Comments', 'Details'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-medium shrink-0 transition-all border-b-2"
                  style={{
                    color: activeTab === tab ? '#6d3bff' : '#a0a0a0',
                    borderColor: activeTab === tab ? '#6d3bff' : 'transparent',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Episodes' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 fade-in">
                {Array.from({ length: totalEps }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentEp(i + 1)}
                    className="aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: currentEp === i + 1 ? '#6d3bff' : '#1b1d23',
                      color: currentEp === i + 1 ? 'white' : '#a0a0a0',
                      border: `1px solid ${currentEp === i + 1 ? '#6d3bff' : '#23252b'}`,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'Comments' && (
              <div className="fade-in flex flex-col gap-4">
                {/* Comment input */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}>K</div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm border-b pb-2"
                      style={{ color: 'white', borderColor: '#23252b' }}
                    />
                    {comment && (
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#6d3bff', color: 'white' }} onClick={() => setComment('')}>Post</button>
                        <button className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#1b1d23', color: '#a0a0a0', border: '1px solid #23252b' }} onClick={() => setComment('')}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>

                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `hsl(${i * 60 + 200}, 70%, 40%)` }}>
                      {c.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.user}</span>
                        <span className="text-xs" style={{ color: '#a0a0a0' }}>{c.time}</span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#c0c0c0' }}>{c.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-xs transition-colors hover:text-white" style={{ color: '#a0a0a0' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h3V2l4 5-4 5V8H2V5z"/></svg>
                          {c.likes}
                        </button>
                        <button className="text-xs transition-colors hover:text-white" style={{ color: '#a0a0a0' }}>Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Details' && (
              <div className="fade-in">
                <p className="text-sm leading-relaxed" style={{ color: '#c0c0c0' }}>{anime.synopsis}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {anime.genres.map(g => (
                    <span key={g} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.3)' }}>{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Recommendations */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold" style={{ color: '#a0a0a0' }}>Up Next</h3>
            {animeData.filter(a => a.id !== anime.id).slice(0, 6).map((a) => (
              <RecommendCard key={a.id} anime={a} onClick={onAnimeClick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendCard({ anime, onClick }: { anime: Anime; onClick: (a: Anime) => void }) {
  return (
    <button
      className="flex gap-3 p-2 rounded-xl text-left transition-all hover:bg-white/5"
      style={{ background: '#111216', border: '1px solid #23252b' }}
      onClick={() => onClick(anime)}
    >
      <div className="relative shrink-0 rounded-lg overflow-hidden" style={{ width: 96, height: 60 }}>
        <img src={anime.banner} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23', filter: 'brightness(0.7)' }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><path d="M3 2l9 5-9 5V2z"/></svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{anime.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#a0a0a0' }}>{anime.genres[0]}</p>
        <div className="flex items-center gap-1 mt-1">
          <svg width="9" height="9" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg>
          <span className="text-xs font-medium">{anime.rating}</span>
          <span className="text-xs" style={{ color: '#a0a0a0' }}>· Ep {anime.episodes}</span>
        </div>
      </div>
    </button>
  )
}
