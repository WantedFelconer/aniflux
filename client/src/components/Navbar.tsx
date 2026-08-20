import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { View } from '../App'

interface NavbarProps {
  onSearchOpen: () => void
  onHome: () => void
  currentView: View
  onNavigate: (view: View) => void
}

const navLinks: { label: string; view: View }[] = [
  { label: 'Browse', view: 'browse' },
  { label: 'Trending', view: 'trending' },
  { label: 'Schedule', view: 'schedule' },
  { label: 'Community', view: 'chat' },
]

export default function Navbar({ onSearchOpen, onHome, currentView, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user: appUser, notifications, markAllRead, unreadCount } = useApp()
  const { user: authUser, isAuthenticated, isAdmin, logout } = useAuth()

  const activeUser = authUser || (isAuthenticated ? appUser : null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onSearchOpen() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSearchOpen])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          background: scrolled ? 'rgba(9,9,11,0.95)' : 'rgba(9,9,11,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? '#23252b' : 'rgba(35,37,43,0.4)'}`,
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <button onClick={onHome} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 4px 12px rgba(109,59,255,0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L9 4L15 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 10H12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight hidden sm:block">Ani<span style={{ color: '#6d3bff' }}>flux</span></span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ label, view }) => (
              <button
                key={label}
                onClick={() => onNavigate(view)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: currentView === view ? '#fff' : '#9a9a9a',
                  background: currentView === view ? 'rgba(109,59,255,0.18)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}

            {/* Admin Panel Button (Desktop) */}
            <button
              onClick={() => onNavigate('admin')}
              className="ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
              style={{
                background: currentView === 'admin' ? 'linear-gradient(135deg, #6d3bff, #ff4db8)' : 'rgba(109,59,255,0.18)',
                color: currentView === 'admin' ? '#fff' : '#c084fc',
                border: '1px solid rgba(192,132,252,0.4)',
              }}
            >
              <span>🛡️</span>
              <span>Admin Panel</span>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onSearchOpen}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(27,29,35,0.8)', color: '#7a7a7a', border: '1px solid rgba(35,37,43,0.8)' }}
            >
              <SearchIcon />
              <span className="hidden lg:block">Search...</span>
              <kbd className="hidden lg:block text-xs px-1.5 py-0.5 rounded-md" style={{ background: '#23252b', color: '#666', fontFamily: 'inherit' }}>⌘K</kbd>
            </button>
            <button onClick={onSearchOpen} className="w-9 h-9 rounded-xl flex items-center justify-center sm:hidden" style={{ background: 'rgba(27,29,35,0.8)', border: '1px solid rgba(35,37,43,0.8)', color: '#7a7a7a' }}>
              <SearchIcon />
            </button>

            {/* My List */}
            <button
              onClick={() => onNavigate('my-list')}
              className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center transition-all"
              title="My List"
              style={{ background: currentView === 'my-list' ? 'rgba(109,59,255,0.2)' : 'rgba(27,29,35,0.8)', border: `1px solid ${currentView === 'my-list' ? 'rgba(109,59,255,0.5)' : 'rgba(35,37,43,0.8)'}`, color: currentView === 'my-list' ? '#6d3bff' : '#7a7a7a' }}
            >
              <BookmarkIcon />
            </button>

            {/* Notifications */}
            {activeUser && (
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (!notifOpen) markAllRead() }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
                  style={{ background: 'rgba(27,29,35,0.8)', border: '1px solid rgba(35,37,43,0.8)', color: '#7a7a7a' }}
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[14px] h-3.5 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#ff4db8', fontSize: 8, padding: '0 3px' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && <NotificationPanel notifications={notifications} onClose={() => setNotifOpen(false)} />}
              </div>
            )}

            {/* Profile / Auth Buttons */}
            {activeUser ? (
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #6d3bff, #ff4db8)',
                    color: 'white',
                    outline: currentView === 'profile' || profileOpen ? '2px solid #6d3bff' : 'none',
                    outlineOffset: 2,
                  }}
                  title={activeUser.username}
                >
                  {activeUser.avatarInitial}
                </button>

                {profileOpen && (
                  <ProfileDropdownMenu
                    user={activeUser}
                    onNavigate={(v) => { onNavigate(v); setProfileOpen(false) }}
                    onLogout={() => { logout(); setProfileOpen(false); onNavigate('home') }}
                    onClose={() => setProfileOpen(false)}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:text-white"
                  style={{ color: '#a0a0a0', background: 'rgba(27,29,35,0.8)', border: '1px solid rgba(35,37,43,0.8)' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 4px 14px rgba(109,59,255,0.35)' }}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center md:hidden"
              style={{ background: 'rgba(27,29,35,0.8)', border: '1px solid rgba(35,37,43,0.8)', color: '#7a7a7a' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-2 px-3" style={{ borderColor: '#23252b', background: 'rgba(9,9,11,0.98)' }}>
            {navLinks.map(({ label, view }) => (
              <button
                key={label}
                onClick={() => { onNavigate(view); setMobileMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                style={{ color: currentView === view ? '#fff' : '#9a9a9a', background: currentView === view ? 'rgba(109,59,255,0.15)' : 'transparent' }}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all text-purple-300 mt-1"
              style={{ background: currentView === 'admin' ? 'linear-gradient(135deg, #6d3bff, #ff4db8)' : 'rgba(109,59,255,0.15)', color: currentView === 'admin' ? '#fff' : '#c084fc' }}
            >
              <span>🛡️</span> Admin Panel
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ background: 'rgba(9,9,11,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #23252b' }}>
        <div className="flex items-center justify-around py-1.5">
          {[
            { icon: <HomeIcon />, label: 'Home', view: 'home' as View, action: onHome },
            { icon: <SearchIcon size={20} />, label: 'Search', view: null, action: onSearchOpen },
            { icon: <GridNav />, label: 'Browse', view: 'browse' as View, action: () => onNavigate('browse') },
            { icon: <BookmarkIcon size={20} />, label: 'My List', view: 'my-list' as View, action: () => onNavigate('my-list') },
            { icon: <UserIcon />, label: 'Profile', view: 'profile' as View, action: () => onNavigate('profile') },
          ].map(({ icon, label, view, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ color: view && currentView === view ? '#6d3bff' : '#6b6b6b' }}
            >
              {icon}
              <span className="text-xs font-medium" style={{ fontSize: 10 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function NotificationPanel({ notifications, onClose }: { notifications: { id: number; title: string; message: string; time: string; color: string; read: boolean }[]; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl slide-in" style={{ background: '#111216', border: '1px solid #23252b', zIndex: 100 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#23252b' }}>
          <span className="font-semibold text-sm">Notifications</span>
          <button onClick={onClose} style={{ color: '#6b6b6b', fontSize: 16 }}>✕</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
          {notifications.map(n => (
            <div key={n.id} className="flex gap-3 px-4 py-3 border-b cursor-pointer transition-colors hover:bg-white/5" style={{ borderColor: '#1e2028', background: n.read ? 'transparent' : 'rgba(109,59,255,0.04)' }}>
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? '#3a3a3a' : n.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: n.read ? '#9a9a9a' : 'white' }}>{n.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#6b6b6b' }}>{n.message}</p>
              </div>
              <span className="text-xs shrink-0 mt-0.5" style={{ color: '#4a4a4a' }}>{n.time}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 text-center">
          <button className="text-xs font-medium" style={{ color: '#6d3bff' }}>View all</button>
        </div>
      </div>
    </>
  )
}

function ProfileDropdownMenu({ user, onNavigate, onLogout, onClose }: { user: any; onNavigate: (view: View) => void; onLogout: () => void; onClose: () => void }) {
  const { isAdmin } = useAuth()

  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 top-11 w-64 rounded-2xl overflow-hidden shadow-2xl slide-in p-2" style={{ background: '#111216', border: '1px solid #23252b', zIndex: 100 }}>
        {/* User Card Header */}
        <div className="p-3 rounded-xl mb-1 flex items-center gap-3" style={{ background: 'rgba(27,29,35,0.8)', border: '1px solid #23252b' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0" style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)' }}>
            {user.avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white truncate">{user.username}</p>
              {isAdmin && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs truncate" style={{ color: '#a0a0a0' }}>{user.email || 'Member'}</p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-0.5">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all mb-1"
              style={{ background: 'linear-gradient(135deg, rgba(109,59,255,0.2), rgba(255,77,184,0.2))', color: '#ff4db8', border: '1px solid rgba(255,77,184,0.3)' }}
            >
              <span>🛡️</span> Admin Dashboard
            </button>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors hover:bg-white/5 text-zinc-300"
          >
            <UserIcon /> Profile & Settings
          </button>
          <button
            onClick={() => onNavigate('my-list')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors hover:bg-white/5 text-zinc-300"
          >
            <BookmarkIcon size={14} /> My Watchlist
          </button>
          <div className="my-1 border-t" style={{ borderColor: '#23252b' }} />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors hover:bg-red-500/10 text-red-400"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 12l4-4-4-4M15 8H6"/></svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}

const SearchIcon = ({ size = 15 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M11 11l2.5 2.5"/></svg>
const BellIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a4 4 0 0 1 4 4v2l1 2H3l1-2V6a4 4 0 0 1 4-4z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>
const MenuIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 4h12M2 8h12M2 12h8"/></svg>
const CloseIcon = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
const BookmarkIcon = ({ size = 15 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h10a1 1 0 0 1 1 1v13l-6-3-6 3V4a1 1 0 0 1 1-1z"/></svg>
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M7 18V12h6v6"/></svg>
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="7" r="3"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg>
const GridNav = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>
