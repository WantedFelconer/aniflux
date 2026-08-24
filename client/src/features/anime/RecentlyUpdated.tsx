import { useState } from 'react'
import { type Anime } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'

interface RecentlyUpdatedProps {
  onAnimeClick: (anime: Anime) => void
}

const filters = ['All', 'Sub', 'Dub', 'Movie', 'ONA', 'OVA']

export default function RecentlyUpdated({ onAnimeClick }: RecentlyUpdatedProps) {
  const { animeList } = useApp()
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All' ? animeList
    : activeFilter === 'Dub' ? animeList.filter(a => a.isDub)
    : activeFilter === 'Sub' ? animeList.filter(a => !a.isDub)
    : animeList.filter(a => a.type === activeFilter)

  return (
    <section className="py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-xl font-bold">Recently Updated</h2>
          <div className="flex gap-1 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeFilter === f ? '#6d3bff' : '#1b1d23',
                  color: activeFilter === f ? 'white' : '#a0a0a0',
                  border: `1px solid ${activeFilter === f ? '#6d3bff' : '#23252b'}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.slice(0, 12).map((anime) => (
            <RecentCard key={anime.id} anime={anime} onClick={onAnimeClick} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            className="px-8 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: '#1b1d23', border: '1px solid #23252b', color: '#a0a0a0' }}
          >
            Load More
          </button>
        </div>
      </div>
    </section>
  )
}

function RecentCard({ anime, onClick }: { anime: Anime; onClick: (a: Anime) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(anime)}
    >
      <div
        className="relative overflow-hidden rounded-xl transition-all duration-250"
        style={{
          aspectRatio: '2/3',
          transform: hovered ? 'translateY(-4px) scale(1.02)' : 'scale(1)',
          boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.9) 0%, transparent 50%)' }} />

        {/* Top badges */}
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {anime.isNew && <span className="px-1 py-0.5 rounded text-xs font-bold leading-none" style={{ background: '#ff4db8', color: 'white', fontSize: 9 }}>NEW</span>}
          {anime.isDub && <span className="px-1 py-0.5 rounded text-xs font-bold leading-none" style={{ background: '#4a8dff', color: 'white', fontSize: 9 }}>DUB</span>}
        </div>
        <div className="absolute top-1.5 right-1.5">
          <span className="px-1 py-0.5 rounded text-xs font-bold leading-none" style={{ background: 'rgba(0,0,0,0.7)', color: '#a0a0a0', fontSize: 9, border: '1px solid #23252b' }}>HD</span>
        </div>

        {/* Episode badge */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(109,59,255,0.9)', color: 'white', fontSize: 10 }}>
            Ep {anime.episodes}
          </span>
          <div className="flex items-center gap-0.5">
            <svg width="9" height="9" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg>
            <span style={{ fontSize: 10, color: '#e5e5e5', fontWeight: 600 }}>{anime.rating}</span>
          </div>
        </div>

        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center fade-in" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.9)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><path d="M4 2.5l7 4.5-7 4.5V2.5z"/></svg>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1.5 px-0.5">
        <p className="text-xs font-semibold truncate leading-snug">{anime.title}</p>
        <p className="text-xs truncate" style={{ color: '#a0a0a0', fontSize: 10 }}>{anime.studio}</p>
      </div>
    </div>
  )
}
