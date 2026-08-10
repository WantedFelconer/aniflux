import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { animeData, type Anime } from '../data/animeData'
import { useAuth } from './AuthContext'

export type ListStatus = 'Watching' | 'Completed' | 'On Hold' | 'Dropped' | 'Plan to Watch' | 'Favorites' | 'Bookmarks'

export interface ListEntry {
  anime: Anime
  status: ListStatus
  episodesWatched: number
  score: number | null
  addedAt: number
  updatedAt: number
}

export interface HistoryEntry {
  anime: Anime
  episode: number
  watchedAt: number
  duration: number
}

export interface UserState {
  username: string
  bio: string
  avatarInitial: string
  level: number
  xp: number
  xpMax: number
  joinedDate: string
}

interface Notification {
  id: number
  title: string
  message: string
  time: string
  color: string
  read: boolean
}

interface AppContextValue {
  listEntries: Record<number, ListEntry>
  addToList: (anime: Anime, status: ListStatus) => Promise<void>
  removeFromList: (animeId: number) => Promise<void>
  updateListEntry: (animeId: number, patch: Partial<ListEntry>) => Promise<void>
  getListStatus: (animeId: number) => ListStatus | null
  getListEntry: (animeId: number) => ListEntry | null
  bookmarks: Set<number>
  favorites: Set<number>
  favoriteAnimeList: Anime[]
  bookmarkAnimeList: Anime[]
  toggleBookmark: (animeId: number) => Promise<boolean>
  toggleFavorite: (animeId: number) => Promise<boolean>
  history: HistoryEntry[]
  addHistory: (anime: Anime, episode: number) => void
  clearHistory: () => void
  user: UserState
  updateUser: (patch: Partial<UserState>) => void
  notifications: Notification[]
  markAllRead: () => void
  unreadCount: number
  isDataLoading: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

const NOTIFS: Notification[] = [
  { id: 1, title: 'Void Chronicle: Reborn', message: 'Episode 15 is now available', time: '2m ago', color: '#6d3bff', read: false },
  { id: 2, title: 'Aurora Protocol', message: 'New episode dropped — Ep. 9', time: '1h ago', color: '#4a8dff', read: false },
  { id: 3, title: 'Neon Requiem', message: 'Finale drops Saturday!', time: '3h ago', color: '#ff4db8', read: false },
  { id: 4, title: 'System', message: 'Your watch history was synced', time: '1d ago', color: '#a0a0a0', read: true },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user: authUser } = useAuth()
  const [listEntries, setListEntries] = useState<Record<number, ListEntry>>({})
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set())
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [favoriteAnimeList, setFavoriteAnimeList] = useState<Anime[]>([])
  const [bookmarkAnimeList, setBookmarkAnimeList] = useState<Anime[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFS)

  const [user, setUser] = useState<UserState>({
    username: 'Guest',
    bio: 'Welcome to Aniflux!',
    avatarInitial: 'G',
    level: 1,
    xp: 0,
    xpMax: 1000,
    joinedDate: 'Recently'
  })

  // Sync auth user to AppContext user
  useEffect(() => {
    if (authUser) {
      setUser({
        username: authUser.username,
        bio: authUser.bio || 'Welcome to Aniflux!',
        avatarInitial: authUser.avatarInitial || (authUser.username[0] || 'U').toUpperCase(),
        level: authUser.level || 1,
        xp: 150,
        xpMax: 1000,
        joinedDate: authUser.joinedDate || 'Recently'
      })
    }
  }, [authUser])

  // Fetch authenticated user data (Favorites, Bookmarks, Library) from API
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites(new Set())
      setBookmarks(new Set())
      setFavoriteAnimeList([])
      setBookmarkAnimeList([])
      setListEntries({})
      return
    }

    setIsDataLoading(true)
    try {
      // 1. Favorites
      const favRes = await fetch('/api/me/favorites', { credentials: 'include' })
      if (favRes.ok) {
        const favJson = await favRes.json()
        setFavorites(new Set(favJson.animeIds || []))
        setFavoriteAnimeList(favJson.favorites || [])
      }

      // 2. Bookmarks
      const bmRes = await fetch('/api/me/bookmarks', { credentials: 'include' })
      if (bmRes.ok) {
        const bmJson = await bmRes.json()
        setBookmarks(new Set(bmJson.animeIds || []))
        setBookmarkAnimeList(bmJson.bookmarks || [])
      }

      // 3. User Library
      const libRes = await fetch('/api/me/library', { credentials: 'include' })
      if (libRes.ok) {
        const libJson = await libRes.json()
        const map: Record<number, ListEntry> = {}
        if (Array.isArray(libJson.library)) {
          for (const item of libJson.library) {
            map[item.anime.id] = item
          }
        }
        setListEntries(map)
      }
    } catch (err) {
      console.error('Error fetching user personalization data:', err)
    } finally {
      setIsDataLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const unreadCount = notifications.filter(n => !n.read).length

  // Toggle Favorite
  const toggleFavorite = useCallback(async (animeId: number): Promise<boolean> => {
    if (!isAuthenticated) return false

    const isFav = favorites.has(animeId)
    // Optimistic UI update
    setFavorites(prev => {
      const next = new Set(prev)
      if (isFav) next.delete(animeId)
      else next.add(animeId)
      return next
    })

    try {
      const endpoint = `/api/me/favorites/${animeId}`
      const res = await fetch(endpoint, {
        method: isFav ? 'DELETE' : 'POST',
        credentials: 'include'
      })
      if (!res.ok) {
        // Revert on failure
        setFavorites(prev => {
          const next = new Set(prev)
          if (isFav) next.add(animeId)
          else next.delete(animeId)
          return next
        })
        return false
      }
      fetchUserData()
      return true
    } catch {
      // Revert on network error
      setFavorites(prev => {
        const next = new Set(prev)
        if (isFav) next.add(animeId)
        else next.delete(animeId)
        return next
      })
      return false
    }
  }, [isAuthenticated, favorites, fetchUserData])

  // Toggle Bookmark
  const toggleBookmark = useCallback(async (animeId: number): Promise<boolean> => {
    if (!isAuthenticated) return false

    const isBm = bookmarks.has(animeId)
    // Optimistic UI update
    setBookmarks(prev => {
      const next = new Set(prev)
      if (isBm) next.delete(animeId)
      else next.add(animeId)
      return next
    })

    try {
      const endpoint = `/api/me/bookmarks/${animeId}`
      const res = await fetch(endpoint, {
        method: isBm ? 'DELETE' : 'POST',
        credentials: 'include'
      })
      if (!res.ok) {
        // Revert
        setBookmarks(prev => {
          const next = new Set(prev)
          if (isBm) next.add(animeId)
          else next.delete(animeId)
          return next
        })
        return false
      }
      fetchUserData()
      return true
    } catch {
      // Revert
      setBookmarks(prev => {
        const next = new Set(prev)
        if (isBm) next.add(animeId)
        else next.delete(animeId)
        return next
      })
      return false
    }
  }, [isAuthenticated, bookmarks, fetchUserData])

  // Add / Update List
  const addToList = useCallback(async (anime: Anime, status: ListStatus) => {
    if (!isAuthenticated) return

    setListEntries(prev => ({
      ...prev,
      [anime.id]: {
        anime,
        status,
        episodesWatched: prev[anime.id]?.episodesWatched ?? 0,
        score: prev[anime.id]?.score ?? null,
        addedAt: prev[anime.id]?.addedAt ?? Date.now(),
        updatedAt: Date.now()
      }
    }))

    try {
      await fetch('/api/me/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          animeId: anime.id,
          status,
          episodesWatched: listEntries[anime.id]?.episodesWatched ?? 0,
          score: listEntries[anime.id]?.score ?? null
        })
      })
    } catch (err) {
      console.error('Error syncing library addition to API:', err)
    }
  }, [isAuthenticated, listEntries])

  const removeFromList = useCallback(async (animeId: number) => {
    if (!isAuthenticated) return

    setListEntries(prev => {
      const copy = { ...prev }
      delete copy[animeId]
      return copy
    })

    try {
      await fetch(`/api/me/library/${animeId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Error removing from library via API:', err)
    }
  }, [isAuthenticated])

  const updateListEntry = useCallback(async (animeId: number, patch: Partial<ListEntry>) => {
    if (!isAuthenticated) return

    const existing = listEntries[animeId]
    if (!existing) return

    const updated = { ...existing, ...patch, updatedAt: Date.now() }
    setListEntries(prev => ({ ...prev, [animeId]: updated }))

    try {
      await fetch('/api/me/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          animeId,
          status: updated.status,
          episodesWatched: updated.episodesWatched,
          score: updated.score
        })
      })
    } catch (err) {
      console.error('Error updating list entry via API:', err)
    }
  }, [isAuthenticated, listEntries])

  const getListStatus = useCallback((animeId: number): ListStatus | null => listEntries[animeId]?.status ?? null, [listEntries])
  const getListEntry = useCallback((animeId: number): ListEntry | null => listEntries[animeId] ?? null, [listEntries])

  const addHistory = useCallback((anime: Anime, episode: number) => {
    setHistory(prev => [{ anime, episode, watchedAt: Date.now(), duration: parseInt(anime.duration) || 24 }, ...prev.filter(h => !(h.anime.id === anime.id && h.episode === episode)).slice(0, 98)])
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  const updateUser = useCallback((patch: Partial<UserState>) => {
    setUser(prev => { const next = { ...prev, ...patch }; next.avatarInitial = (next.username[0] ?? 'A').toUpperCase(); return next })
  }, [])

  const markAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), [])

  return (
    <AppContext.Provider
      value={{
        listEntries,
        addToList,
        removeFromList,
        updateListEntry,
        getListStatus,
        getListEntry,
        bookmarks,
        favorites,
        favoriteAnimeList,
        bookmarkAnimeList,
        toggleBookmark,
        toggleFavorite,
        history,
        addHistory,
        clearHistory,
        user,
        updateUser,
        notifications,
        markAllRead,
        unreadCount,
        isDataLoading
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
