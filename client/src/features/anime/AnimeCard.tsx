import { useState } from 'react'
import { useApp } from '@/shared/context/AppContext'
import type { Anime } from '@/shared/data/animeData'

interface AnimeCardProps {
  anime: Anime
  onClick: (anime: Anime) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function AnimeCard({ anime, onClick, size = 'md' }: AnimeCardProps) {
  const [hovered, setHovered] = useState(false)
  const { bookmarks, toggleBookmark } = useApp()
  const bookmarked = bookmarks.has(anime.id)

  const w = size === 'sm' ? 130 : size === 'lg' ? 188 : 152
  const h = Math.round(w * 1.44)

  return (
    <div
      className="relative shrink-0 cursor-pointer"
      style={{ width: w }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(anime)}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          height: h,
          transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease',
          transform: hovered ? 'translateY(-6px) scale(1.03)' : 'scale(1)',
          boxShadow: hovered ? '0 22px 52px rgba(0,0,0,0.65)' : '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />

        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.25) 50%, transparent 100%)', transition: 'opacity 0.28s', opacity: hovered ? 1 : 0.55 }} />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {anime.isNew && <span className="px-1.5 py-0.5 rounded-md text-xs font-bold leading-tight" style={{ background: '#ff4db8', color: 'white' }}>NEW</span>}
          {anime.isDub && <span className="px-1.5 py-0.5 rounded-md text-xs font-bold leading-tight" style={{ background: 'rgba(74,141,255,0.92)', color: 'white' }}>DUB</span>}
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-1.5 py-0.5 rounded-md text-xs font-bold leading-tight" style={{ background: 'rgba(0,0,0,0.65)', color: '#c0c0c0', border: '1px solid #23252b' }}>HD</span>
        </div>

        {/* Bottom row: rating + bookmark */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <StarIcon />
            <span className="text-xs font-semibold">{anime.rating}</span>
          </div>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: bookmarked ? '#6d3bff' : 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)', color: bookmarked ? 'white' : '#c0c0c0' }}
            onClick={e => { e.stopPropagation(); toggleBookmark(anime.id) }}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        </div>

        {/* Hover play */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'fadeIn 0.18s ease' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.92)', boxShadow: '0 0 28px rgba(109,59,255,0.7)' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M6 4l10 5-10 5V4z"/></svg>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold leading-tight truncate">{anime.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs" style={{ color: '#a0a0a0' }}>{anime.episodes} eps</span>
          <span className="text-xs" style={{ color: '#33363e' }}>·</span>
          <span className="text-xs" style={{ color: '#a0a0a0' }}>{anime.year}</span>
          <span className="text-xs" style={{ color: '#33363e' }}>·</span>
          <span className="text-xs truncate" style={{ color: '#a0a0a0' }}>{anime.genres[0]}</span>
        </div>
      </div>
    </div>
  )
}

const StarIcon = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg>
const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 14 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/>
  </svg>
)
