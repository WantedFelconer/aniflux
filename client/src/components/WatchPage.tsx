import { useState, useRef, useEffect, useMemo } from 'react'
import { animeData, type Anime } from '../data/animeData'
import { useApp } from '../context/AppContext'
import {
  type StreamSource,
  resolveEpisodeStreams,
  detectStreamProvider,
  getGoogleDrivePreviewUrl,
  extractGoogleDriveId,
} from '../lib/videoStream'

interface WatchPageProps {
  anime: Anime
  onBack: () => void
  onAnimeClick: (anime: Anime) => void
}

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
const qualities = ['1080p (HD)', '720p', '480p', 'Auto']

export default function WatchPage({ anime, onBack, onAnimeClick }: WatchPageProps) {
  const { addHistory, bookmarks, toggleBookmark } = useApp()
  const [currentEp, setCurrentEp] = useState(1)
  const [activeTab, setActiveTab] = useState<'Episodes' | 'Comments' | 'Details' | 'Stream Settings'>('Episodes')
  const [comment, setComment] = useState('')

  // Video State for HTML5 Player Mode
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedQuality, setSelectedQuality] = useState('1080p (HD)')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)

  // Custom Stream Links & Server Management
  const [customGdriveUrl, setCustomGdriveUrl] = useState('')
  const [customServerUrl, setCustomServerUrl] = useState('')
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [inputGdrive, setInputGdrive] = useState('')
  const [inputServer, setInputServer] = useState('')

  // Selected active server
  const [selectedServerId, setSelectedServerId] = useState<string>('gdrive-preview')

  const totalEps = anime.episodes || 12

  // Sync custom stream links from anime object if defined
  useEffect(() => {
    if (anime.gdriveUrl) setCustomGdriveUrl(anime.gdriveUrl)
    if (anime.personalServerUrl) setCustomServerUrl(anime.personalServerUrl)
  }, [anime])

  // Resolve available stream sources for this episode
  const streamSources: StreamSource[] = useMemo(() => {
    const epSources = anime.streamSources?.[currentEp]
    return resolveEpisodeStreams(anime.id, currentEp, {
      gdrive: epSources?.gdrive || customGdriveUrl || anime.gdriveUrl,
      personalServer: epSources?.personalServer || customServerUrl || anime.personalServerUrl,
      direct: epSources?.direct,
    })
  }, [anime, currentEp, customGdriveUrl, customServerUrl])

  // Current active stream source
  const currentSource = useMemo(() => {
    return (
      streamSources.find(s => s.id === selectedServerId) ||
      streamSources[0]
    )
  }, [streamSources, selectedServerId])

  // Log to watch history
  useEffect(() => {
    addHistory(anime, currentEp)
  }, [anime.id, currentEp])

  // Auto-hide controls when playing HTML5 video
  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500)
    }
  }

  // HTML5 Video Controls
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
    if (videoRef.current.buffered.length > 0) {
      setBuffered(
        (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / (videoRef.current.duration || 1)) * 100
      )
    }
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration || 0)
    setIsLoadingVideo(false)
    setVideoError(null)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    videoRef.current.currentTime = pct * duration
    setCurrentTime(pct * duration)
  }

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    setIsMuted(newVol === 0)
    if (videoRef.current) {
      videoRef.current.volume = newVol / 100
      videoRef.current.muted = newVol === 0
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
      videoRef.current.volume = (volume || 80) / 100
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
  }

  // Keyboard Shortcuts for HTML5 Player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in comment input or modals
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        skipTime(10)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        skipTime(-10)
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        toggleMute()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [duration, isPlaying, isMuted, volume])

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const comments = [
    { user: 'KiritoFan99', text: 'This episode was absolutely insane! The stream quality is crystal clear 🔥', time: '2h ago', likes: 142 },
    { user: 'AnimeQueen', text: 'The fight scene at 18:32 gave me chills! Outstanding animation quality.', time: '5h ago', likes: 89 },
    { user: 'SakuraBlossom', text: 'Love the smooth playback and server switching option! 💜', time: '8h ago', likes: 67 },
    { user: 'TokyoGhoulFan', text: 'Been waiting for this arc. Worth every second of the wait.', time: '1d ago', likes: 215 },
  ]

  const handleApplyCustomLinks = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputGdrive.trim()) {
      const formatted = getGoogleDrivePreviewUrl(inputGdrive.trim())
      setCustomGdriveUrl(formatted)
      setSelectedServerId('gdrive-preview')
    }
    if (inputServer.trim()) {
      setCustomServerUrl(inputServer.trim())
      setSelectedServerId('personal-server')
    }
    setIsCustomModalOpen(false)
  }

  const isBookmarked = bookmarks.has(anime.id)

  return (
    <div className="min-h-screen" style={{ background: '#09090b', paddingTop: 0 }}>
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-50 glass border-b px-4 sm:px-8 h-14 flex items-center justify-between gap-4" style={{ borderColor: '#23252b' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium transition-all hover:text-white shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-white/10"
            style={{ color: '#a0a0a0' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 3L5 8l5 5"/>
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
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/10 text-white"
            style={{ background: '#1b1d23', border: '1px solid #23252b' }}
            title="Configure Google Drive or Personal Server Link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4db8" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span className="hidden sm:inline">Stream Links</span>
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column: Player + Details */}
          <div>
            {/* Stream Player Container */}
            <div
              ref={playerContainerRef}
              onMouseMove={handleMouseMove}
              className="relative w-full overflow-hidden rounded-2xl shadow-2xl group select-none"
              style={{ background: '#000', aspectRatio: '16/9' }}
            >
              {/* MODE 1: Google Drive or External Iframe Embed */}
              {currentSource.isEmbed ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={currentSource.url}
                    title={`${anime.title} Episode ${currentEp}`}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                  {/* Subtle top banner indicating Google Drive / Cloud source */}
                  <div className="absolute top-3 left-3 pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.4)' }}>
                      ☁️ {currentSource.name}
                    </span>
                  </div>
                </div>
              ) : (
                /* MODE 2: HTML5 Video Stream Player (Personal Server / Direct MP4 / HLS) */
                <div className="w-full h-full relative flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={currentSource.url}
                    poster={anime.banner}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => setIsLoadingVideo(true)}
                    onPlaying={() => setIsLoadingVideo(false)}
                    onError={() => {
                      setVideoError('Unable to connect to this server stream. You can switch to Google Drive above or check your stream URL.')
                      setIsLoadingVideo(false)
                    }}
                  />

                  {/* Loading Spinner */}
                  {isLoadingVideo && !videoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none z-20">
                      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#6d3bff', borderTopColor: 'transparent' }} />
                      <p className="text-xs text-gray-300 mt-3 font-medium">Buffering stream...</p>
                    </div>
                  )}

                  {/* Error Notification */}
                  {videoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 z-20">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">Stream Server Notice</h3>
                      <p className="text-xs text-gray-300 max-w-md mb-4">{videoError}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedServerId('gdrive-preview')}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
                        >
                          Switch to Google Drive Stream
                        </button>
                        <button
                          onClick={() => setIsCustomModalOpen(true)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 transition-all hover:bg-white/10"
                          style={{ background: '#1b1d23', border: '1px solid #23252b' }}
                        >
                          Edit Server URL
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Big Central Play Button when paused */}
                  {!isPlaying && !isLoadingVideo && !videoError && (
                    <button
                      onClick={togglePlay}
                      className="absolute w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
                      style={{ background: 'rgba(109,59,255,0.9)', boxShadow: '0 0 40px rgba(109,59,255,0.6)' }}
                    >
                      <svg width="34" height="34" viewBox="0 0 32 32" fill="white" className="ml-1">
                        <path d="M10 7l18 9-18 9V7z"/>
                      </svg>
                    </button>
                  )}

                  {/* Skip Intro Button */}
                  <div className="absolute top-4 right-4 flex gap-2 z-20" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => skipTime(85)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/20 flex items-center gap-1.5"
                      style={{ background: 'rgba(0,0,0,0.65)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                    >
                      <span>Skip Intro</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                      </svg>
                    </button>
                  </div>

                  {/* Custom HTML5 Video Controls Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Scrubbing Timeline Progress Bar */}
                    <div
                      className="h-1.5 hover:h-2.5 rounded-full mb-3 cursor-pointer relative transition-all group/progress"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                      onClick={handleSeek}
                    >
                      {/* Buffered bar */}
                      <div
                        className="h-full rounded-full absolute left-0 top-0 transition-all"
                        style={{ width: `${buffered}%`, background: 'rgba(255,255,255,0.3)' }}
                      />
                      {/* Played progress */}
                      <div
                        className="h-full rounded-full relative"
                        style={{
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                          background: 'linear-gradient(90deg, #6d3bff, #ff4db8)',
                        }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 shadow-md" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Left Controls */}
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
                          {isPlaying ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" rx="1"/>
                              <rect x="14" y="4" width="4" height="16" rx="1"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => setCurrentEp(Math.max(1, currentEp - 1))}
                          disabled={currentEp <= 1}
                          className="text-white opacity-70 hover:opacity-100 disabled:opacity-30 transition-opacity"
                          title="Previous Episode"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                          </svg>
                        </button>

                        <button
                          onClick={() => setCurrentEp(Math.min(totalEps, currentEp + 1))}
                          disabled={currentEp >= totalEps}
                          className="text-white opacity-70 hover:opacity-100 disabled:opacity-30 transition-opacity"
                          title="Next Episode"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                          </svg>
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/vol">
                          <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                            {isMuted || volume === 0 ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                              </svg>
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={e => handleVolumeChange(Number(e.target.value))}
                            className="w-16 h-1 rounded-full cursor-pointer accent-purple-500"
                            style={{ accentColor: '#6d3bff' }}
                          />
                        </div>

                        {/* Timestamps */}
                        <span className="text-xs text-gray-300 font-mono tracking-tight">
                          {formatTime(currentTime)} / {formatTime(duration || 1440)}
                        </span>
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center gap-3">
                        {/* Playback speed */}
                        <div className="relative group/speed">
                          <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium">
                            {playbackSpeed}x
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover/speed:flex flex-col bg-[#111216] border border-[#23252b] rounded-lg overflow-hidden shadow-xl p-1 z-30">
                            {speeds.map(s => (
                              <button
                                key={s}
                                onClick={() => handleSpeedChange(s)}
                                className={`px-3 py-1 text-xs text-left rounded ${playbackSpeed === s ? 'bg-purple-600 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                              >
                                {s}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quality indicator */}
                        <select
                          value={selectedQuality}
                          onChange={e => setSelectedQuality(e.target.value)}
                          className="text-xs bg-black/40 text-white border border-white/20 rounded px-1.5 py-1 cursor-pointer outline-none"
                        >
                          {qualities.map(q => (
                            <option key={q} value={q} style={{ background: '#111216' }}>
                              {q}
                            </option>
                          ))}
                        </select>

                        {/* Fullscreen Button */}
                        <button onClick={toggleFullscreen} className="text-white opacity-80 hover:opacity-100 transition-opacity">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Server Switcher & Stream Information */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-white truncate">
                    {anime.title} — Episode {currentEp}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}>
                    {anime.status}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>
                  {anime.studio} · {anime.year} · {anime.duration} · Source: {anime.source}
                </p>
              </div>

              {/* Server selector buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">Server:</span>
                {streamSources.map(source => {
                  const isActive = currentSource.id === source.id
                  return (
                    <button
                      key={source.id}
                      onClick={() => {
                        setSelectedServerId(source.id)
                        setVideoError(null)
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                      style={{
                        background: isActive ? 'linear-gradient(135deg, rgba(109,59,255,0.25), rgba(255,77,184,0.25))' : '#1b1d23',
                        color: isActive ? '#fff' : '#a0a0a0',
                        border: `1px solid ${isActive ? '#6d3bff' : '#23252b'}`,
                        boxShadow: isActive ? '0 0 15px rgba(109,59,255,0.25)' : 'none',
                      }}
                    >
                      <span>
                        {source.provider === 'gdrive' ? '☁️' : source.provider === 'personal_server' ? '🚀' : '🎬'}
                      </span>
                      <span>{source.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b mt-6 mb-4 overflow-x-auto scrollbar-hide" style={{ borderColor: '#23252b' }}>
              {(['Episodes', 'Comments', 'Details', 'Stream Settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-semibold shrink-0 transition-all border-b-2"
                  style={{
                    color: activeTab === tab ? '#6d3bff' : '#a0a0a0',
                    borderColor: activeTab === tab ? '#6d3bff' : 'transparent',
                  }}
                >
                  {tab === 'Stream Settings' ? '⚙️ Video Sources' : tab}
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
                        onClick={() => {
                          setCurrentEp(epNum)
                          setVideoError(null)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
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
                          {anime.episodeTitles?.[i] ? `Ep ${epNum}` : 'Sub'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Comments */}
            {activeTab === 'Comments' && (
              <div className="fade-in flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}>
                    U
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add to the discussion..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm border-b pb-2 text-white"
                      style={{ borderColor: '#23252b' }}
                    />
                    {comment && (
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: '#6d3bff' }} onClick={() => setComment('')}>
                          Post
                        </button>
                        <button className="px-3 py-1 rounded-lg text-xs font-medium text-gray-400" style={{ background: '#1b1d23', border: '1px solid #23252b' }} onClick={() => setComment('')}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: '#111216', border: '1px solid #1f2128' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: `hsl(${i * 60 + 200}, 70%, 40%)` }}>
                      {c.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{c.user}</span>
                        <span className="text-xs" style={{ color: '#a0a0a0' }}>{c.time}</span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#c0c0c0' }}>{c.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 5h3V2l4 5-4 5V8H2V5z"/>
                          </svg>
                          <span>{c.likes}</span>
                        </button>
                        <button className="text-xs text-gray-400 hover:text-white transition-colors">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Details */}
            {activeTab === 'Details' && (
              <div className="fade-in p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <h3 className="text-sm font-bold text-white mb-2">Synopsis</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c0c0c0' }}>{anime.synopsis}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {anime.genres.map(g => (
                    <span key={g} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.3)' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Stream Settings & Architecture Info */}
            {activeTab === 'Stream Settings' && (
              <div className="fade-in p-5 rounded-2xl flex flex-col gap-4" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📡</span> Video Streaming Configuration
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Aniflux is built with a modular video streaming architecture supporting both Google Drive public video links and your upcoming self-hosted personal streaming server.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border" style={{ background: '#1b1d23', borderColor: '#2e313d' }}>
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-1">
                      <span>☁️</span> Google Drive Public Link
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Active public preview link for rapid cloud streaming with zero hosting bandwidth cost.
                    </p>
                    <span className="text-[10px] font-mono text-gray-400 break-all block bg-black/40 p-2 rounded">
                      {customGdriveUrl || 'Auto-resolved from Google Drive Link / ID'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border" style={{ background: '#1b1d23', borderColor: '#2e313d' }}>
                    <div className="flex items-center gap-2 text-xs font-bold text-pink-400 mb-1">
                      <span>🚀</span> Personal Streaming Server
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Ready for direct MP4, WebM, and HLS (.m3u8) streams from your dedicated server.
                    </p>
                    <span className="text-[10px] font-mono text-gray-400 break-all block bg-black/40 p-2 rounded">
                      {customServerUrl || `https://stream.yourserver.com/anime/${anime.id}/ep${currentEp}.mp4`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="self-start px-4 py-2 rounded-xl text-xs font-bold text-white transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
                >
                  Configure Custom Stream Links
                </button>
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

      {/* Modal: Custom Stream Source Link Configurator */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl" style={{ background: '#111216', border: '1px solid #2e313d' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚡</span> Set Video Stream Source
              </h2>
              <button onClick={() => setIsCustomModalOpen(false)} className="text-gray-400 hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleApplyCustomLinks} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  1. Google Drive Public Link / File ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view"
                  value={inputGdrive}
                  onChange={e => setInputGdrive(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none bg-black/50 border border-gray-700 text-white font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Accepts Google Drive sharing links, preview URLs, or raw file IDs.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  2. Personal Server Stream URL (Future Streaming):
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://stream.yourserver.com/anime/1/ep1.mp4"
                  value={inputServer}
                  onChange={e => setInputServer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none bg-black/50 border border-gray-700 text-white font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Accepts MP4, WebM, HLS (.m3u8), or custom API streaming endpoints.
                </p>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
                >
                  Apply & Stream
                </button>
              </div>
            </form>
          </div>
        </div>
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
            <path d="M3 2l9 5-9 5V2z"/>
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-white">{anime.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#a0a0a0' }}>{anime.genres[0]}</p>
        <div className="flex items-center gap-1 mt-1">
          <svg width="9" height="9" viewBox="0 0 12 12" fill="#f59e0b">
            <path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/>
          </svg>
          <span className="text-xs font-medium text-white">{anime.rating}</span>
          <span className="text-xs" style={{ color: '#a0a0a0' }}>· Ep {anime.episodes}</span>
        </div>
      </div>
    </button>
  )
}
