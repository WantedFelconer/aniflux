import { useState, useEffect, useCallback } from 'react'
import { animeData, type Anime } from '@/shared/data/animeData'

interface HeroProps {
  onWatch: (anime: Anime) => void
  onAnimeClick: (anime: Anime) => void
}

const heroAnime = animeData.slice(0, 5)

export default function Hero({ onWatch, onAnimeClick }: HeroProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent(idx)
      setIsTransitioning(false)
    }, 300)
  }, [isTransitioning])

  useEffect(() => {
    const t = setInterval(() => {
      goTo((current + 1) % heroAnime.length)
    }, 6000)
    return () => clearInterval(t)
  }, [current, goTo])

  const anime = heroAnime[current]

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '88vh', minHeight: 560, paddingTop: 64 }}>
      {/* Background */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        <img
          src={anime.banner}
          alt={anime.title}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.45)' }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(9,9,11,0.95) 35%, rgba(9,9,11,0.5) 70%, rgba(9,9,11,0.2) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,1) 0%, transparent 40%)' }} />

      {/* Purple glow accent */}
      <div className="absolute bottom-0 left-1/4 w-96 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#6d3bff' }} />

      {/* Content */}
      <div
        className="relative z-10 h-full flex flex-col justify-end pb-16 px-6 sm:px-10 md:px-16 max-w-screen-xl mx-auto transition-all duration-500"
        style={{ opacity: isTransitioning ? 0 : 1, transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)' }}
      >
        {/* Status badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(109,59,255,0.25)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.4)' }}>
            {anime.status}
          </span>
          {anime.isNew && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(255,77,184,0.2)', color: '#ff4db8', border: '1px solid rgba(255,77,184,0.3)' }}>New Episode</span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <StarIcon />
            <span className="text-xs font-semibold">{anime.rating}</span>
          </div>
          <div className="h-4 w-px" style={{ background: '#23252b' }} />
          <span className="text-sm" style={{ color: '#a0a0a0' }}>{anime.studio}</span>
          <span className="text-sm" style={{ color: '#a0a0a0' }}>·</span>
          <span className="text-sm" style={{ color: '#a0a0a0' }}>{anime.year}</span>
          <span className="text-sm" style={{ color: '#a0a0a0' }}>·</span>
          <span className="text-sm" style={{ color: '#a0a0a0' }}>{anime.episodes} Episodes</span>
        </div>

        {/* Title */}
        <h1 className="font-black leading-none mb-2" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}>
          {anime.title}
        </h1>
        <p className="text-sm mb-4" style={{ color: '#a0a0a0', fontStyle: 'italic' }}>{anime.titleJp}</p>

        {/* Genres */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {anime.genres.map((g) => (
            <span key={g} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: '#a0a0a0', border: '1px solid #23252b' }}>{g}</span>
          ))}
        </div>

        {/* Synopsis */}
        <p className="text-sm leading-relaxed max-w-xl mb-6" style={{ color: '#c0c0c0' }}>
          {anime.synopsis.slice(0, 200)}{anime.synopsis.length > 200 ? '…' : ''}
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onWatch(anime)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6d3bff, #4a8dff)', color: 'white', boxShadow: '0 8px 24px rgba(109,59,255,0.4)' }}
          >
            <PlayIcon />
            Watch Now
          </button>
          <button
            onClick={() => onAnimeClick(anime)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <InfoIcon />
            More Info
          </button>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#a0a0a0' }}
          >
            <HeartIcon />
          </button>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#a0a0a0' }}
          >
            <BookmarkIcon />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-8 md:right-16 flex gap-2 z-10">
        {heroAnime.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              background: i === current ? '#6d3bff' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Carousel Thumbnails (desktop) */}
      <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-10">
        {heroAnime.map((a, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative overflow-hidden rounded-xl transition-all"
            style={{
              width: 80,
              height: 52,
              border: i === current ? '2px solid #6d3bff' : '2px solid transparent',
              opacity: i === current ? 1 : 0.5,
            }}
          >
            <img src={a.banner} alt={a.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  )
}

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M5 3.5l8 4.5-8 4.5V3.5z"/>
  </svg>
)

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/><path d="M8 7v5"/><circle cx="8" cy="5" r="0.75" fill="currentColor"/>
  </svg>
)

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 13.5s-6-3.8-6-7.5a4 4 0 0 1 6-3.4A4 4 0 0 1 14 6c0 3.7-6 7.5-6 7.5z"/>
  </svg>
)

const BookmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2h8a1 1 0 0 1 1 1v11l-5-2.5L3 14V3a1 1 0 0 1 1-1z"/>
  </svg>
)

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#f59e0b">
    <path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/>
  </svg>
)
