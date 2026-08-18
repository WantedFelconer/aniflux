import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface User {
  id: string | number
  username: string
  email: string
  avatarInitial: string
  avatarUrl?: string
  bio: string
  level: number
  xp?: number
  xpMax?: number
  joinedDate: string
  role?: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  authError: string | null
  resetToken: string | null
  setResetToken: (token: string | null) => void
  login: (emailOrUsername: string, pass: string, rememberMe?: boolean) => Promise<boolean>
  register: (username: string, email: string, pass: string) => Promise<boolean>
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>
  verifyOtp: (otp: string) => Promise<boolean>
  resetPassword: (newPassword: string, tokenOverride?: string) => Promise<boolean>
  socialLogin: (provider: 'google' | 'discord' | 'github') => Promise<boolean>
  logout: () => void
  clearError: () => void
  tempResetEmail: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'aniflux_auth_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [tempResetEmail, setTempResetEmail] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('token')
    } catch {
      return null
    }
  })

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin' || user?.username === 'admin' || user?.email === 'admin@aniflux.io'

  // Check current session on application mount
  useEffect(() => {
    let isMounted = true
    async function checkAuth() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Accept': 'application/json' },
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.user) {
            setUser(data.user)
          }
        } else {
          if (isMounted) setUser(null)
        }
      } catch (err) {
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    checkAuth()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  const login = useCallback(async (emailOrUsername: string, pass: string, rememberMe = true): Promise<boolean> => {
    setIsLoading(true)
    setAuthError(null)

    if (!emailOrUsername || !pass) {
      setAuthError('Please fill in all required fields.')
      setIsLoading(false)
      return false
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailOrUsername, password: pass, rememberMe })
      })

      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || 'Invalid credentials')
        setIsLoading(false)
        return false
      }

      setUser(data.user)
      if (!rememberMe) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      }
      setIsLoading(false)
      return true
    } catch (err: any) {
      setAuthError(err.message || 'Network error during login')
      setIsLoading(false)
      return false
    }
  }, [])

  const register = useCallback(async (username: string, email: string, pass: string): Promise<boolean> => {
    setIsLoading(true)
    setAuthError(null)

    if (!username || !email || !pass) {
      setAuthError('Please enter a username, email, and password.')
      setIsLoading(false)
      return false
    }

    if (!email.includes('@')) {
      setAuthError('Please enter a valid email address.')
      setIsLoading(false)
      return false
    }

    if (pass.length < 6) {
      setAuthError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return false
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password: pass })
      })

      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.error || 'Registration failed')
        setIsLoading(false)
        return false
      }

      setUser(data.user)
      setIsLoading(false)
      return true
    } catch (err: any) {
      setAuthError(err.message || 'Network error during registration')
      setIsLoading(false)
      return false
    }
  }, [])

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    setAuthError(null)

    if (!email || !email.includes('@')) {
      setAuthError('Please provide a valid registered email address.')
      setIsLoading(false)
      return { success: false, message: 'Invalid email address' }
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      setIsLoading(false)

      if (!res.ok) {
        setAuthError(data.error || 'Failed to request password reset')
        return { success: false, message: data.error || 'Request failed' }
      }

      setTempResetEmail(email)
      return { success: true, message: data.message || `Password reset link issued for ${email}` }
    } catch (err: any) {
      setIsLoading(false)
      setAuthError(err.message || 'Network error during forgot password')
      return { success: false, message: 'Network error' }
    }
  }, [])

  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    setIsLoading(true)
    setAuthError(null)
    await new Promise(resolve => setTimeout(resolve, 400))

    if (otp.length < 4) {
      setAuthError('Please enter a valid reset code/token.')
      setIsLoading(false)
      return false
    }

    setResetToken(otp)
    setIsLoading(false)
    return true
  }, [])

  const resetPassword = useCallback(async (newPassword: string, tokenOverride?: string): Promise<boolean> => {
    setIsLoading(true)
    setAuthError(null)

    const activeToken = tokenOverride || resetToken || new URLSearchParams(window.location.search).get('token')

    if (!activeToken) {
      setAuthError('Missing password reset token.')
      setIsLoading(false)
      return false
    }

    if (newPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return false
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: activeToken, newPassword })
      })

      const data = await res.json()
      setIsLoading(false)

      if (!res.ok) {
        setAuthError(data.error || 'Password reset failed')
        return false
      }

      setTempResetEmail(null)
      setResetToken(null)
      return true
    } catch (err: any) {
      setIsLoading(false)
      setAuthError(err.message || 'Network error during password reset')
      return false
    }
  }, [resetToken])

  const socialLogin = useCallback(async (_provider: 'google' | 'discord' | 'github'): Promise<boolean> => {
    setAuthError('Social login is a future-phase feature in this MVP.')
    return false
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        authError,
        resetToken,
        setResetToken,
        login,
        register,
        forgotPassword,
        verifyOtp,
        resetPassword,
        socialLogin,
        logout,
        clearError,
        tempResetEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
