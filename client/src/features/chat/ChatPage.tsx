import { useState, useRef, useEffect } from 'react'
import { animeData, type Anime } from '@/shared/data/animeData'

interface ChatPageProps {
  onAnimeClick: (anime: Anime) => void
  onWatch: (anime: Anime) => void
}

interface Message {
  id: number
  user: string
  avatar: string
  color: string
  text: string
  time: string
  reaction?: string
}

const seedMessages: Message[] = [
  { id: 1, user: 'KiritoFan99', avatar: 'K', color: '#6d3bff', text: 'Void Chronicle ep 15 just dropped, anyone watching right now?? 🔥', time: '9:02 PM', reaction: '🔥 12' },
  { id: 2, user: 'AnimeQueen', avatar: 'A', color: '#ff4db8', text: 'YES!! I\'m on the episode right now, the fight scene is insane', time: '9:03 PM' },
  { id: 3, user: 'SakuraBlossom', avatar: 'S', color: '#4a8dff', text: 'Spoiler warning pls 😭 I haven\'t watched it yet', time: '9:04 PM', reaction: '😭 8' },
  { id: 4, user: 'TokyoGhoulFan', avatar: 'T', color: '#22c55e', text: 'Don\'t worry, we\'ll keep it vague. Just saying: the ending is WILD', time: '9:04 PM' },
  { id: 5, user: 'KiritoFan99', avatar: 'K', color: '#6d3bff', text: 'Anyone want to start a Watch Together session for ep 15?', time: '9:06 PM', reaction: '✋ 7' },
  { id: 6, user: 'NightOwlOtaku', avatar: 'N', color: '#f59e0b', text: 'I\'m in! Creating a room now. Waiting for 4 more people', time: '9:07 PM' },
  { id: 7, user: 'AnimeQueen', avatar: 'A', color: '#ff4db8', text: 'What server are you using for streams? VidStream has been lagging for me', time: '9:08 PM' },
  { id: 8, user: 'TokyoGhoulFan', avatar: 'T', color: '#22c55e', text: 'StreamSB has been solid, try that one', time: '9:09 PM' },
]

const rooms = [
  { id: 1, name: 'Void Chronicle Fan Club', anime: animeData[0], members: 12, maxMembers: 20, episode: 15, host: 'KiritoFan99' },
  { id: 2, name: 'Friday Night Watch Party', anime: animeData[6], members: 6, maxMembers: 10, episode: 10, host: 'AnimeQueen' },
  { id: 3, name: 'Aurora Protocol Marathon', anime: animeData[2], members: 4, maxMembers: 8, episode: 1, host: 'NightOwlOtaku' },
]

const activeUsers = [
  { name: 'KiritoFan99', avatar: 'K', color: '#6d3bff', status: 'Watching Void Chronicle' },
  { name: 'AnimeQueen', avatar: 'A', color: '#ff4db8', status: 'Online' },
  { name: 'SakuraBlossom', avatar: 'S', color: '#4a8dff', status: 'Online' },
  { name: 'TokyoGhoulFan', avatar: 'T', color: '#22c55e', status: 'Watching Neon Requiem' },
  { name: 'NightOwlOtaku', avatar: 'N', color: '#f59e0b', status: 'Hosting a room' },
  { name: 'YukiSenpai', avatar: 'Y', color: '#a855f7', status: 'Online' },
  { name: 'DragonSlayer', avatar: 'D', color: '#ef4444', status: 'AFK' },
]

const channels = [
  { id: 'general', name: 'general', icon: '#' },
  { id: 'spoilers', name: 'spoilers', icon: '⚠️' },
  { id: 'recommendations', name: 'recommendations', icon: '📋' },
  { id: 'fan-art', name: 'fan-art', icon: '🎨' },
  { id: 'news', name: 'news', icon: '📰' },
]

export default function ChatPage({ onAnimeClick, onWatch }: ChatPageProps) {
  const [activeSection, setActiveSection] = useState<'community' | 'watch-together'>('community')
  const [messages, setMessages] = useState<Message[]>(seedMessages)
  const [input, setInput] = useState('')
  const [activeChannel, setActiveChannel] = useState('general')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [joinedRoom, setJoinedRoom] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'You',
      avatar: 'K',
      color: '#6d3bff',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)', marginTop: 64, background: '#09090b' }}>

      {/* Left sidebar: channels + section switcher */}
      <aside className="hidden md:flex flex-col shrink-0" style={{ width: 220, background: '#0e0f12', borderRight: '1px solid #23252b' }}>
        {/* Section Tabs */}
        <div className="p-3 border-b" style={{ borderColor: '#23252b' }}>
          <div className="flex rounded-xl overflow-hidden" style={{ background: '#1b1d23', border: '1px solid #23252b' }}>
            {(['community', 'watch-together'] as const).map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className="flex-1 py-2 text-xs font-semibold transition-all"
                style={{ background: activeSection === s ? '#6d3bff' : 'transparent', color: activeSection === s ? 'white' : '#a0a0a0' }}
              >
                {s === 'community' ? '💬 Chat' : '🎬 Watch'}
              </button>
            ))}
          </div>
        </div>

        {activeSection === 'community' ? (
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a0a0a0' }}>Channels</p>
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 text-left"
                style={{ background: activeChannel === ch.id ? 'rgba(109,59,255,0.15)' : 'transparent', color: activeChannel === ch.id ? '#6d3bff' : '#a0a0a0' }}
              >
                <span style={{ fontSize: 13 }}>{ch.icon}</span>
                {ch.name}
                {ch.id === 'general' && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#ff4db8', color: 'white', fontSize: 9 }}>8</span>}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#a0a0a0' }}>Active Rooms</p>
            {rooms.map(r => (
              <button
                key={r.id}
                onClick={() => setJoinedRoom(joinedRoom === r.id ? null : r.id)}
                className="w-full text-left p-2.5 rounded-xl mb-2 transition-all hover:bg-white/5"
                style={{ background: joinedRoom === r.id ? 'rgba(109,59,255,0.15)' : '#1b1d23', border: `1px solid ${joinedRoom === r.id ? '#6d3bff44' : '#23252b'}` }}
              >
                <p className="text-xs font-semibold truncate">{r.name}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#a0a0a0' }}>{r.anime.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex">
                    {Array.from({ length: Math.min(r.members, 4) }).map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full -ml-1 first:ml-0 flex items-center justify-center text-xs font-bold" style={{ background: `hsl(${i * 60 + 200}, 60%, 40%)`, border: '1px solid #0e0f12', fontSize: 7 }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: '#a0a0a0' }}>{r.members}/{r.maxMembers}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ background: '#0e0f12', borderColor: '#23252b' }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ color: '#a0a0a0' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h14M2 9h14M2 14h14"/></svg>
            </button>
            <div>
              <p className="text-sm font-bold">
                {activeSection === 'community' ? `# ${activeChannel}` : joinedRoom ? rooms.find(r => r.id === joinedRoom)?.name : 'Watch Together'}
              </p>
              <p className="text-xs" style={{ color: '#a0a0a0' }}>
                {activeSection === 'community' ? `${activeUsers.length} online` : joinedRoom ? `Ep ${rooms.find(r => r.id === joinedRoom)?.episode} · Synced` : 'Create or join a room'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSection === 'watch-together' && (
              <button
                onClick={() => setCreateRoomOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #6d3bff, #4a8dff)', color: 'white' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                Create Room
              </button>
            )}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1b1d23', border: '1px solid #23252b', color: '#a0a0a0' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M7 5v3"/><circle cx="7" cy="9.5" r="0.5" fill="currentColor"/></svg>
            </button>
          </div>
        </div>

        {/* Content area */}
        {activeSection === 'community' ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              <div className="flex items-center gap-3 py-4 mb-2">
                <div className="flex-1 h-px" style={{ background: '#23252b' }} />
                <span className="text-xs font-semibold" style={{ color: '#a0a0a0' }}>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <div className="flex-1 h-px" style={{ background: '#23252b' }} />
              </div>

              {messages.map((msg, i) => {
                const isMe = msg.user === 'You'
                const showAvatar = i === 0 || messages[i - 1].user !== msg.user
                return (
                  <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
                    {showAvatar && !isMe ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 self-end mb-1" style={{ background: msg.color }}>
                        {msg.avatar}
                      </div>
                    ) : !isMe ? <div className="w-8 shrink-0" /> : null}

                    <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showAvatar && (
                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-semibold" style={{ color: msg.color }}>{msg.user}</span>
                          <span style={{ fontSize: 10, color: '#6b6b6b' }}>{msg.time}</span>
                        </div>
                      )}
                      <div
                        className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                        style={{
                          background: isMe ? 'linear-gradient(135deg, #6d3bff, #4a8dff)' : '#1b1d23',
                          color: 'white',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          border: isMe ? 'none' : '1px solid #23252b',
                        }}
                      >
                        {msg.text}
                      </div>
                      {msg.reaction && (
                        <span className="text-xs mt-1 px-2 py-0.5 rounded-full" style={{ background: '#1b1d23', border: '1px solid #23252b', color: '#a0a0a0' }}>{msg.reaction}</span>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t shrink-0" style={{ borderColor: '#23252b', background: '#0e0f12' }}>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl" style={{ background: '#1b1d23', border: '1px solid #23252b' }}>
                <button style={{ color: '#a0a0a0' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="7"/><path d="M6 10.5s.8 1.5 3 1.5 3-1.5 3-1.5M6.5 7h.01M11.5 7h.01"/></svg>
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Message #${activeChannel}`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'white' }}
                />
                <button style={{ color: '#a0a0a0' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 9l15-7-7 15-2-6z"/></svg>
                </button>
                <button
                  onClick={sendMessage}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: input.trim() ? '#6d3bff' : '#23252b', color: 'white' }}
                  disabled={!input.trim()}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7l12-5-5 12-2-5z"/></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Watch Together */
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {joinedRoom ? (
              <JoinedRoomView room={rooms.find(r => r.id === joinedRoom)!} onWatch={onWatch} onLeave={() => setJoinedRoom(null)} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {rooms.map(r => (
                    <RoomCard key={r.id} room={r} onJoin={() => setJoinedRoom(r.id)} />
                  ))}
                  <button
                    onClick={() => setCreateRoomOpen(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all hover:bg-white/5"
                    style={{ borderColor: '#23252b', minHeight: 180 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 3v14M3 10h14"/></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Create a Room</p>
                      <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>Watch anime with friends in sync</p>
                    </div>
                  </button>
                </div>

                {/* How it works */}
                <div className="p-5 rounded-2xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
                  <h3 className="font-semibold mb-4">How Watch Together works</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: '🎬', title: 'Create a Room', desc: 'Pick an anime and episode, set your room name and capacity.' },
                      { icon: '🔗', title: 'Share the Link', desc: 'Invite friends with a private room link. Up to 20 people can join.' },
                      { icon: '⚡', title: 'Watch in Sync', desc: 'Playback is synchronized for everyone. Pause, seek, and chat together.' },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="flex gap-3">
                        <span className="text-2xl shrink-0">{icon}</span>
                        <div>
                          <p className="text-sm font-semibold">{title}</p>
                          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#a0a0a0' }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right sidebar: online users (desktop) */}
      <aside className="hidden lg:flex flex-col shrink-0" style={{ width: 220, background: '#0e0f12', borderLeft: '1px solid #23252b' }}>
        <div className="p-4 border-b" style={{ borderColor: '#23252b' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a0a0a0' }}>Online — {activeUsers.length}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {activeUsers.map((u, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 px-2 rounded-xl cursor-pointer transition-all hover:bg-white/5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: u.color }}>
                  {u.avatar}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background: u.status === 'AFK' ? '#f59e0b' : '#22c55e', borderColor: '#0e0f12' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{u.name}</p>
                <p style={{ fontSize: 10, color: '#6b6b6b' }} className="truncate">{u.status}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Create Room Modal */}
      {createRoomOpen && <CreateRoomModal onClose={() => setCreateRoomOpen(false)} onCreate={(room) => { setJoinedRoom(room); setCreateRoomOpen(false); setActiveSection('watch-together') }} />}
    </div>
  )
}

function RoomCard({ room, onJoin }: { room: typeof rooms[0]; onJoin: () => void }) {
  const pct = (room.members / room.maxMembers) * 100
  return (
    <div className="p-4 rounded-2xl transition-all hover:border-purple-500/30" style={{ background: '#111216', border: '1px solid #23252b' }}>
      <div className="flex gap-3 mb-3">
        <div className="shrink-0 w-16 h-10 rounded-lg overflow-hidden">
          <img src={room.anime.banner} alt={room.anime.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6)', background: '#1b1d23' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{room.name}</p>
          <p className="text-xs truncate" style={{ color: '#a0a0a0' }}>{room.anime.title}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(109,59,255,0.15)', color: '#6d3bff' }}>Ep {room.episode}</span>
        <span className="text-xs" style={{ color: '#a0a0a0' }}>hosted by {room.host}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#a0a0a0' }}>
          <span>{room.members} watching</span>
          <span>{room.maxMembers} max</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1b1d23' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6d3bff, #ff4db8)' }} />
        </div>
      </div>

      <button
        onClick={onJoin}
        className="w-full py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
        style={{ background: room.members < room.maxMembers ? '#6d3bff' : '#1b1d23', color: room.members < room.maxMembers ? 'white' : '#a0a0a0', border: room.members >= room.maxMembers ? '1px solid #23252b' : 'none' }}
      >
        {room.members < room.maxMembers ? 'Join Room' : 'Room Full'}
      </button>
    </div>
  )
}

function JoinedRoomView({ room, onWatch, onLeave }: { room: typeof rooms[0]; onWatch: (a: Anime) => void; onLeave: () => void }) {
  const [synced, setSynced] = useState(true)
  const [roomMessages, setRoomMessages] = useState([
    { user: 'NightOwlOtaku', color: '#f59e0b', text: 'Welcome everyone! Let\'s start in 30 seconds', time: '9:07 PM' },
    { user: 'KiritoFan99', color: '#6d3bff', text: 'Ready! 🍿', time: '9:07 PM' },
  ])
  const [rmInput, setRmInput] = useState('')

  const sendRoomMsg = () => {
    if (!rmInput.trim()) return
    setRoomMessages(p => [...p, { user: 'You', color: '#6d3bff', text: rmInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setRmInput('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-lg">{room.name}</h2>
          <p className="text-sm" style={{ color: '#a0a0a0' }}>Episode {room.episode} · {room.members} watching</p>
        </div>
        <button onClick={onLeave} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all hover:bg-red-500/10" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          Leave Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Player */}
        <div>
          <div className="relative rounded-2xl overflow-hidden cursor-pointer" style={{ aspectRatio: '16/9', background: '#000' }} onClick={() => onWatch(room.anime)}>
            <img src={room.anime.banner} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.25)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(109,59,255,0.9)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5l14 7-14 7V5z"/></svg>
              </div>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>Click to open in player</p>
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: synced ? '#22c55e' : '#f59e0b' }} />
              <span className="text-xs font-semibold">{synced ? 'Synced' : 'Out of sync'}</span>
            </div>
          </div>

          {/* Sync controls */}
          <div className="flex items-center justify-between mt-3 p-3 rounded-xl" style={{ background: '#111216', border: '1px solid #23252b' }}>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1b1d23', color: '#a0a0a0' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2L3 7l5 5"/><line x1="2" y1="2" x2="2" y2="12"/></svg>
              </button>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: '#6d3bff' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><path d="M3 2l9 5-9 5V2z"/></svg>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1b1d23', color: '#a0a0a0' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2l5 5-5 5"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
              </button>
            </div>
            <button
              onClick={() => setSynced(!synced)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: synced ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: synced ? '#22c55e' : '#f59e0b', border: `1px solid ${synced ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}
            >
              {synced ? '✓ Synced' : 'Re-sync'}
            </button>
          </div>
        </div>

        {/* Room chat */}
        <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: '#111216', border: '1px solid #23252b', height: 340 }}>
          <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: '#23252b' }}>
            <p className="text-sm font-semibold">Room Chat</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {roomMessages.map((m, i) => (
              <div key={i}>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: m.color }}>{m.user}</span>
                  <span style={{ fontSize: 10, color: '#6b6b6b' }}>{m.time}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#c0c0c0' }}>{m.text}</p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t shrink-0" style={{ borderColor: '#23252b' }}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Say something..."
                value={rmInput}
                onChange={e => setRmInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendRoomMsg()}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none bg-transparent"
                style={{ background: '#1b1d23', border: '1px solid #23252b', color: 'white' }}
              />
              <button onClick={sendRoomMsg} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#6d3bff' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M1 6l10-4-4 10-2-4z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateRoomModal({ onClose, onCreate }: { onClose: () => void; onCreate: (id: number) => void }) {
  const [name, setName] = useState('')
  const [selectedAnime, setSelectedAnime] = useState(0)
  const [maxMembers, setMaxMembers] = useState(10)
  const [isPrivate, setIsPrivate] = useState(false)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 fade-in" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl slide-in" style={{ background: '#111216', border: '1px solid #23252b' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#23252b' }}>
          <h2 className="font-bold">Create Watch Room</h2>
          <button onClick={onClose} style={{ color: '#a0a0a0' }}>✕</button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#a0a0a0' }}>Room Name</label>
            <input type="text" placeholder="My Watch Party" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-transparent" style={{ background: '#1b1d23', border: '1px solid #23252b', color: 'white' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#a0a0a0' }}>Anime</label>
            <select value={selectedAnime} onChange={e => setSelectedAnime(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#1b1d23', border: '1px solid #23252b', color: 'white' }}>
              {animeData.map((a, i) => <option key={i} value={i} style={{ background: '#111216' }}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#a0a0a0' }}>Max Members: {maxMembers}</label>
            <input type="range" min="2" max="20" value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))} className="w-full" style={{ accentColor: '#6d3bff' }} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#1b1d23', border: '1px solid #23252b' }}>
            <div>
              <p className="text-sm font-semibold">Private Room</p>
              <p className="text-xs" style={{ color: '#a0a0a0' }}>Only people with the link can join</p>
            </div>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className="w-10 h-6 rounded-full transition-all"
              style={{ background: isPrivate ? '#6d3bff' : '#23252b' }}
            >
              <div className="w-4 h-4 rounded-full bg-white transition-all mx-1" style={{ transform: isPrivate ? 'translateX(16px)' : 'translateX(0)' }} />
            </button>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#1b1d23', border: '1px solid #23252b', color: '#a0a0a0' }}>Cancel</button>
          <button onClick={() => onCreate(99)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #6d3bff, #4a8dff)', color: 'white' }}>Create Room</button>
        </div>
      </div>
    </div>
  )
}
