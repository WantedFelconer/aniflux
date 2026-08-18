import { useState } from 'react'
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
import { type Anime } from './data/animeData'

export type View = 'home' | 'watch' | 'anime-profile' | 'browse' | 'chat' | 'my-list' | 'profile' | 'trending' | 'schedule' | 'login' | 'register' | 'forgot-password' | 'admin'

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentView, setCurrentView] = useState<View>('home')
  const [watchAnime, setWatchAnime] = useState<Anime | null>(null)
  const [profileAnime, setProfileAnime] = useState<Anime | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot-password'>('login')

  const handleWatch = (anime: Anime) => {
    setWatchAnime(anime)
    setCurrentView('watch')
    window.scrollTo(0, 0)
  }

  const handleAnimeClick = (anime: Anime) => {
    setProfileAnime(anime)
    setCurrentView('anime-profile')
    window.scrollTo(0, 0)
  }

  const handleNav = (view: View) => {
    setCurrentView(view)
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

        {currentView === 'watch' && watchAnime && (
          <WatchPage anime={watchAnime} onBack={handleHome} onAnimeClick={handleAnimeClick} />
        )}

        {currentView === 'anime-profile' && profileAnime && (
          <AnimeProfilePage
            anime={profileAnime}
            onBack={() => window.history.length > 1 ? (setCurrentView('home')) : handleHome()}
            onWatch={handleWatch}
            onAnimeClick={handleAnimeClick}
          />
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

