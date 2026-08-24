import React, { useState, useEffect } from 'react'
import {
  formatGumletEmbedUrl,
  type GumletPlayerOptions,
  type SubtitleTrack,
} from './gumletStream'

interface GumletPlayerProps {
  urlOrAssetId?: string
  animeTitle: string
  episodeNumber: number
  episodeTitle?: string
  streamStatus?: 'healthy' | 'broken' | 'unverified' | 'pending' | 'locked'
  errorMessage?: string | null
  subtitleTracks?: SubtitleTrack[]
  poster?: string
  onNextEpisode?: () => void
  onPrevEpisode?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  isLocked?: boolean
  onSignInClick?: () => void
  onRegisterClick?: () => void
}

export default function GumletPlayer({
  urlOrAssetId,
  animeTitle,
  episodeNumber,
  episodeTitle,
  streamStatus = 'healthy',
  errorMessage,
  subtitleTracks = [],
  poster,
  onNextEpisode,
  onPrevEpisode,
  hasPrev = false,
  hasNext = false,
  isLocked = false,
  onSignInClick,
  onRegisterClick,
}: GumletPlayerProps) {
  const [playerOptions, setPlayerOptions] = useState<GumletPlayerOptions>({
    autoplay: true,
    preload: true,
    loop: false,
    muted: false,
    subtitles: true,
    branding: true,
    color: '6d3bff',
  })

  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  const [hasIframeLoaded, setHasIframeLoaded] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isManualError, setIsManualError] = useState(false)

  // Reset states when changing episode
  useEffect(() => {
    setHasIframeLoaded(false)
    setIsManualError(false)
    setIsRetrying(false)
  }, [urlOrAssetId, episodeNumber])

  const isStreamLocked = isLocked || streamStatus === 'locked'
  const isDirectPath = urlOrAssetId?.startsWith('/')
  const embedSrc = isDirectPath
    ? urlOrAssetId
    : (urlOrAssetId && urlOrAssetId !== 'locked' ? formatGumletEmbedUrl(urlOrAssetId, playerOptions) : '')

  const isBroken = !isStreamLocked && (streamStatus === 'broken' || isManualError)

  const handleRetry = () => {
    setIsRetrying(true)
    setIsManualError(false)
    setHasIframeLoaded(false)
    setTimeout(() => {
      setIsRetrying(false)
    }, 1200)
  }

  return (
    <div
      onContextMenu={e => e.preventDefault()}
      className={`relative w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 select-none ${
        isTheaterMode ? 'z-40 max-w-full' : ''
      }`}
      style={{
        background: '#090a0f',
        border: '1px solid #1f222e',
      }}
    >
      {/* Top Stream Header Bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs border-b select-none"
        style={{
          background: 'rgba(17, 18, 23, 0.95)',
          borderColor: '#23252b',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 shrink-0"
            style={{
              background: isStreamLocked
                ? 'rgba(239, 68, 68, 0.15)'
                : 'linear-gradient(135deg, rgba(109,59,255,0.25), rgba(255,77,184,0.25))',
              color: isStreamLocked ? '#f87171' : '#c084fc',
              border: isStreamLocked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(192,132,252,0.3)',
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStreamLocked ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            {isStreamLocked ? 'Stream Locked' : 'Secure Stream'}
          </span>
          <span className="text-gray-300 font-semibold truncate text-[11px]">
            {animeTitle} — Ep {episodeNumber}: {episodeTitle || `Episode ${episodeNumber}`}
          </span>
        </div>

        {/* Status indicator badge & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
              isStreamLocked
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : isBroken
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isStreamLocked ? '🔒 Login Required' : isBroken ? '⚠️ Broken Stream' : '✓ 1080p Protected'}
          </span>

          {!isStreamLocked && (
            <>
              <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Player Settings & Subtitles"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
                title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M10 4v16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Video Viewport (16:9 Aspect Ratio) */}
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        {isStreamLocked ? (
          /* Locked State View (Guest / Not Signed In) */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 overflow-hidden">
            {poster && (
              <img
                src={poster}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#090a0f]/90 via-[#0d0e15]/95 to-[#090a0f]" />

            <div className="relative z-10 max-w-md flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(109,59,255,0.25), rgba(255,77,184,0.25))',
                  border: '1px solid rgba(192,132,252,0.4)',
                }}
              >
                <span className="text-3xl">🔒</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
                Episode Streaming Locked
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
                Watching anime on Aniflux requires a free registered account. Log in or create your account to stream Episode {episodeNumber} in 1080p Ultra-HD with subtitle sync.
              </p>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                {onSignInClick && (
                  <button
                    onClick={onSignInClick}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #6d3bff, #ff4db8)',
                      boxShadow: '0 4px 20px rgba(109,59,255,0.4)',
                    }}
                  >
                    Sign In to Watch
                  </button>
                )}

                {onRegisterClick && (
                  <button
                    onClick={onRegisterClick}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-purple-200 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-600/40 transition-all hover:scale-105"
                  >
                    Create Free Account
                  </button>
                )}
              </div>

              <div className="mt-6 flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">✓ Ad-Free 1080p</span>
                <span className="flex items-center gap-1">✓ Cloud Watch Progress</span>
                <span className="flex items-center gap-1">✓ Episode Discussion</span>
              </div>
            </div>
          </div>
        ) : isBroken ? (
          /* Error Fallback Card */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#14161f] to-[#0a0b10] z-20">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-xl"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h3 className="text-lg font-black text-white mb-1.5">
              Video Stream Unavailable
            </h3>
            <p className="text-xs text-gray-400 max-w-md mb-4 leading-relaxed">
              {errorMessage ||
                'The stream URL for this episode could not be reached or has been flagged for supervisor review.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 flex items-center gap-2 shadow-lg disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #6d3bff, #ff4db8)',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={isRetrying ? 'animate-spin' : ''}
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                <span>{isRetrying ? 'Retrying...' : 'Retry Stream'}</span>
              </button>

              {hasNext && onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/20 transition-all"
                >
                  Next Episode →
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Live Protected Stream Player Embed */
          <div className="w-full h-full relative">
            {!hasIframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                <div
                  className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                  style={{
                    borderColor: '#6d3bff',
                    borderTopColor: 'transparent',
                  }}
                />
                <p className="text-xs text-gray-400 mt-3 font-medium">
                  Connecting to Secure Stream CDN...
                </p>
              </div>
            )}

            {embedSrc && (
              <iframe
                key={embedSrc}
                src={embedSrc}
                title={`${animeTitle} Episode ${episodeNumber}`}
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => setHasIframeLoaded(true)}
                onError={() => setIsManualError(true)}
              />
            )}
          </div>
        )}

        {/* Floating Episode Quick Controls on Hover */}
        {!isStreamLocked && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {hasPrev && onPrevEpisode && (
              <button
                onClick={onPrevEpisode}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md bg-black/70 hover:bg-black/90 border border-white/10 transition-transform hover:scale-105"
              >
                ⏮ Ep {episodeNumber - 1}
              </button>
            )}
            {hasNext && onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md bg-black/70 hover:bg-black/90 border border-white/10 transition-transform hover:scale-105"
              >
                Ep {episodeNumber + 1} ⏭
              </button>
            )}
          </div>
        )}

        {/* Floating Episode Quick Controls on Hover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {hasPrev && onPrevEpisode && (
            <button
              onClick={onPrevEpisode}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md bg-black/70 hover:bg-black/90 border border-white/10 transition-transform hover:scale-105"
            >
              ⏮ Ep {episodeNumber - 1}
            </button>
          )}
          {hasNext && onNextEpisode && (
            <button
              onClick={onNextEpisode}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md bg-black/70 hover:bg-black/90 border border-white/10 transition-transform hover:scale-105"
            >
              Ep {episodeNumber + 1} ⏭
            </button>
          )}
        </div>
      </div>

      {/* Slide-out Player Settings Drawer */}
      {isOptionsOpen && (
        <div
          className="p-4 border-t text-xs fade-in"
          style={{ background: '#111216', borderColor: '#23252b' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span>⚡</span> Gumlet Player Configuration
            </h4>
            <button
              onClick={() => setIsOptionsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-black/30 border border-gray-800">
              <input
                type="checkbox"
                checked={playerOptions.autoplay}
                onChange={e =>
                  setPlayerOptions({ ...playerOptions, autoplay: e.target.checked })
                }
                className="accent-purple-600 rounded cursor-pointer"
              />
              <span className="text-[11px] font-medium">Autoplay</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-black/30 border border-gray-800">
              <input
                type="checkbox"
                checked={playerOptions.subtitles}
                onChange={e =>
                  setPlayerOptions({ ...playerOptions, subtitles: e.target.checked })
                }
                className="accent-purple-600 rounded cursor-pointer"
              />
              <span className="text-[11px] font-medium">Subtitles Track</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-black/30 border border-gray-800">
              <input
                type="checkbox"
                checked={playerOptions.preload}
                onChange={e =>
                  setPlayerOptions({ ...playerOptions, preload: e.target.checked })
                }
                className="accent-purple-600 rounded cursor-pointer"
              />
              <span className="text-[11px] font-medium">Fast Preload</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-black/30 border border-gray-800">
              <input
                type="checkbox"
                checked={playerOptions.branding}
                onChange={e =>
                  setPlayerOptions({ ...playerOptions, branding: e.target.checked })
                }
                className="accent-purple-600 rounded cursor-pointer"
              />
              <span className="text-[11px] font-medium">Custom Branding</span>
            </label>
          </div>

          {subtitleTracks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-800/60 flex items-center gap-2 text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Available Subtitles:</span>
              <div className="flex gap-1.5 flex-wrap">
                {subtitleTracks.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px]"
                  >
                    {sub.label} ({sub.srclang})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
