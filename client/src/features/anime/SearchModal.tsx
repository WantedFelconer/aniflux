import { useState, useEffect, useRef } from 'react'
import { type Anime } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'

interface SearchModalProps {
  onClose: () => void
  onAnimeClick: (anime: Anime) => void
}

const trending = ['Void Chronicle', 'Celestial Blades', 'Aurora Protocol', 'Neon Requiem', 'Dragon']

export default function SearchModal({ onClose, onAnimeClick }: SearchModalProps) {
  const { animeList } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialAnime, setInitialAnime] = useState<Anime[]>(animeList.slice(0, 5))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Sync initial preview with live catalog
  useEffect(() => {
    if (animeList.length > 0) {
      setInitialAnime(animeList.slice(0, 5))
    }
  }, [animeList])

  // Search query with real-time local match and backend search merge
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q.length <= 1) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    // Instant local match from live animeList
    const localMatches = animeList.filter(a => {
      if (!a) return false
      return (
        (a.title || '').toLowerCase().includes(q) ||
        (a.titleJp || '').toLowerCase().includes(q) ||
        (a.synopsis || '').toLowerCase().includes(q) ||
        (a.studio || '').toLowerCase().includes(q) ||
        (Array.isArray(a.genres) && a.genres.some(g => (g || '').toLowerCase().includes(q))) ||
        (Array.isArray(a.tags) && a.tags.some(t => (t || '').toLowerCase().includes(q)))
      )
    })
    setResults(localMatches)

    setIsLoading(true)
    setError(null)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(query.trim())}&limit=20`)
        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json.data)) {
            // Merge & deduplicate by ID
            const map = new Map<number, Anime>()
            for (const item of localMatches) if (item?.id) map.set(item.id, item)
            for (const item of json.data) if (item?.id) map.set(item.id, item)
            setResults(Array.from(map.values()))
          }
        }
      } catch (err: any) {
        // Local matches remain visible
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, animeList])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 fade-in"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl slide-in"
        style={{ background: '#111216', border: '1px solid #23252b' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: '#23252b' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6d3bff" strokeWidth="2" strokeLinecap="round">
            <circle cx="9" cy="9" r="6"/><path d="M14 14l3 3"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search anime by main title, Japanese title, description..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
          />
          {isLoading && (
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {query && !isLoading && (
            <button onClick={() => setQuery('')} style={{ color: '#a0a0a0' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13"/>
              </svg>
            </button>
          )}
          <kbd className="px-2 py-1 rounded text-xs" style={{ background: '#23252b', color: '#a0a0a0' }}>Esc</kbd>
        </div>

        {/* Results / Trending / Loading / Error */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length <= 1 ? (
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#a0a0a0' }}>Trending Searches</p>
              <div className="flex flex-wrap gap-2">
                {trending.map(t => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-white/10 cursor-pointer"
                    style={{ background: '#1b1d23', color: '#a0a0a0', border: '1px solid #23252b' }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {initialAnime.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 mt-5" style={{ color: '#a0a0a0' }}>Featured Anime</p>
                  <div className="flex flex-col gap-1">
                    {initialAnime.map(anime => (
                      <ResultRow key={anime.id} anime={anime} onClick={onAnimeClick} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium" style={{ color: '#a0a0a0' }}>Searching backend database...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center gap-3 text-red-400">
              <span className="text-3xl">⚠️</span>
              <p className="font-semibold">{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a0a0a0' }}>{results.length} results</p>
              {results.map(anime => (
                <ResultRow key={anime.id} anime={anime} onClick={onAnimeClick} />
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center gap-3">
              <span className="text-4xl">🔍</span>
              <p className="font-semibold">No anime found for "{query}"</p>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>Try searching by Japanese title, English title, or partial title</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center gap-4" style={{ borderColor: '#23252b' }}>
          {[['↵', 'Select'], ['Esc', 'Close']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#23252b', color: '#a0a0a0' }}>{key}</kbd>
              <span className="text-xs" style={{ color: '#a0a0a0' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultRow({ anime, onClick }: { anime: Anime; onClick: (a: Anime) => void }) {
  const genresStr = Array.isArray(anime.genres) ? anime.genres.join(', ') : (typeof anime.genres === 'string' ? anime.genres : '')
  return (
    <button
      className="flex items-center gap-3 p-2 rounded-xl text-left transition-all hover:bg-white/5 cursor-pointer w-full"
      onClick={() => onClick(anime)}
    >
      <div className="relative shrink-0 w-10 h-14 rounded-lg overflow-hidden">
        <img src={anime.poster || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format'} alt={anime.title || 'Anime'} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-white">{anime.title || 'Untitled Anime'}</p>
        {anime.titleJp && <p className="text-xs truncate" style={{ color: '#888' }}>{anime.titleJp}</p>}
        <p className="text-xs truncate" style={{ color: '#a0a0a0' }}>{genresStr} {anime.year ? `· ${anime.year}` : ''}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
          ★ {anime.rating || 8.5}
        </span>
      </div>
    </button>
  )
}
