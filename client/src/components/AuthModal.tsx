import { useState } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ForgotPasswordPage from './ForgotPasswordPage'

interface AuthModalProps {
  initialView?: 'login' | 'register' | 'forgot-password'
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ initialView = 'login', onClose, onSuccess }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>(initialView)

  const handleSuccess = () => {
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card wrapper */}
      <div className="relative z-10 w-full max-w-md my-8 slide-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-lg border"
          style={{ background: '#1b1d23', borderColor: '#2b2d35' }}
          title="Close modal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13"/></svg>
        </button>

        {view === 'login' && (
          <LoginPage onNavigate={(v) => setView(v)} isModal onSuccess={handleSuccess} />
        )}

        {view === 'register' && (
          <RegisterPage onNavigate={(v) => setView(v)} isModal onSuccess={handleSuccess} />
        )}

        {view === 'forgot-password' && (
          <ForgotPasswordPage onNavigate={(v) => setView(v)} isModal />
        )}
      </div>
    </div>
  )
}
