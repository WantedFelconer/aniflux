import { type Anime } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'
import SectionCarousel from '@/shared/components/SectionCarousel'

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
