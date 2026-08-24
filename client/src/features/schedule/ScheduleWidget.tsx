import { useState } from 'react'
import { scheduleData, type Anime } from '@/shared/data/animeData'

interface ScheduleWidgetProps {
  onAnimeClick: (anime: Anime) => void
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

export default function ScheduleWidget({ onAnimeClick }: ScheduleWidgetProps) {
  const [activeDay, setActiveDay] = useState(today)

  const dayData = scheduleData.find(d => d.day === activeDay)

  return (
    <section className="py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Airing Schedule</h2>
          <button className="text-sm font-medium" style={{ color: '#6d3bff' }}>Full Schedule</button>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
              style={{
                background: activeDay === day ? '#6d3bff' : '#111216',
                border: `1px solid ${activeDay === day ? '#6d3bff' : '#23252b'}`,
                color: activeDay === day ? 'white' : '#a0a0a0',
              }}
            >
              <span className="text-xs font-semibold">{day}</span>
              {day === today && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeDay === day ? 'rgba(255,255,255,0.6)' : '#6d3bff' }} />
              )}
            </button>
          ))}
        </div>

        {/* Schedule entries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dayData?.anime.map((anime) => (
            <button
              key={anime.id}
              className="flex gap-4 p-4 rounded-xl transition-all text-left hover:bg-white/5"
              style={{ background: '#111216', border: '1px solid #23252b' }}
              onClick={() => onAnimeClick(anime)}
            >
              <div className="relative shrink-0 w-16 h-22 rounded-xl overflow-hidden" style={{ height: 88 }}>
                <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" style={{ background: '#1b1d23' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{anime.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#a0a0a0' }}>{anime.studio}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(109,59,255,0.2)', color: '#6d3bff' }}>
                    Ep {anime.episodes}
                  </span>
                  {anime.isNew && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,77,184,0.15)', color: '#ff4db8' }}>New</span>
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: '#a0a0a0' }}>{dayData.time}</p>
              </div>
            </button>
          ))}
          {(!dayData || dayData.anime.length === 0) && (
            <div className="col-span-2 py-12 flex flex-col items-center gap-2">
              <span className="text-3xl">📅</span>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>No episodes scheduled</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
