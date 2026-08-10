import { useRef, useState } from 'react'
import { continueWatchingData, type Anime } from '../data/animeData'

interface ContinueWatchingProps {
  onWatch: (anime: Anime) => void
}

export default function ContinueWatching({ onWatch }: ContinueWatchingProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Continue Watching</h2>
          <button className="text-sm font-medium" style={{ color: '#6d3bff' }}>History</button>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {continueWatchingData.map((item) => (
            <ContinueCard key={item.id} anime={item} onWatch={onWatch} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ContinueCard({ anime, onWatch }: { anime: Anime & { progress?: number; currentEp?: number }, onWatch: (a: Anime) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative shrink-0 cursor-pointer rounded-2xl overflow-hidden"
      style={{ width: 260, height: 160 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onWatch(anime)}
    >
      <img src={anime.banner} alt={anime.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.5)' }} />

      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.9) 0%, transparent 60%)' }} />

      {hovered && (
        <div className="absolute inset-0 flex items-center justify-center fade-in" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.95)' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M7 5l10 5-10 5V5z"/>
            </svg>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold truncate flex-1">{anime.title}</p>
          <span className="text-xs ml-2 shrink-0" style={{ color: '#a0a0a0' }}>Ep {anime.currentEp}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${anime.progress}%`, background: 'linear-gradient(90deg, #6d3bff, #ff4db8)' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: '#a0a0a0' }}>{anime.progress}% watched</span>
          <span className="text-xs" style={{ color: '#a0a0a0' }}>{Math.round((100 - (anime.progress || 0)) * 0.24)} min left</span>
        </div>
      </div>
    </div>
  )
}
