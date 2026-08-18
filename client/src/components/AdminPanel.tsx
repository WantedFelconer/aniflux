import { useState, useMemo } from 'react'
import { type Anime, type AnimeType, type ContentRating } from '../data/animeData'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getGoogleDrivePreviewUrl } from '../lib/videoStream'

interface AdminPanelProps {
  onAnimeClick: (anime: Anime) => void
  onWatch: (anime: Anime) => void
  onNavigateHome: () => void
}

const ALL_GENRES = [
  'Action', 'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Supernatural',
  'Drama', 'Slice of Life', 'Isekai', 'Adventure', 'Psychological',
  'Comedy', 'Horror', 'Sports', 'Mecha', 'Music', 'Military'
]

const ANIME_TYPES: AnimeType[] = ['TV', 'Movie', 'OVA', 'ONA']
const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'] as const
const STATUS_OPTIONS = ['Airing', 'Completed', 'Upcoming'] as const

export default function AdminPanel({ onAnimeClick, onWatch, onNavigateHome }: AdminPanelProps) {
  const { user, isAdmin } = useAuth()
  const { animeList, addAnime, updateAnime, deleteAnime, updateEpisodeStreams } = useApp()

  // State
  const [activeTab, setActiveTab] = useState<'catalog' | 'streams' | 'system'>('catalog')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null)
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false)
  const [selectedAnimeForEpisodes, setSelectedAnimeForEpisodes] = useState<Anime | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Form State for Anime Create / Edit
  const [formTitle, setFormTitle] = useState('')
  const [formTitleJp, setFormTitleJp] = useState('')
  const [formSynopsis, setFormSynopsis] = useState('')
  const [formPoster, setFormPoster] = useState('')
  const [formBanner, setFormBanner] = useState('')
  const [formStudio, setFormStudio] = useState('')
  const [formProducer, setFormProducer] = useState('')
  const [formYear, setFormYear] = useState<number>(2024)
  const [formSeason, setFormSeason] = useState<'Winter' | 'Spring' | 'Summer' | 'Fall'>('Winter')
  const [formType, setFormType] = useState<AnimeType>('TV')
  const [formStatus, setFormStatus] = useState<'Airing' | 'Completed' | 'Upcoming'>('Airing')
  const [formEpisodes, setFormEpisodes] = useState<number>(12)
  const [formDuration, setFormDuration] = useState('24 min')
  const [formRating, setFormRating] = useState<number>(8.5)
  const [formAgeRating, setFormAgeRating] = useState<ContentRating>('PG-13')
  const [formGenres, setFormGenres] = useState<string[]>(['Action', 'Fantasy'])
  const [formGdriveUrl, setFormGdriveUrl] = useState('')
  const [formPersonalServerUrl, setFormPersonalServerUrl] = useState('')

  // Episode Editor State
  const [selectedEpNumber, setSelectedEpNumber] = useState<number>(1)
  const [epTitleInput, setEpTitleInput] = useState('')
  const [epGdriveInput, setEpGdriveInput] = useState('')
  const [epServerInput, setEpServerInput] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filtered Anime List
  const filteredList = useMemo(() => {
    return animeList.filter(a => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.titleJp && a.titleJp.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [animeList, searchQuery, statusFilter])

  // Total Episode Count Calculation
  const totalEpisodesCount = useMemo(() => {
    return animeList.reduce((sum, a) => sum + (a.episodes || 12), 0)
  }, [animeList])

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAnime(null)
    setFormTitle('')
    setFormTitleJp('')
    setFormSynopsis('')
    setFormPoster('https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format')
    setFormBanner('https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format')
    setFormStudio('Aniflux Studio')
    setFormProducer('Aniplex')
    setFormYear(new Date().getFullYear())
    setFormSeason('Winter')
    setFormType('TV')
    setFormStatus('Airing')
    setFormEpisodes(12)
    setFormDuration('24 min')
    setFormRating(8.5)
    setFormAgeRating('PG-13')
    setFormGenres(['Action', 'Fantasy'])
    setFormGdriveUrl('')
    setFormPersonalServerUrl('')
    setIsEditModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (anime: Anime) => {
    setEditingAnime(anime)
    setFormTitle(anime.title)
    setFormTitleJp(anime.titleJp || '')
    setFormSynopsis(anime.synopsis || '')
    setFormPoster(anime.poster || '')
    setFormBanner(anime.banner || '')
    setFormStudio(anime.studio || 'Aniflux Studio')
    setFormProducer(anime.producer || 'Aniplex')
    setFormYear(anime.year || 2024)
    setFormSeason((anime.season as any) || 'Winter')
    setFormType(anime.type || 'TV')
    setFormStatus(anime.status || 'Airing')
    setFormEpisodes(anime.episodes || 12)
    setFormDuration(anime.duration || '24 min')
    setFormRating(anime.rating || 8.5)
    setFormAgeRating(anime.contentRating || 'PG-13')
    setFormGenres(anime.genres || ['Action', 'Fantasy'])
    setFormGdriveUrl(anime.gdriveUrl || '')
    setFormPersonalServerUrl(anime.personalServerUrl || '')
    setIsEditModalOpen(true)
  }

  // Save Anime (Create or Update)
  const handleSaveAnime = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast('Anime title is required!')
      return
    }

    const payload: Partial<Anime> = {
      title: formTitle.trim(),
      titleJp: formTitleJp.trim(),
      synopsis: formSynopsis.trim(),
      poster: formPoster.trim() || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
      banner: formBanner.trim() || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
      studio: formStudio.trim() || 'Aniflux Studio',
      producer: formProducer.trim() || 'Aniplex',
      year: formYear,
      season: formSeason,
      type: formType,
      status: formStatus,
      episodes: formEpisodes,
      duration: formDuration,
      rating: formRating,
      contentRating: formAgeRating,
      genres: formGenres,
      gdriveUrl: formGdriveUrl.trim() ? getGoogleDrivePreviewUrl(formGdriveUrl.trim()) : undefined,
      personalServerUrl: formPersonalServerUrl.trim() || undefined,
    }

    if (editingAnime) {
      await updateAnime(editingAnime.id, payload)
      showToast(`Updated "${formTitle}" successfully! ✨`)
    } else {
      await addAnime(payload)
      showToast(`Created "${formTitle}" successfully! 🚀`)
    }

    setIsEditModalOpen(false)
  }

  // Delete Anime
  const handleConfirmDelete = async () => {
    if (deleteConfirmId !== null) {
      await deleteAnime(deleteConfirmId)
      showToast('Anime deleted from catalog.')
      setDeleteConfirmId(null)
    }
  }

  // Open Episode Manager
  const handleOpenEpisodeManager = (anime: Anime) => {
    setSelectedAnimeForEpisodes(anime)
    setSelectedEpNumber(1)
    const epSource = anime.streamSources?.[1]
    setEpTitleInput(anime.episodeTitles?.[0] || 'Episode 1')
    setEpGdriveInput(epSource?.gdrive || anime.gdriveUrl || '')
    setEpServerInput(epSource?.personalServer || anime.personalServerUrl || `https://stream.yourserver.com/anime/${anime.id}/ep1.mp4`)
    setIsEpisodeModalOpen(true)
  }

  // Switch Episode in Editor
  const handleSelectEpisode = (epNum: number) => {
    if (!selectedAnimeForEpisodes) return
    setSelectedEpNumber(epNum)
    const epSource = selectedAnimeForEpisodes.streamSources?.[epNum]
    setEpTitleInput(selectedAnimeForEpisodes.episodeTitles?.[epNum - 1] || `Episode ${epNum}`)
    setEpGdriveInput(epSource?.gdrive || selectedAnimeForEpisodes.gdriveUrl || '')
    setEpServerInput(epSource?.personalServer || selectedAnimeForEpisodes.personalServerUrl || `https://stream.yourserver.com/anime/${selectedAnimeForEpisodes.id}/ep${epNum}.mp4`)
  }

  // Save Episode Stream Links
  const handleSaveEpisodeStream = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnimeForEpisodes) return

    const gdriveFormatted = epGdriveInput.trim() ? getGoogleDrivePreviewUrl(epGdriveInput.trim()) : undefined
    const serverFormatted = epServerInput.trim() || undefined

    updateEpisodeStreams(selectedAnimeForEpisodes.id, selectedEpNumber, {
      gdrive: gdriveFormatted,
      personalServer: serverFormatted,
    })

    // Also update episode title if modified
    if (epTitleInput.trim()) {
      const updatedTitles = [...(selectedAnimeForEpisodes.episodeTitles || [])]
      while (updatedTitles.length < selectedEpNumber) {
        updatedTitles.push(`Episode ${updatedTitles.length + 1}`)
      }
      updatedTitles[selectedEpNumber - 1] = epTitleInput.trim()
      updateAnime(selectedAnimeForEpisodes.id, { episodeTitles: updatedTitles })
    }

    showToast(`Episode ${selectedEpNumber} stream links updated! 🎬`)
  }

  // Auto-generate personal server templates for all episodes of this anime
  const handleAutoGenerateServerStreams = () => {
    if (!selectedAnimeForEpisodes) return
    const total = selectedAnimeForEpisodes.episodes || 12
    for (let i = 1; i <= total; i++) {
      updateEpisodeStreams(selectedAnimeForEpisodes.id, i, {
        personalServer: `https://stream.yourserver.com/anime/${selectedAnimeForEpisodes.id}/ep${i}.mp4`,
      })
    }
    showToast(`Auto-generated personal server paths for all ${total} episodes! 🚀`)
  }

  const toggleGenreSelection = (g: string) => {
    setFormGenres(prev => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]))
  }

  // Access check guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ paddingTop: 80, background: '#09090b' }}>
        <div className="p-8 rounded-3xl text-center max-w-md w-full" style={{ background: '#111216', border: '1px solid #23252b' }}>
          <span className="text-5xl block mb-4">🛡️</span>
          <h2 className="text-xl font-bold mb-2 text-white">Administrator Access Required</h2>
          <p className="text-sm text-gray-400 mb-6">
            You must be signed in with the system administrator account (<code className="text-purple-400">admin</code>) to view the Admin Panel.
          </p>
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: 80, background: '#09090b' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white backdrop-blur-md flex items-center gap-2 fade-in"
          style={{ background: 'rgba(109,59,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#23252b' }}>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-purple-400 bg-purple-500/10 border border-purple-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Console
              </span>
              <span className="text-xs text-gray-400 font-mono">Logged in as: <b>{user?.username}</b> ({user?.role})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Anime & Video Stream Manager
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add New Anime</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Anime Titles', value: animeList.length, icon: '🎬', color: '#6d3bff' },
            { label: 'Total Episodes', value: totalEpisodesCount, icon: '🎞️', color: '#ff4db8' },
            { label: 'Google Drive Streams', value: 'Active', icon: '☁️', color: '#4a8dff' },
            { label: 'Personal Server Engine', value: 'Ready', icon: '🚀', color: '#22c55e' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl flex items-center justify-between transition-transform hover:-translate-y-1"
              style={{ background: '#111216', border: '1px solid #23252b' }}
            >
              <div>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}40` }}
              >
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-2 border-b mb-6" style={{ borderColor: '#23252b' }}>
          {[
            { id: 'catalog', label: '🎬 Catalog & Video Management' },
            { id: 'streams', label: '📡 Streaming Architecture & Server Links' },
            { id: 'system', label: '⚙️ Admin System Status' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-3 text-xs sm:text-sm font-semibold transition-all border-b-2"
              style={{
                color: activeTab === tab.id ? '#6d3bff' : '#a0a0a0',
                borderColor: activeTab === tab.id ? '#6d3bff' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Anime Catalog Table & Management */}
        {activeTab === 'catalog' && (
          <div className="fade-in">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search titles, studios..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-black/40 border border-gray-800 text-white outline-none focus:border-purple-500"
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-gray-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-black/40 border border-gray-800 text-white outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Airing">Airing</option>
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            {/* Anime List Table */}
            <div className="rounded-2xl overflow-hidden border" style={{ background: '#111216', borderColor: '#23252b' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b uppercase tracking-wider text-gray-400 text-[10px]" style={{ borderColor: '#23252b', background: '#0e0f12' }}>
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Anime</th>
                      <th className="py-3.5 px-4 font-bold">Studio / Year</th>
                      <th className="py-3.5 px-4 font-bold">Episodes</th>
                      <th className="py-3.5 px-4 font-bold">Rating</th>
                      <th className="py-3.5 px-4 font-bold">Streams</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    {filteredList.map(anime => (
                      <tr key={anime.id} className="hover:bg-white/5 transition-colors">
                        {/* Anime Title & Poster */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={anime.poster}
                              alt={anime.title}
                              className="w-10 h-14 object-cover rounded-lg shrink-0 border border-white/10"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm truncate max-w-xs">{anime.title}</p>
                              <p className="text-[11px] text-gray-400 truncate">{anime.genres.slice(0, 2).join(', ')}</p>
                              <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}>
                                {anime.type || 'TV'} · {anime.status}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Studio / Year */}
                        <td className="py-3 px-4 text-gray-300">
                          <p className="font-medium text-white">{anime.studio}</p>
                          <p className="text-gray-500 text-[11px]">{anime.season} {anime.year}</p>
                        </td>

                        {/* Episodes */}
                        <td className="py-3 px-4 text-white font-medium">
                          {anime.episodes} eps
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                            ★ {anime.rating}
                          </span>
                        </td>

                        {/* Streams Status */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 text-[10px]">
                            <span className="flex items-center gap-1 text-purple-400">
                              <span>☁️</span> {anime.gdriveUrl ? 'G-Drive Linked' : 'Default G-Drive'}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span>🚀</span> {anime.personalServerUrl ? 'Custom Server' : 'Template Server'}
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEpisodeManager(anime)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
                              title="Manage Episode Links"
                            >
                              📺 Streams
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(anime)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all"
                              title="Edit Anime Metadata"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => onWatch(anime)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all"
                              title="Watch in Player"
                            >
                              ▶ View
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(anime.id)}
                              className="p-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete Anime"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Streaming Architecture & Server Links Overview */}
        {activeTab === 'streams' && (
          <div className="fade-in flex flex-col gap-6">
            <div className="p-6 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <span>📡</span> Streaming Engine Architecture
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                Aniflux provides a dual-mode video streaming infrastructure. You can host and stream episodes from public Google Drive shares today, and seamlessly switch or add high-bitrate video streams from your self-hosted server in the future.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-5 rounded-xl border" style={{ background: '#1b1d23', borderColor: '#2e313d' }}>
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-400 mb-2">
                    <span>☁️</span> Google Drive Public Link Stream
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Paste any public Google Drive sharing link or file ID. The system automatically converts it to a clean, fast preview stream player.
                  </p>
                  <div className="text-[11px] font-mono bg-black/60 p-3 rounded-lg text-gray-300">
                    Format: https://drive.google.com/file/d/<b>FILE_ID</b>/view
                  </div>
                </div>

                <div className="p-5 rounded-xl border" style={{ background: '#1b1d23', borderColor: '#2e313d' }}>
                  <div className="flex items-center gap-2 font-bold text-sm text-pink-400 mb-2">
                    <span>🚀</span> Personal Dedicated Server Stream
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Direct MP4, WebM, and HLS (.m3u8) video streaming with custom HTML5 video controls, timeline seeking, and speed selector.
                  </p>
                  <div className="text-[11px] font-mono bg-black/60 p-3 rounded-lg text-gray-300">
                    Pattern: https://stream.yourserver.com/anime/<b>&#123;id&#125;</b>/ep<b>&#123;ep&#125;</b>.mp4
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: System Status */}
        {activeTab === 'system' && (
          <div className="fade-in p-6 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
            <h2 className="text-base font-bold text-white mb-4">⚙️ System & Administrator Environment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-gray-300">
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Admin User Account:</span>
                <span className="text-emerald-400 font-bold">admin (admin@aniflux.io)</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Database Mode:</span>
                <span className="text-purple-400 font-bold">MySQL Cloud with In-Memory Mock Fallback</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">API Backend Engine:</span>
                <span className="text-white">Express 5.x REST API + Middleware</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">Video Stream Controller:</span>
                <span className="text-white">videoStream.ts (Multi-provider Engine)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Create or Edit Anime */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto fade-in">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl my-8 max-h-[90vh] overflow-y-auto" style={{ background: '#111216', border: '1px solid #2e313d' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingAnime ? '✏️ Edit Anime' : '✨ Add New Anime'}</span>
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveAnime} className="flex flex-col gap-4 text-xs">
              {/* Title & Japanese Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Anime Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solo Leveling"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-800 text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Japanese Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 俺だけレベルアップな件"
                    value={formTitleJp}
                    onChange={e => setFormTitleJp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-800 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Synopsis / Story Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed anime synopsis..."
                  value={formSynopsis}
                  onChange={e => setFormSynopsis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-800 text-white outline-none focus:border-purple-500"
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Poster Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formPoster}
                    onChange={e => setFormPoster(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-800 text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formBanner}
                    onChange={e => setFormBanner(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-800 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Studio, Producer, Year, Season */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Studio</label>
                  <input
                    type="text"
                    value={formStudio}
                    onChange={e => setFormStudio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Producer</label>
                  <input
                    type="text"
                    value={formProducer}
                    onChange={e => setFormProducer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Year</label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={e => setFormYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Season</label>
                  <select
                    value={formSeason}
                    onChange={e => setFormSeason(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none cursor-pointer"
                  >
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Type, Status, Episodes, Rating */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Format Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none cursor-pointer"
                  >
                    {ANIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Total Episodes</label>
                  <input
                    type="number"
                    min={1}
                    value={formEpisodes}
                    onChange={e => setFormEpisodes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Rating (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={10}
                    value={formRating}
                    onChange={e => setFormRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-gray-800 text-white outline-none"
                  />
                </div>
              </div>

              {/* Genres Multi-select Badges */}
              <div>
                <label className="text-gray-300 font-semibold block mb-1.5">Genres</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_GENRES.map(g => {
                    const isSelected = formGenres.includes(g)
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => toggleGenreSelection(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSelected ? 'bg-purple-600 text-white border border-purple-400' : 'bg-black/40 text-gray-400 border border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Default Stream Links */}
              <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 flex flex-col gap-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>⚡</span> Default Video Stream Links (Optional)
                </h4>
                <div>
                  <label className="text-gray-400 font-medium block mb-1 text-[11px]">
                    Default Google Drive Public Link / File ID:
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={formGdriveUrl}
                    onChange={e => setFormGdriveUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-medium block mb-1 text-[11px]">
                    Default Personal Server Stream URL:
                  </label>
                  <input
                    type="text"
                    placeholder="https://stream.yourserver.com/anime/1/ep1.mp4"
                    value={formPersonalServerUrl}
                    onChange={e => setFormPersonalServerUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
                >
                  {editingAnime ? 'Save Changes' : 'Create Anime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Episode & Stream Link Manager */}
      {isEpisodeModalOpen && selectedAnimeForEpisodes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto fade-in">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl my-8 max-h-[90vh] overflow-y-auto" style={{ background: '#111216', border: '1px solid #2e313d' }}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📺 Episode Stream Links</span>
                </h2>
                <p className="text-xs text-purple-400 font-semibold mt-0.5">{selectedAnimeForEpisodes.title}</p>
              </div>
              <button onClick={() => setIsEpisodeModalOpen(false)} className="text-gray-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Episode Quick Selector Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">Select Episode to Configure:</span>
                <button
                  onClick={handleAutoGenerateServerStreams}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline"
                >
                  ⚡ Auto-fill Server URLs for all {selectedAnimeForEpisodes.episodes} episodes
                </button>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5 max-h-32 overflow-y-auto p-1 bg-black/40 rounded-xl border border-gray-800">
                {Array.from({ length: selectedAnimeForEpisodes.episodes || 12 }, (_, idx) => {
                  const ep = idx + 1
                  const isCur = selectedEpNumber === ep
                  return (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => handleSelectEpisode(ep)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all ${
                        isCur
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                          : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {ep}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Episode Edit Form */}
            <form onSubmit={handleSaveEpisodeStream} className="flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Editing Episode {selectedEpNumber}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onWatch(selectedAnimeForEpisodes)
                      setIsEpisodeModalOpen(false)
                    }}
                    className="text-[11px] font-bold text-pink-400 hover:text-pink-300"
                  >
                    ▶ Test Play in Watch Page
                  </button>
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Episode Title</label>
                  <input
                    type="text"
                    value={epTitleInput}
                    onChange={e => setEpTitleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1 flex items-center gap-1.5">
                    <span>☁️</span> Google Drive Public Link / File ID:
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view"
                    value={epGdriveInput}
                    onChange={e => setEpGdriveInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-white font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1 flex items-center gap-1.5">
                    <span>🚀</span> Personal Server Video URL (Future Streaming):
                  </label>
                  <input
                    type="text"
                    placeholder={`https://stream.yourserver.com/anime/${selectedAnimeForEpisodes.id}/ep${selectedEpNumber}.mp4`}
                    value={epServerInput}
                    onChange={e => setEpServerInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-gray-800 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-5 py-2 rounded-xl font-semibold text-gray-400 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}
                >
                  Save Episode {selectedEpNumber} Links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="p-6 rounded-3xl max-w-sm w-full text-center" style={{ background: '#111216', border: '1px solid #23252b' }}>
            <span className="text-4xl block mb-3">⚠️</span>
            <h3 className="text-base font-bold text-white mb-2">Delete Anime?</h3>
            <p className="text-xs text-gray-400 mb-6">
              Are you sure you want to delete this anime from the catalog? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
