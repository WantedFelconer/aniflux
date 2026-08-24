import { useState } from 'react'
import { scheduleData, animeData, type Anime } from '@/shared/data/animeData'
import { useApp } from '@/shared/context/AppContext'

interface Props { onAnimeClick: (a: Anime) => void; onWatch: (a: Anime) => void }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const todayIdx = (new Date().getDay() + 6) % 7

const scheduleByDay: Record<string, { anime: Anime; episode: number; time: string; isNew?: boolean }[]> = {
  Monday: [
    { anime: animeData[0], episode: 15, time: '09:30', isNew: true },
    { anime: animeData[3], episode: 13, time: '17:00' },
    { anime: animeData[9], episode: 7, time: '21:00' },
  ],
  Tuesday: [
    { anime: animeData[1], episode: 14, time: '10:00', isNew: true },
    { anime: animeData[5], episode: 14, time: '23:30' },
  ],
  Wednesday: [
    { anime: animeData[2], episode: 9, time: '09:00', isNew: true },
    { anime: animeData[6], episode: 11, time: '14:30' },
    { anime: animeData[12], episode: 8, time: '20:00' },
    { anime: animeData[15], episode: 6, time: '22:00' },
  ],
  Thursday: [
    { anime: animeData[4], episode: 4, time: '11:00' },
    { anime: animeData[8], episode: 10, time: '18:00' },
  ],
  Friday: [
    { anime: animeData[7], episode: 26, time: '10:30', isNew: true },
    { anime: animeData[10], episode: 12, time: '19:00', isNew: true },
    { anime: animeData[14], episode: 5, time: '23:00' },
  ],
  Saturday: [
    { anime: animeData[11], episode: 15, time: '12:00', isNew: true },
    { anime: animeData[13], episode: 9, time: '16:30' },
    { anime: animeData[16], episode: 3, time: '21:30' },
  ],
  Sunday: [
    { anime: animeData[17], episode: 26, time: '09:00', isNew: true },
    { anime: animeData[0], episode: 15, time: '15:00' },
    { anime: animeData[2], episode: 9, time: '20:30' },
  ],
}

export default function SchedulePage({ onAnimeClick, onWatch }: Props) {
  const [activeDay, setActiveDay] = useState(DAYS[todayIdx])
  const [view, setView] = useState<'day' | 'week'>('day')
  const { bookmarks, toggleBookmark, listEntries } = useApp()

  const entries = scheduleByDay[activeDay] ?? []

  return (
    <div className="min-h-screen" style={{ paddingTop: 80 }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <span style={{ background: 'linear-gradient(135deg,#4a8dff,#6d3bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📅 Schedule</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#5a5a5a' }}>New episodes every week — never miss a drop</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
            {(['day', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all" style={{ background: view === v ? '#6d3bff' : 'transparent', color: view === v ? 'white' : '#5a5a5a' }}>{v}</button>
            ))}
          </div>
        </div>

        {/* Day picker */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {DAYS.map((day, i) => {
            const isToday = i === todayIdx
            const isActive = activeDay === day
            const count = scheduleByDay[day]?.length ?? 0
            return (
              <button key={day} onClick={() => setActiveDay(day)} className="shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all" style={{ background: isActive ? '#6d3bff' : '#111216', border: `1px solid ${isActive ? '#6d3bff' : isToday ? 'rgba(109,59,255,0.4)' : '#23252b'}`, minWidth: 72 }}>
                <span className="text-xs font-bold" style={{ color: isActive ? 'white' : isToday ? '#6d3bff' : '#5a5a5a' }}>{SHORT[i]}</span>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black" style={{ background: isActive ? 'rgba(255,255,255,0.2)' : '#1b1d23', color: isActive ? 'white' : '#a0a0a0' }}>{count}</span>
                {isToday && !isActive && <span className="text-xs font-bold" style={{ color: '#6d3bff', fontSize: 8 }}>TODAY</span>}
              </button>
            )
          })}
        </div>

        {view === 'day' ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
              {activeDay}
              {activeDay === DAYS[todayIdx] && <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(109,59,255,0.2)', color: '#6d3bff' }}>Today</span>}
              <span style={{ color: '#3a3a3a' }}>— {entries.length} episodes</span>
            </h2>
            {entries.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-4">😴</p>
                <p className="font-semibold">No episodes today</p>
                <p className="text-sm mt-1" style={{ color: '#5a5a5a' }}>Check another day</p>
              </div>
            ) : entries.map((entry, i) => (
              <ScheduleRow key={i} entry={entry} bookmarked={bookmarks.has(entry.anime.id)} inList={!!listEntries[entry.anime.id]} onToggleBookmark={() => toggleBookmark(entry.anime.id)} onAnimeClick={() => onAnimeClick(entry.anime)} onWatch={() => onWatch(entry.anime)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {DAYS.map(day => {
              const dayEntries = scheduleByDay[day] ?? []
              const isToday = day === DAYS[todayIdx]
              return (
                <div key={day} className="rounded-2xl overflow-hidden" style={{ background: '#111216', border: `1px solid ${isToday ? 'rgba(109,59,255,0.4)' : '#23252b'}` }}>
                  <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: '#23252b', background: isToday ? 'rgba(109,59,255,0.08)' : 'transparent' }}>
                    <span className="font-bold text-sm">{day}</span>
                    {isToday && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#6d3bff', color: 'white' }}>TODAY</span>}
                    <span className="text-xs" style={{ color: '#3a3a3a' }}>{dayEntries.length} ep</span>
                  </div>
                  <div className="flex flex-col gap-0">
                    {dayEntries.map((entry, i) => (
                      <button key={i} onClick={() => onAnimeClick(entry.anime)} className="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]" style={{ borderBottom: i < dayEntries.length - 1 ? '1px solid #1a1c22' : 'none' }}>
                        <img src={entry.anime.poster} alt="" className="w-8 h-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{entry.anime.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>Ep {entry.episode} · {entry.time}</p>
                        </div>
                        {entry.isNew && <span className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#ff4db8', color: 'white', fontSize: 9 }}>NEW</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="h-20 md:h-10" />
    </div>
  )
}

function ScheduleRow({ entry, bookmarked, inList, onToggleBookmark, onAnimeClick, onWatch }: { entry: { anime: Anime; episode: number; time: string; isNew?: boolean }; bookmarked: boolean; inList: boolean; onToggleBookmark: () => void; onAnimeClick: () => void; onWatch: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl transition-colors cursor-pointer" style={{ background: hov ? 'rgba(255,255,255,0.025)' : '#111216', border: '1px solid #23252b' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onAnimeClick}>
      <div className="text-center shrink-0" style={{ minWidth: 44 }}>
        <p className="text-sm font-black tabular-nums" style={{ color: '#6d3bff' }}>{entry.time}</p>
      </div>
      <div className="w-px h-12 rounded-full shrink-0" style={{ background: '#23252b' }} />
      <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0">
        <img src={entry.anime.poster} alt={entry.anime.title} className="w-full h-full object-cover" />
        {entry.isNew && <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-white font-black" style={{ background: '#ff4db8', fontSize: 8 }}>NEW</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{entry.anime.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#5a5a5a' }}>{entry.anime.studio} · {entry.anime.genres[0]}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}>Episode {entry.episode}</span>
          {inList && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>In List</span>}
          <span className="text-xs" style={{ color: '#3a3a3a' }}>{entry.anime.duration}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={e => { e.stopPropagation(); onToggleBookmark() }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: bookmarked ? 'rgba(109,59,255,0.2)' : '#1b1d23', color: bookmarked ? '#6d3bff' : '#5a5a5a', border: `1px solid ${bookmarked ? '#6d3bff44' : '#23252b'}` }}>
          <svg width="12" height="12" viewBox="0 0 14 16" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2h10a1 1 0 0 1 1 1v11l-6-3-6 3V3a1 1 0 0 1 1-1z"/></svg>
        </button>
        <button onClick={e => { e.stopPropagation(); onWatch() }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all" style={{ background: '#6d3bff', color: 'white', boxShadow: '0 4px 12px rgba(109,59,255,0.3)' }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg>
          Watch
        </button>
      </div>
    </div>
  )
}
