import { useState } from 'react'
import { useAuth } from '@/shared/context/AuthContext'

interface LoginPageProps {
  onNavigate: (view: any) => void
  isModal?: boolean
  onSuccess?: () => void
}

export default function LoginPage({ onNavigate, isModal = false, onSuccess }: LoginPageProps) {
  const { login, isLoading, authError, clearError, socialLogin } = useAuth()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const success = await login(emailOrUsername, password, rememberMe)
    if (success) {
      if (onSuccess) onSuccess()
      else onNavigate('home')
    }
  }

  const handleSocial = async (provider: 'google' | 'discord' | 'github') => {
    clearError()
    const success = await socialLogin(provider)
    if (success) {
      if (onSuccess) onSuccess()
      else onNavigate('home')
    }
  }

  const cardContent = (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl relative overflow-hidden" style={{ background: '#111216', border: '1px solid #23252b', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: '#6d3bff', filter: 'blur(90px)', opacity: 0.25 }} />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: '#ff4db8', filter: 'blur(90px)', opacity: 0.25 }} />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer" onClick={() => onNavigate('home')} style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 8px 24px rgba(109,59,255,0.4)' }}>
          <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
            <path d="M3 14L9 4L15 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 10H12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Welcome Back</h2>
        <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>Sign in to continue watching your favorite anime</p>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="mb-5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium slide-in" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="7"/><path d="M8 5v3.5M8 11.5h.01"/></svg>
          <span className="flex-1">{authError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#c0c0c0' }}>Email or Username</label>
          <div className="relative">
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. KiritoFan99 or kaito@aniflux.io"
              className="w-full px-4 py-3 pl-10 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#1b1d23', border: '1px solid #282b34', color: 'white' }}
              onFocus={(e) => e.target.style.borderColor = '#6d3bff'}
              onBlur={(e) => e.target.style.borderColor = '#282b34'}
            />
            <div className="absolute left-3.5 top-3.5 pointer-events-none" style={{ color: '#6b6b6b' }}>
              <UserIcon />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold" style={{ color: '#c0c0c0' }}>Password</label>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-xs font-medium hover:underline transition-all"
              style={{ color: '#ff4db8' }}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pl-10 pr-10 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#1b1d23', border: '1px solid #282b34', color: 'white' }}
              onFocus={(e) => e.target.style.borderColor = '#6d3bff'}
              onBlur={(e) => e.target.style.borderColor = '#282b34'}
            />
            <div className="absolute left-3.5 top-3.5 pointer-events-none" style={{ color: '#6b6b6b' }}>
              <LockIcon />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 hover:text-white transition-all"
              style={{ color: '#6b6b6b' }}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none" style={{ color: '#a0a0a0' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#6d3bff]"
            />
            <span>Remember me on this device</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg cursor-pointer disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 6px 20px rgba(109,59,255,0.35)' }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Aniflux</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l5 5-5 5"/></svg>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: '#23252b' }} /></div>
        <span className="relative px-3 text-xs uppercase tracking-wider font-semibold" style={{ background: '#111216', color: '#6b6b6b' }}>Or continue with</span>
      </div>

      {/* Social Providers */}
      <div className="grid grid-cols-3 gap-2.5 mb-6 relative z-10">
        <button
          type="button"
          onClick={() => handleSocial('google')}
          className="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:bg-white/5"
          style={{ background: '#1b1d23', borderColor: '#282b34', color: '#e4e4e7' }}
        >
          <GoogleIcon /> Google
        </button>
        <button
          type="button"
          onClick={() => handleSocial('discord')}
          className="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:bg-white/5"
          style={{ background: '#1b1d23', borderColor: '#282b34', color: '#e4e4e7' }}
        >
          <DiscordIcon /> Discord
        </button>
        <button
          type="button"
          onClick={() => handleSocial('github')}
          className="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:bg-white/5"
          style={{ background: '#1b1d23', borderColor: '#282b34', color: '#e4e4e7' }}
        >
          <GithubIcon /> GitHub
        </button>
      </div>

      {/* Footer link */}
      <div className="text-center text-xs relative z-10" style={{ color: '#9a9a9a' }}>
        Don't have an account yet?{' '}
        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="font-bold hover:underline transition-all"
          style={{ color: '#6d3bff' }}
        >
          Create account
        </button>
      </div>
    </div>
  )

  if (isModal) {
    return cardContent
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: '#09090b', paddingTop: 80 }}>
      {/* Dynamic Background Image & Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80"
          alt="anime background"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.18) blur(4px)' }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, #09090b 90%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {cardContent}
      </div>
    </div>
  )
}

function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="8" cy="5" r="3"/><path d="M2.5 14c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"/></svg>
}

function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V4.5a3 3 0 0 1 6 0V7"/></svg>
}

function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
}

function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 2l12 12M6.7 6.7a2 2 0 0 0 2.6 2.6M1 8s2.5-5 7-5c1.4 0 2.6.4 3.7 1M15 8s-1 .2-2.3 1"/></svg>
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}
