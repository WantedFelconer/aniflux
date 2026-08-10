import { useRef, useState } from 'react'
import AnimeCard from './AnimeCard'
import type { Anime } from '../data/animeData'

interface SectionCarouselProps {
  title: string
  subtitle?: string
  anime: Anime[]
  onAnimeClick: (anime: Anime) => void
  cardSize?: 'sm' | 'md' | 'lg'
  badge?: { text: string; color: string }
}

export default function SectionCarousel({ title, subtitle, anime, onAnimeClick, cardSize = 'md', badge }: SectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 320
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  return (
    <section className="py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: badge.color + '22', color: badge.color, border: `1px solid ${badge.color}44` }}>
                {badge.text}
              </span>
            )}
            {subtitle && <span className="text-sm" style={{ color: '#a0a0a0' }}>{subtitle}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: '#1b1d23', border: '1px solid #23252b', color: canScrollLeft ? '#fff' : '#a0a0a0' }}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft />
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: '#1b1d23', border: '1px solid #23252b', color: canScrollRight ? '#fff' : '#a0a0a0' }}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight />
            </button>
            <button className="text-sm font-medium ml-2 transition-colors hover:text-white" style={{ color: '#6d3bff' }}>
              View All
            </button>
          </div>
        </div>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {anime.map((a) => (
            <div key={a.id} style={{ scrollSnapAlign: 'start' }}>
              <AnimeCard anime={a} onClick={onAnimeClick} size={cardSize} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 2L4 7l5 5"/>
  </svg>
)

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 2l5 5-5 5"/>
  </svg>
)
