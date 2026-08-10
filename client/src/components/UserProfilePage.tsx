import { useState } from 'react'
import { animeData, continueWatchingData, type Anime } from '../data/animeData'
import { useApp } from '../context/AppContext'

interface UserProfilePageProps {
  onAnimeClick: (anime: Anime) => void
  onWatch: (anime: Anime) => void
}

const tabs = ['Overview', 'History', 'Stats', 'Achievements', 'Settings']

const achievements = [
  { id: 1, icon: '🏆', title: 'Centurion', desc: 'Watched 100+ episodes', unlocked: true, color: '#f59e0b' },
  { id: 2, icon: '🔥', title: '7-Day Streak', desc: 'Watched anime 7 days in a row', unlocked: true, color: '#ef4444' },
  { id: 3, icon: '⭐', title: 'Critic', desc: 'Left 10+ reviews', unlocked: true, color: '#6d3bff' },
  { id: 4, icon: '🎯', title: 'Completionist', desc: 'Completed 5 anime', unlocked: true, color: '#22c55e' },
  { id: 5, icon: '💬', title: 'Socialite', desc: 'Posted 50+ comments', unlocked: true, color: '#4a8dff' },
  { id: 6, icon: '🌙', title: 'Night Owl', desc: 'Watch after midnight 10 times', unlocked: true, color: '#a855f7' },
  { id: 7, icon: '🤝', title: 'Watch Together', desc: 'Join a Watch Party', unlocked: false, color: '#ff4db8' },
  { id: 8, icon: '📚', title: 'Librarian', desc: 'Add 20 anime to your list', unlocked: false, color: '#f59e0b' },
  { id: 9, icon: '🎬', title: 'Marathoner', desc: 'Watch 5 episodes in a day', unlocked: false, color: '#ef4444' },
  { id: 10, icon: '👑', title: 'Legend', desc: 'Reach 1000 hours watched', unlocked: false, color: '#6d3bff' },
  { id: 11, icon: '🗺️', title: 'Explorer', desc: 'Watch anime from 10 genres', unlocked: false, color: '#22c55e' },
  { id: 12, icon: '⚡', title: 'Speed Runner', desc: 'Finish 3 anime in a week', unlocked: false, color: '#4a8dff' },
]

const historyData = [
  { anime: animeData[0], ep: 14, date: 'Today', time: '9:45 PM', duration: 24 },
  { anime: animeData[6], ep: 10, date: 'Today', time: '7:20 PM', duration: 24 },
  { anime: animeData[2], ep: 8, date: 'Yesterday', time: '11:00 PM', duration: 25 },
  { anime: animeData[4], ep: 3, date: 'Yesterday', time: '8:30 PM', duration: 24 },
  { anime: animeData[1], ep: 13, date: 'Jan 29', time: '10:15 PM', duration: 23 },
  { anime: animeData[3], ep: 12, date: 'Jan 28', time: '9:00 PM', duration: 22 },
  { anime: animeData[5], ep: 13, date: 'Jan 27', time: '8:45 PM', duration: 23 },
]

const genreStats = [
  { name: 'Action', count: 38, color: '#ef4444' },
  { name: 'Fantasy', count: 31, color: '#8b5cf6' },
  { name: 'Sci-Fi', count: 24, color: '#3b82f6' },
  { name: 'Supernatural', count: 19, color: '#a855f7' },
  { name: 'Romance', count: 14, color: '#ec4899' },
  { name: 'Mystery', count: 11, color: '#6b7280' },
  { name: 'Psychological', count: 9, color: '#7c3aed' },
  { name: 'Drama', count: 7, color: '#14b8a6' },
]

export default function UserProfilePage({ onAnimeClick, onWatch }: UserProfilePageProps) {
  const { user, updateUser, listEntries, history, clearHistory, favorites } = useApp()
  const [activeTab, setActiveTab] = useState('Overview')
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [notifEpisodes, setNotifEpisodes] = useState(true)
  const [notifFriends, setNotifFriends] = useState(true)
  const [notifNews, setNotifNews] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [skipIntro, setSkipIntro] = useState(true)
  const [skipOutro, setSkipOutro] = useState(false)
  const [quality, setQuality] = useState('1080p')
  const [language, setLanguage] = useState('Sub')

  const allEntries = Object.values(listEntries)
  const totalEps = allEntries.reduce((s, e) => s + e.episodesWatched, 0)
  const totalDays = (totalEps * 24 / 1440).toFixed(1)
  const completedCount = allEntries.filter(e => e.status === 'Completed').length
  const watchingCount = allEntries.filter(e => e.status === 'Watching').length
  const favoriteAnime = animeData.filter(a => favorites.has(a.id)).slice(0, 6)
  const recentHistory = history.slice(0, 5)

  const handleSaveProfile = () => { updateUser({ username, bio }); setEditMode(false) }

  const maxGenreCount = Math.max(...genreStats.map(g => g.count))

  return (
    <div className="min-h-screen" style={{ paddingTop: 64 }}>
      {/* Banner */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=600&fit=crop&auto=format"
          alt="banner"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #09090b 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(109,59,255,0.15) 0%, rgba(74,141,255,0.1) 100%)' }} />

        {/* Edit banner button */}
        <button
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0a0', backdropFilter: 'blur(8px)' }}
        >
          <PencilIcon /> Edit Banner
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6 relative z-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-black border-4"
              style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', borderColor: '#09090b', boxShadow: '0 0 32px rgba(109,59,255,0.4)' }}
            >
              {user.avatarInitial}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#6d3bff', border: '2px solid #09090b' }}
            >
              <PencilIcon small />
            </button>
          </div>

          {/* Name + bio */}
          <div className="flex-1 min-w-0 pb-1">
            {editMode ? (
              <div className="flex flex-col gap-2">
                <input value={username} onChange={e => setUsername(e.target.value)} className="text-2xl font-black bg-transparent outline-none border-b" style={{ borderColor: '#6d3bff', color: 'white' }} />
                <input value={bio} onChange={e => setBio(e.target.value)} className="text-sm bg-transparent outline-none border-b" style={{ borderColor: '#23252b', color: '#a0a0a0' }} />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black">{username}</h1>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(109,59,255,0.2)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.3)' }}>Level {user.level}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>✦ Pro Member</span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#a0a0a0' }}>{bio}</p>
                <p className="text-xs mt-1.5" style={{ color: '#6b6b6b' }}>Member since {user.joinedDate} · 847 followers · 213 following</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: editMode ? '#6d3bff' : '#1b1d23', border: `1px solid ${editMode ? '#6d3bff' : '#23252b'}`, color: editMode ? 'white' : '#a0a0a0' }}
            >
              <PencilIcon /> {editMode ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-6 p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Level {user.level}</span>
            <span className="text-xs" style={{ color: '#a0a0a0' }}>{user.xp.toLocaleString()} / {user.xpMax.toLocaleString()} XP → Level {user.level + 1}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1b1d23' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(user.xp / user.xpMax * 100)}%`, background: 'linear-gradient(90deg, #6d3bff, #ff4db8)' }} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Days', value: `${totalDays}d`, icon: '⏱️' },
            { label: 'Episodes', value: totalEps, icon: '▶️' },
            { label: 'Completed', value: completedCount, icon: '✅' },
            { label: 'Watching', value: watchingCount, icon: '👁️' },
            { label: 'Reviews', value: 18, icon: '✍️' },
            { label: 'Streak', value: '7d 🔥', icon: '🔥' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="p-3 rounded-xl text-center" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-sm font-black">{value}</p>
              <p style={{ fontSize: 10, color: '#a0a0a0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto scrollbar-hide" style={{ borderColor: '#23252b' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium shrink-0 transition-all border-b-2"
              style={{ color: activeTab === tab ? '#6d3bff' : '#a0a0a0', borderColor: activeTab === tab ? '#6d3bff' : 'transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- Overview --- */}
        {activeTab === 'Overview' && (
          <div className="fade-in grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Continue Watching */}
            <div>
              <h3 className="font-semibold mb-4">Continue Watching</h3>
              <div className="flex flex-col gap-2 mb-6">
                {continueWatchingData.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5" style={{ background: '#111216', border: '1px solid #23252b' }}>
                    <div className="shrink-0 w-16 h-10 rounded-lg overflow-hidden cursor-pointer" onClick={() => onWatch(item)}>
                      <img src={item.banner} alt={item.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)', background: '#1b1d23' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1b1d23' }}>
                          <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: 'linear-gradient(90deg, #6d3bff, #ff4db8)' }} />
                        </div>
                        <span style={{ fontSize: 10, color: '#a0a0a0' }}>Ep {item.currentEp}</span>
                      </div>
                    </div>
                    <button onClick={() => onWatch(item)} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Favorites */}
              <h3 className="font-semibold mb-4">Favorite Anime</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {(favoriteAnime.length > 0 ? favoriteAnime : animeData.slice(0, 6)).map(a => (
                  <div key={a.id} className="shrink-0 cursor-pointer group" style={{ width: 100 }} onClick={() => onAnimeClick(a)}>
                    <div className="relative rounded-xl overflow-hidden transition-all group-hover:scale-105" style={{ aspectRatio: '2/3' }}>
                      <img src={a.poster} alt={a.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.8) 0%, transparent 60%)' }} />
                    </div>
                    <p style={{ fontSize: 10 }} className="mt-1 truncate font-medium">{a.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Recent activity + favorite genres */}
            <div className="flex flex-col gap-5">
              {/* Favorite genres */}
              <div className="p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <h3 className="font-semibold mb-3 text-sm">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {['Action', 'Fantasy', 'Sci-Fi', 'Supernatural', 'Mystery'].map((g, i) => (
                    <span key={g} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: `hsl(${i * 40 + 200}, 60%, 20%)`, color: `hsl(${i * 40 + 200}, 80%, 70%)`, border: `1px solid hsl(${i * 40 + 200}, 60%, 30%)` }}>{g}</span>
                  ))}
                </div>
              </div>

              {/* Recent reviews */}
              <div className="p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <h3 className="font-semibold mb-3 text-sm">Recent Reviews</h3>
                <div className="flex flex-col gap-3">
                  {animeData.slice(0, 3).map((a, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="shrink-0 w-8 h-10 rounded-lg overflow-hidden">
                        <img src={a.poster} alt={a.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{a.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <span key={s} style={{ fontSize: 10, color: s < [4, 5, 4][i] ? '#f59e0b' : '#23252b' }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlocked badges */}
              <div className="p-4 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                <h3 className="font-semibold mb-3 text-sm">Recent Achievements</h3>
                <div className="grid grid-cols-3 gap-2">
                  {achievements.filter(a => a.unlocked).slice(0, 6).map(a => (
                    <div key={a.id} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: '#1b1d23' }}>
                      <span className="text-2xl">{a.icon}</span>
                      <p style={{ fontSize: 9, color: '#a0a0a0', textAlign: 'center' }} className="leading-tight">{a.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- History --- */}
        {activeTab === 'History' && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: '#a0a0a0' }}>{history.length} entries in your history</p>
              <button onClick={clearHistory} className="text-sm font-medium" style={{ color: '#ef4444' }}>Clear History</button>
            </div>
            <div className="flex flex-col gap-2">
              {history.slice(0, 30).map((item, i) => {
                const date = new Date(item.watchedAt)
                const now = new Date()
                const diffH = Math.floor((now.getTime() - item.watchedAt) / 3600000)
                const label = diffH < 1 ? 'Just now' : diffH < 24 ? `${diffH}h ago` : diffH < 48 ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer" style={{ background: '#111216', border: '1px solid #23252b' }} onClick={() => onWatch(item.anime)}>
                    <div className="shrink-0 w-20 h-12 rounded-lg overflow-hidden">
                      <img src={item.anime.banner} alt={item.anime.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)', background: '#1b1d23' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.anime.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#a0a0a0' }}>Episode {item.episode} · {item.duration} min</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#6b6b6b' }}>{label}</span>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff', border: '1px solid rgba(109,59,255,0.2)' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg>
                    </button>
                  </div>
                )
              })}
              {history.length === 0 && <div className="py-12 text-center"><p className="text-4xl mb-3">📭</p><p style={{ color: '#5a5a5a' }}>No watch history yet</p></div>}
            </div>
          </div>
        )}

        {/* --- Stats --- */}
        {activeTab === 'Stats' && (
          <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre distribution */}
            <div className="p-5 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <h3 className="font-semibold mb-4">Genre Breakdown</h3>
              <div className="flex flex-col gap-3">
                {genreStats.map(({ name, count, color }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs w-24 truncate" style={{ color: '#a0a0a0' }}>{name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1b1d23' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxGenreCount) * 100}%`, background: color }} />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch time by day */}
            <div className="p-5 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <h3 className="font-semibold mb-4">Watch Time — Last 7 Days</h3>
              <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [45, 70, 30, 90, 60, 100, 55]
                  return (
                    <div key={day} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className="w-full rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${heights[i]}%`, background: i === 3 ? 'linear-gradient(180deg, #ff4db8, #6d3bff)' : 'linear-gradient(180deg, #6d3bff66, #6d3bff33)' }}
                      />
                      <span style={{ fontSize: 9, color: '#6b6b6b' }}>{day}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t" style={{ borderColor: '#23252b' }}>
                <div>
                  <p className="text-xs" style={{ color: '#a0a0a0' }}>Total this week</p>
                  <p className="text-lg font-bold">8.4 hrs</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: '#a0a0a0' }}>Daily average</p>
                  <p className="text-lg font-bold">1.2 hrs</p>
                </div>
              </div>
            </div>

            {/* Studio breakdown */}
            <div className="p-5 rounded-2xl md:col-span-2" style={{ background: '#111216', border: '1px solid #23252b' }}>
              <h3 className="font-semibold mb-4">Top Studios Watched</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Ufotable', count: 42, color: '#6d3bff' },
                  { name: 'MAPPA', count: 38, color: '#ff4db8' },
                  { name: 'Wit Studio', count: 29, color: '#4a8dff' },
                  { name: 'KyoAni', count: 24, color: '#22c55e' },
                ].map(s => (
                  <div key={s.name} className="p-4 rounded-xl text-center" style={{ background: '#1b1d23', border: '1px solid #23252b' }}>
                    <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-lg font-black" style={{ background: `${s.color}22`, color: s.color }}>
                      {s.name[0]}
                    </div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#a0a0a0' }}>{s.count} episodes</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Achievements --- */}
        {activeTab === 'Achievements' && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm" style={{ color: '#a0a0a0' }}>{achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked</p>
              <div className="h-2 w-48 rounded-full overflow-hidden" style={{ background: '#1b1d23' }}>
                <div className="h-full rounded-full" style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`, background: 'linear-gradient(90deg, #6d3bff, #ff4db8)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl flex flex-col items-center gap-3 text-center transition-all"
                  style={{
                    background: a.unlocked ? '#111216' : '#0d0e10',
                    border: `1px solid ${a.unlocked ? a.color + '44' : '#23252b'}`,
                    opacity: a.unlocked ? 1 : 0.45,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: a.unlocked ? `${a.color}22` : '#1b1d23', filter: a.unlocked ? 'none' : 'grayscale(1)' }}
                  >
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{a.title}</p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: '#a0a0a0' }}>{a.desc}</p>
                  </div>
                  {a.unlocked && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${a.color}22`, color: a.color }}>Unlocked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Settings --- */}
        {activeTab === 'Settings' && (
          <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Player settings */}
            <SettingsCard title="Player">
              <SettingToggle label="Auto-Play Next Episode" sub="Automatically start the next episode" value={autoPlay} onChange={setAutoPlay} />
              <SettingToggle label="Skip Intro" sub="Skip opening sequences automatically" value={skipIntro} onChange={setSkipIntro} />
              <SettingToggle label="Skip Outro" sub="Skip ending sequences automatically" value={skipOutro} onChange={setSkipOutro} />
              <SettingSelect label="Default Quality" options={['Auto', '1080p', '720p', '480p']} value={quality} onChange={setQuality} />
              <SettingSelect label="Default Language" options={['Sub', 'Dub', 'Both']} value={language} onChange={setLanguage} />
            </SettingsCard>

            {/* Notifications */}
            <SettingsCard title="Notifications">
              <SettingToggle label="New Episodes" sub="When a new episode drops for anime in your list" value={notifEpisodes} onChange={setNotifEpisodes} />
              <SettingToggle label="Friend Activity" sub="When friends add or complete anime" value={notifFriends} onChange={setNotifFriends} />
              <SettingToggle label="News & Updates" sub="Platform news and announcements" value={notifNews} onChange={setNotifNews} />
            </SettingsCard>

            {/* Account */}
            <SettingsCard title="Account">
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Email', value: 'kaito@aniflux.io' },
                  { label: 'Username', value: username },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#a0a0a0' }}>{label}</p>
                    <div className="flex gap-2">
                      <input defaultValue={value} className="flex-1 px-3 py-2 rounded-xl text-sm outline-none bg-transparent" style={{ background: '#1b1d23', border: '1px solid #23252b', color: 'white' }} />
                      <button className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: '#6d3bff', color: 'white' }}>Save</button>
                    </div>
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-xl text-sm font-medium mt-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                  Change Password
                </button>
              </div>
            </SettingsCard>

            {/* Danger zone */}
            <SettingsCard title="Danger Zone">
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Clear Watch History</p>
                  <p className="text-xs mt-0.5 mb-3" style={{ color: '#a0a0a0' }}>This will permanently delete all your watch history.</p>
                  <button className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Clear History</button>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Delete Account</p>
                  <p className="text-xs mt-0.5 mb-3" style={{ color: '#a0a0a0' }}>Permanently delete your account and all your data.</p>
                  <button className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Delete Account</button>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}
      </div>
      <div className="h-20 md:h-10" />
    </div>
  )
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function SettingToggle({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#a0a0a0' }}>{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all shrink-0"
        style={{ background: value ? '#6d3bff' : '#23252b' }}
      >
        <div className="w-5 h-5 rounded-full bg-white transition-all mx-0.5" style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  )
}

function SettingSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium">{label}</p>
      <select value={value} onChange={e => onChange(e.target.value)} className="px-3 py-1.5 rounded-lg text-sm outline-none cursor-pointer shrink-0" style={{ background: '#1b1d23', border: '1px solid #23252b', color: 'white' }}>
        {options.map(o => <option key={o} value={o} style={{ background: '#111216' }}>{o}</option>)}
      </select>
    </div>
  )
}

function PencilIcon({ small }: { small?: boolean }) {
  const s = small ? 10 : 12
  return (
    <svg width={s} height={s} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z"/>
    </svg>
  )
}
