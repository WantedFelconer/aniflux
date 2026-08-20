import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ContinueWatching from './components/ContinueWatching'
import TrendingSection from './components/TrendingSection'
import RecentlyUpdated from './components/RecentlyUpdated'
import GenresSection from './components/GenresSection'
import TopRated from './components/TopRated'
import ScheduleWidget from './components/ScheduleWidget'
import Footer from './components/Footer'
import SearchModal from './components/SearchModal'
import WatchPage from './components/WatchPage'
import AnimeProfilePage from './components/AnimeProfilePage'
import AnimeListPage from './components/AnimeListPage'
import ChatPage from './components/ChatPage'
import MyListPage from './components/MyListPage'
import UserProfilePage from './components/UserProfilePage'
import TrendingPage from './components/TrendingPage'
import SchedulePage from './components/SchedulePage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import AuthModal from './components/AuthModal'
import AdminPanel from './components/AdminPanel'
import { animeData, type Anime } from './data/animeData'
import { useApp } from './context/AppContext'

export type View = 'home' | 'watch' | 'anime-profile' | 'browse' | 'chat' | 'my-list' | 'profile' | 'trending' | 'schedule' | 'login' | 'register' | 'forgot-password' | 'admin'

export default function App() {
  const { animeList } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentView, setCurrentView] = useState<View>('home')
  const [watchAnime, setWatchAnime] = useState<Anime | null>(null)
  const [profileAnime, setProfileAnime] = useState<Anime | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot-password'>('login')

  // Parse URL hash to restore view and anime on refresh
  const syncRouteFromHash = useCallback(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (!hash) {
        setCurrentView('home')
        return
      }

      const [route, param] = hash.split('/')

      if (route === 'watch' && param) {
        const id = parseInt(param)
        const found = animeList.find(a => a.id === id) || animeData.find(a => a.id === id)
        if (found) {
          setWatchAnime(found)
        } else {
          fetch(`/api/anime/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
              if (data?.anime) setWatchAnime(data.anime)
            })
            .catch(() => {})
        }
        setCurrentView('watch')
      } else if (route === 'anime' && param) {
        const id = parseInt(param)
        const found = animeList.find(a => a.id === id) || animeData.find(a => a.id === id)
        if (found) {
          setProfileAnime(found)
        } else {
          fetch(`/api/anime/${id}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
              if (data?.anime) setProfileAnime(data.anime)
            })
            .catch(() => {})
        }
        setCurrentView('anime-profile')
      } else if (
        ['browse', 'chat', 'my-list', 'profile', 'trending', 'schedule', 'login', 'register', 'forgot-password', 'admin'].includes(route)
      ) {
        setCurrentView(route as View)
      } else {
        setCurrentView('home')
      }
    } catch {
      setCurrentView('home')
    }
  }, [animeList])

  // Sync on mount and hashchange
  useEffect(() => {
    syncRouteFromHash()
    window.addEventListener('hashchange', syncRouteFromHash)
    return () => window.removeEventListener('hashchange', syncRouteFromHash)
  }, [syncRouteFromHash])

  const handleWatch = (anime: Anime) => {
    setWatchAnime(anime)
    setCurrentView('watch')
    window.location.hash = `#/watch/${anime.id}`
    window.scrollTo(0, 0)
  }

  const handleAnimeClick = (anime: Anime) => {
    setProfileAnime(anime)
    setCurrentView('anime-profile')
    window.location.hash = `#/anime/${anime.id}`
    window.scrollTo(0, 0)
  }

  const handleNav = (view: View) => {
    setCurrentView(view)
    window.location.hash = view === 'home' ? '#/' : `#/${view}`
    window.scrollTo(0, 0)
  }

  const handleHome = () => handleNav('home')

  // Pages that hide the footer & navbar
  const noFooter: View[] = ['watch', 'chat', 'login', 'register', 'forgot-password']
  const noNavbar: View[] = ['watch']

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      {!noNavbar.includes(currentView) && (
        <Navbar
          onSearchOpen={() => setSearchOpen(true)}
          onHome={handleHome}
          currentView={currentView}
          onNavigate={handleNav}
        />
      )}

      <main>
        {currentView === 'home' && (
          <>
            <Hero onWatch={handleWatch} onAnimeClick={handleAnimeClick} />
            <ContinueWatching onWatch={handleWatch} />
            <TrendingSection onAnimeClick={handleAnimeClick} />
            <RecentlyUpdated onAnimeClick={handleAnimeClick} />
            <GenresSection onGenreClick={() => { handleNav('browse') }} />
            <TopRated onAnimeClick={handleAnimeClick} />
            <ScheduleWidget onAnimeClick={handleAnimeClick} />
            <Footer />
          </>
        )}

        {currentView === 'watch' && (
          watchAnime ? (
            <WatchPage anime={watchAnime} onBack={handleHome} onAnimeClick={handleAnimeClick} />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-400">Loading Anime Stream...</p>
            </div>
          )
        )}

        {currentView === 'anime-profile' && (
          profileAnime ? (
            <AnimeProfilePage
              anime={profileAnime}
              onBack={() => window.history.length > 1 ? (window.history.back()) : handleHome()}
              onWatch={handleWatch}
              onAnimeClick={handleAnimeClick}
            />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-white">
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-400">Loading Profile Details...</p>
            </div>
          )
        )}

        {currentView === 'browse' && (
          <AnimeListPage onAnimeClick={handleAnimeClick} />
        )}

        {currentView === 'chat' && (
          <ChatPage onAnimeClick={handleAnimeClick} onWatch={handleWatch} />
        )}

        {currentView === 'my-list' && (
          <MyListPage onAnimeClick={handleAnimeClick} onWatch={handleWatch} />
        )}

        {currentView === 'profile' && (
          <UserProfilePage onAnimeClick={handleAnimeClick} onWatch={handleWatch} />
        )}

        {currentView === 'trending' && (
          <TrendingPage onAnimeClick={handleAnimeClick} onWatch={handleWatch} />
        )}

        {currentView === 'schedule' && (
          <SchedulePage onAnimeClick={handleAnimeClick} onWatch={handleWatch} />
        )}

        {currentView === 'login' && (
          <LoginPage onNavigate={handleNav} />
        )}

        {currentView === 'register' && (
          <RegisterPage onNavigate={handleNav} />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordPage onNavigate={handleNav} />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            onAnimeClick={handleAnimeClick}
            onWatch={handleWatch}
            onNavigateHome={handleHome}
          />
        )}
      </main>

      {!noFooter.includes(currentView) && <Footer />}

      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onAnimeClick={(anime) => { handleAnimeClick(anime); setSearchOpen(false) }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          initialView={authModalView}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  )
}


