import { animeData, type Anime } from '../data/animeData'
import SectionCarousel from './SectionCarousel'

interface TopRatedProps {
  onAnimeClick: (anime: Anime) => void
}

export default function TopRated({ onAnimeClick }: TopRatedProps) {
  const sorted = [...animeData].sort((a, b) => b.malScore - a.malScore)

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
