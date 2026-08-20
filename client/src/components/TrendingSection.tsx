import { type Anime } from '../data/animeData'
import { useApp } from '../context/AppContext'
import SectionCarousel from './SectionCarousel'

interface TrendingSectionProps {
  onAnimeClick: (anime: Anime) => void
}

export default function TrendingSection({ onAnimeClick }: TrendingSectionProps) {
  const { animeList } = useApp()

  return (
    <>
      <div className="py-2">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
          <h2 className="text-xl font-bold mb-5">Trending Today</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeList.slice(0, 6).map((anime, i) => (
              <TrendingCard key={anime.id} anime={anime} rank={i + 1} onClick={onAnimeClick} />
            ))}
          </div>
        </div>
      </div>

      <SectionCarousel
        title="Popular This Week"
        anime={animeList.slice(4)}
        onAnimeClick={onAnimeClick}
        badge={{ text: 'Hot', color: '#ff4db8' }}
      />
    </>
  )
}

function TrendingCard({ anime, rank, onClick }: { anime: Anime; rank: number; onClick: (a: Anime) => void }) {
  return (
    <div
      className="relative cursor-pointer group"
      onClick={() => onClick(anime)}
    >
      <div
        className="relative overflow-hidden rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
        style={{ aspectRatio: '2/3' }}
      >
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, transparent 60%)' }} />

        {/* Rank number */}
        <div
          className="absolute bottom-0 left-0 text-right leading-none font-black"
          style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,0.15)',
            lineHeight: 0.9,
            paddingLeft: '4px',
            paddingBottom: '2px',
          }}
        >
          {rank}
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {anime.isNew && <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: '#ff4db8', color: 'white' }}>NEW</span>}
          {anime.isDub && <span className="px-1.5 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(74,141,255,0.9)', color: 'white' }}>DUB</span>}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.9)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M5 3l8 5-8 5V3z"/></svg>
          </div>
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold truncate leading-tight">{anime.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="#f59e0b"><path d="M6 1l1.3 3.9H11L8.1 7.3l1 3.8L6 9.1l-3.1 2 1-3.8L1 4.9h3.7L6 1z"/></svg>
          <span className="text-xs font-medium">{anime.rating}</span>
          <span className="text-xs" style={{ color: '#a0a0a0' }}>· {anime.genres[0]}</span>
        </div>
      </div>
    </div>
  )
}
