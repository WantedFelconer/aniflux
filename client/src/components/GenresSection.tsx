interface GenresSectionProps {
  onGenreClick?: (genre: string) => void
}

const genres = [
  { name: 'Action', icon: '⚔️', color: '#ef4444' },
  { name: 'Fantasy', icon: '🔮', color: '#8b5cf6' },
  { name: 'Romance', icon: '💖', color: '#ec4899' },
  { name: 'Sci-Fi', icon: '🚀', color: '#3b82f6' },
  { name: 'Comedy', icon: '😄', color: '#f59e0b' },
  { name: 'Isekai', icon: '🌀', color: '#6d3bff' },
  { name: 'Mystery', icon: '🔍', color: '#6b7280' },
  { name: 'Drama', icon: '🎭', color: '#14b8a6' },
  { name: 'Slice of Life', icon: '🌸', color: '#f472b6' },
  { name: 'Horror', icon: '👻', color: '#dc2626' },
  { name: 'Sports', icon: '⚡', color: '#22c55e' },
  { name: 'Supernatural', icon: '✨', color: '#a855f7' },
  { name: 'Mecha', icon: '🤖', color: '#64748b' },
  { name: 'Psychological', icon: '🧠', color: '#7c3aed' },
  { name: 'Historical', icon: '⛩️', color: '#b45309' },
  { name: 'Music', icon: '🎵', color: '#0ea5e9' },
  { name: 'Magic', icon: '🪄', color: '#c026d3' },
  { name: 'Military', icon: '🎖️', color: '#374151' },
  { name: 'School', icon: '🏫', color: '#2563eb' },
  { name: 'Adventure', icon: '🗺️', color: '#16a34a' },
]

export default function GenresSection({ onGenreClick }: GenresSectionProps) {
  return (
    <section className="py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
        <h2 className="text-xl font-bold mb-5">Browse by Genre</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {genres.map(({ name, icon, color }) => (
            <button
              key={name}
              onClick={() => onGenreClick?.(name)}
              className="genre-chip flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all"
              style={{ background: '#111216', border: '1px solid #23252b', color: '#a0a0a0' }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span className="text-xs font-medium leading-tight">{name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
