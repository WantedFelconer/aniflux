import React, { useState, useEffect, useMemo } from 'react'
import { animeData, type Anime } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'
import { useAuth } from '@/shared/context/AuthContext'
import GumletPlayer from './GumletPlayer'
import EpisodeComments from '@/features/comments/EpisodeComments'
import AuthModal from '@/features/auth/AuthModal'
import {
  extractGumletAssetId,
  formatGumletEmbedUrl,
  resolveGumletEpisodeStream,
  type GumletStreamSource,
} from './gumletStream'

interface WatchPageProps {
  anime: Anime
  onBack: () => void
  onAnimeClick: (anime: Anime) => void
}

export default function WatchPage({ anime, onBack, onAnimeClick }: WatchPageProps) {
  const { addHistory, bookmarks, toggleBookmark } = useApp()
  const { isAuthenticated, user: authUser } = useAuth()
  const [currentEp, setCurrentEp] = useState(1)
  const [activeTab, setActiveTab] = useState<'Episodes' | 'Comments' | 'Details' | 'Gumlet Info'>('Episodes')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login')

  const totalEps = anime.episodes || 12
  const [liveStreamSources, setLiveStreamSources] = useState<Record<number, any>>(anime.streamSources || {})

  // Fetch live episode stream sources from backend database
  useEffect(() => {
    setLiveStreamSources(anime.streamSources || {})
    let isMounted = true

    async function loadEpisodes() {
      try {
        const token = localStorage.getItem('aniflux_auth_token')
        const headers: Record<string, string> = { 'Accept': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (authUser?.id) headers['X-User-Id'] = String(authUser.id)

        const res = await fetch(`/api/anime/${anime.id}/episodes`, {
          headers,
          credentials: 'include'
        })
        if (res.ok) {
          const json = await res.json()
          if (isMounted && Array.isArray(json.episodes)) {
            const map: Record<number, any> = {}
            for (const ep of json.episodes) {
              if (ep.playerUrl || ep.embedUrl || ep.gumletUrl || ep.assetId) {
                map[ep.episodeNumber] = {
                  playerUrl: ep.playerUrl,
                  embedUrl: ep.embedUrl,
                  gumletUrl: ep.gumletUrl,
                  gumletAssetId: ep.assetId,
                  streamStatus: ep.streamStatus,
                  subtitleTracks: ep.subtitleTracks,
                  errorMessage: ep.errorMessage
                }
              }
            }
            setLiveStreamSources(prev => ({ ...prev, ...map }))
          }
        }
      } catch {
        // Fallback to static/context sources
      }
    }

    loadEpisodes()
    return () => { isMounted = false }
  }, [anime.id, anime.streamSources, isAuthenticated, authUser])

  // Resolve current episode stream source with per-episode link priority
  const currentStream: GumletStreamSource = useMemo(() => {
    return resolveGumletEpisodeStream(
      anime.id,
      currentEp,
      anime.gumletUrl,
      liveStreamSources,
      isAuthenticated
    )
  }, [anime.id, anime.gumletUrl, currentEp, liveStreamSources, isAuthenticated])

  // Log to watch history only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      addHistory(anime, currentEp)
    }
  }, [anime.id, currentEp, isAuthenticated])

  const isBookmarked = bookmarks.has(anime.id)
  const episodeTitle = anime.episodeTitles?.[currentEp - 1] || `Episode ${currentEp}`

  const handleEpisodeSelect = (epNum: number) => {
    if (!isAuthenticated) {
      setAuthModalView('login')
      setAuthModalOpen(true)
      return
    }
    setCurrentEp(epNum)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090b', paddingTop: 0 }}>
      {/* Top Sticky Navigation Bar */}
      <div
        className="sticky top-0 z-50 glass border-b px-4 sm:px-8 h-14 flex items-center justify-between gap-4"
        style={{ borderColor: '#23252b' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium transition-all hover:text-white shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-white/10"
            style={{ color: '#a0a0a0' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
            <span>Back</span>
          </button>
          <div className="h-4 w-px shrink-0" style={{ background: '#23252b' }} />
          <p className="text-sm font-semibold truncate text-white">{anime.title}</p>
          <span className="text-sm shrink-0 font-medium" style={{ color: '#a0a0a0' }}>
            — Ep {currentEp}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(anime.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: isBookmarked ? 'rgba(109,59,255,0.2)' : '#1b1d23',
              color: isBookmarked ? '#6d3bff' : '#a0a0a0',
              border: `1px solid ${isBookmarked ? '#6d3bff' : '#23252b'}`,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? '#6d3bff' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column: Gumlet Player + Tabs */}
          <div>
            {/* Gumlet Adaptive Video Player */}
            <GumletPlayer
              urlOrAssetId={currentStream.embedUrl || currentStream.assetId}
              animeTitle={anime.title}
              episodeNumber={currentEp}
              episodeTitle={episodeTitle}
              streamStatus={!isAuthenticated ? 'locked' : currentStream.streamStatus}
              errorMessage={currentStream.errorMessage}
              subtitleTracks={currentStream.subtitleTracks}
              poster={anime.banner}
              isLocked={!isAuthenticated}
              onSignInClick={() => {
                setAuthModalView('login')
                setAuthModalOpen(true)
              }}
              onRegisterClick={() => {
                setAuthModalView('register')
                setAuthModalOpen(true)
              }}
              hasPrev={currentEp > 1}
              hasNext={currentEp < totalEps}
              onPrevEpisode={() => isAuthenticated ? setCurrentEp(Math.max(1, currentEp - 1)) : handleEpisodeSelect(currentEp - 1)}
              onNextEpisode={() => isAuthenticated ? setCurrentEp(Math.min(totalEps, currentEp + 1)) : handleEpisodeSelect(currentEp + 1)}
            />

            {/* Stream Status Info Bar */}
            <div
              className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl"
              style={{ background: '#111216', border: '1px solid #23252b' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-white truncate">
                    {anime.title} — Episode {currentEp}
                  </h1>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold"
                    style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}
                  >
                    {anime.status}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>
                  {anime.studio} · {anime.year} · {anime.duration} · Source: {anime.source}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-400">Stream Engine:</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 flex items-center gap-1.5">
                  <span>⚡</span> Gumlet Video CDN
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              className="flex gap-2 border-b mt-6 mb-4 overflow-x-auto scrollbar-hide"
              style={{ borderColor: '#23252b' }}
            >
              {(['Episodes', 'Comments', 'Details', 'Gumlet Info'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-semibold shrink-0 transition-all border-b-2"
                  style={{
                    color: activeTab === tab ? '#6d3bff' : '#a0a0a0',
                    borderColor: activeTab === tab ? '#6d3bff' : 'transparent',
                  }}
                >
                  {tab === 'Gumlet Info' ? '⚡ Gumlet Engine' : tab}
                </button>
              ))}
            </div>

            {/* TAB 1: Episodes Selector Grid */}
            {activeTab === 'Episodes' && (
              <div className="fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-medium">Select an episode to watch:</p>
                  <span className="text-xs text-purple-400 font-semibold">{totalEps} Episodes Available</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {Array.from({ length: totalEps }, (_, i) => {
                    const epNum = i + 1
                    const isCurrent = currentEp === epNum
                    const title = anime.episodeTitles?.[i] || `Episode ${epNum}`
                    return (
                      <button
                        key={epNum}
                        onClick={() => handleEpisodeSelect(epNum)}
                        className="py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all hover:scale-105"
                        style={{
                          background: isCurrent ? 'linear-gradient(135deg, #6d3bff, #ff4db8)' : '#1b1d23',
                          color: isCurrent ? 'white' : '#a0a0a0',
                          border: `1px solid ${isCurrent ? '#ff4db8' : '#23252b'}`,
                          boxShadow: isCurrent ? '0 0 15px rgba(109,59,255,0.4)' : 'none',
                        }}
                        title={title}
                      >
                        <span className="font-bold text-sm">{epNum}</span>
                        <span className="text-[10px] opacity-75 truncate max-w-full">
                          {!isAuthenticated ? '🔒 Ep ' + epNum : (anime.episodeTitles?.[i] ? `Ep ${epNum}` : 'Sub')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Comments (Episode-wise 9anime style discussion) */}
            {activeTab === 'Comments' && (
              <EpisodeComments
                animeId={anime.id}
                episodeNumber={currentEp}
                animeTitle={anime.title}
              />
            )}

            {/* TAB 3: Details */}
            {activeTab === 'Details' && (
              <div className="fade-in p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <h3 className="text-sm font-bold text-white mb-2">Synopsis</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c0c0c0' }}>{anime.synopsis}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {anime.genres.map(g => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.3)' }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Gumlet Engine Information */}
            {activeTab === 'Gumlet Info' && (
              <div className="fade-in p-5 rounded-2xl flex flex-col gap-4" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>⚡</span> Protected Video Streaming Engine
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Integrated with Gumlet Video infrastructure with tokenized authentication, anti-hotlinking protection, and dynamic subtitle track switching.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border" style={{ background: '#1b1d23', borderColor: '#2e313d' }}>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
                    <span>🛡️</span> Stream Security Status
                  </div>
                  <span className="text-[11px] font-mono text-gray-300 break-all block bg-black/40 p-2.5 rounded-lg">
                    {isAuthenticated
                      ? `Active Authenticated Session • Tokenized DRM Gateway (Ep ${currentEp})`
                      : 'Stream Locked — Authentication Required to Initialize CDN Player'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border" style={{ background: '#1b1d23', borderColor: '#2e313d' }}>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
                    <span>📡</span> Stream Health
                  </div>
                  <span className="text-[11px] font-mono text-gray-300 break-all block bg-black/40 p-2.5 rounded-lg">
                    {isAuthenticated ? '✓ 1080p 60fps Adaptive HLS Stream' : '🔒 Locked for Guests'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Up Next / Recommendations */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold" style={{ color: '#a0a0a0' }}>Recommended Next</h3>
            {animeData.filter(a => a.id !== anime.id).slice(0, 6).map(a => (
              <RecommendCard key={a.id} anime={a} onClick={onAnimeClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal for Guests attempting to watch or select episodes */}
      {authModalOpen && (
        <AuthModal
          initialView={authModalView}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}
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
        <img
          src={anime.banner}
          alt={anime.title}
          className="w-full h-full object-cover"
          style={{ background: '#1b1d23', filter: 'brightness(0.7)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <path d="M3 2l9 5-9 5V2z" />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-white">{anime.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#a0a0a0' }}>{anime.genres[0]}</p>
        <div className="flex items-center gap-1 mt-1">
          <svg width="9" height="9" viewBox="0 0 12 12" fill="#f59e0b">
            <path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z" />
          </svg>
          <span className="text-xs font-medium text-white">{anime.rating}</span>
          <span className="text-xs" style={{ color: '#a0a0a0' }}>· Ep {anime.episodes}</span>
        </div>
      </div>
    </button>
  )
}
