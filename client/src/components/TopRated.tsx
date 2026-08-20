import { type Anime } from '../data/animeData'
import { useApp } from '../context/AppContext'
import SectionCarousel from './SectionCarousel'

interface TopRatedProps {
  onAnimeClick: (anime: Anime) => void
}

export default function TopRated({ onAnimeClick }: TopRatedProps) {
  const { animeList } = useApp()
  const sorted = [...animeList].sort((a, b) => b.malScore - a.malScore)

  return (
    <SectionCarousel
      title="Top Rated"
      subtitle="All time"
      anime={sorted}
      onAnimeClick={onAnimeClick}
      cardSize="lg"
      badge={{ text: 'MAL Score', color: '#f59e0b' }}
    />
  )
}
