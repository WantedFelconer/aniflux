import { useState, useRef, useEffect, useMemo } from 'react'
import { useAuth } from '@/shared/context/AuthContext'

interface ForgotPasswordPageProps {
  onNavigate: (view: any) => void
  isModal?: boolean
}

type Step = 'email' | 'otp' | 'reset' | 'success'

export default function ForgotPasswordPage({ onNavigate, isModal = false }: ForgotPasswordPageProps) {
  const { forgotPassword, verifyOtp, resetPassword, isLoading, authError, clearError } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(60)

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Auto detect reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      setStep('reset')
    }
  }, [])

  // Resend timer countdown
  useEffect(() => {
    let timer: any = null
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [step, resendTimer])

  // Password strength calculation
  const strengthInfo = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '#282b34' }
    let score = 0
    if (newPassword.length >= 6) score += 1
    if (newPassword.length >= 10) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: '#f87171' }
    if (score === 2) return { score: 2, label: 'Fair', color: '#fbbf24' }
    if (score === 3) return { score: 3, label: 'Good', color: '#60a5fa' }
    if (score === 4) return { score: 4, label: 'Strong', color: '#34d399' }
    return { score: 5, label: 'Excellent', color: '#a78bfa' }
  }, [newPassword])

  // Step 1: Submit Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    const res = await forgotPassword(email)
    if (res.success) {
      setStep('otp')
      setResendTimer(60)
    }
  }

  // Handle OTP digit change & auto focus next
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('')
      setOtpDigits(digits)
      otpInputsRef.current[5]?.focus()
    }
  }

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    const code = otpDigits.join('')
    if (code.length < 6) {
      setLocalError('Please enter all 6 verification digits.')
      return
    }

    const success = await verifyOtp(code)
    if (success) {
      setStep('reset')
    }
  }

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    clearError()
    await forgotPassword(email)
    setResendTimer(60)
  }

  // Step 3: Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    const tokenFromUrl = new URLSearchParams(window.location.search).get('token')
    const tokenToUse = tokenFromUrl || otpDigits.join('')

    const success = await resetPassword(newPassword, tokenToUse)
    if (success) {
      setStep('success')
    }
  }

  const activeError = localError || authError

  const cardContent = (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl relative overflow-hidden" style={{ background: '#111216', border: '1px solid #23252b', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full pointer-events-none" style={{ background: '#6d3bff', filter: 'blur(90px)', opacity: 0.25 }} />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg cursor-pointer" onClick={() => onNavigate('home')} style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 8px 24px rgba(109,59,255,0.4)' }}>
          <KeyIcon />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          {step === 'email' && 'Reset Password'}
          {step === 'otp' && 'Enter Verification Code'}
          {step === 'reset' && 'Set New Password'}
          {step === 'success' && 'Password Updated!'}
        </h2>
        <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>
          {step === 'email' && "Enter your account email and we'll send a 6-digit verification code."}
          {step === 'otp' && `We've sent a 6-digit code to ${email}`}
          {step === 'reset' && 'Choose a strong new password for your account.'}
          {step === 'success' && 'Your password has been changed successfully.'}
        </p>
      </div>

      {/* Error Alert */}
      {activeError && (
        <div className="mb-5 p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium slide-in" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="7"/><path d="M8 5v3.5M8 11.5h.01"/></svg>
          <span className="flex-1">{activeError}</span>
        </div>
      )}

      {/* STEP 1: EMAIL */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4 relative z-10 slide-in">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#c0c0c0' }}>Registered Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kaito@aniflux.io"
                className="w-full px-4 py-3 pl-10 rounded-xl text-sm outline-none transition-all"
                style={{ background: '#1b1d23', border: '1px solid #282b34', color: 'white' }}
                onFocus={(e) => e.target.style.borderColor = '#6d3bff'}
                onBlur={(e) => e.target.style.borderColor = '#282b34'}
              />
              <div className="absolute left-3.5 top-3.5 pointer-events-none" style={{ color: '#6b6b6b' }}>
                <MailIcon />
              </div>
            </div>
          </div>

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
                <span>Send Code</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l5 5-5 5"/></svg>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold hover:underline"
              style={{ color: '#a0a0a0' }}
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: OTP DIGITS */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-5 relative z-10 slide-in">
          <div className="flex justify-between gap-2 my-2" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpInputsRef.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-12 h-14 rounded-xl text-center text-xl font-bold outline-none transition-all"
                style={{ background: '#1b1d23', border: `1px solid ${digit ? '#6d3bff' : '#282b34'}`, color: 'white' }}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span style={{ color: '#888' }}>Didn't get code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
              className="font-semibold hover:underline disabled:no-underline disabled:opacity-50"
              style={{ color: resendTimer > 0 ? '#6b6b6b' : '#ff4db8' }}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg cursor-pointer disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 6px 20px rgba(109,59,255,0.35)' }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Verify Code</span>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-xs font-semibold hover:underline"
              style={{ color: '#a0a0a0' }}
            >
              Change Email Address
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-4 relative z-10 slide-in">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#c0c0c0' }}>New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl text-sm outline-none transition-all"
                style={{ background: '#1b1d23', border: '1px solid #282b34', color: 'white' }}
                onFocus={(e) => e.target.style.borderColor = '#6d3bff'}
                onBlur={(e) => e.target.style.borderColor = '#282b34'}
              />
              <div className="absolute left-3.5 top-3 pointer-events-none" style={{ color: '#6b6b6b' }}>
                <LockIcon />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 hover:text-white transition-all"
                style={{ color: '#6b6b6b' }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="mt-2 space-y-1 slide-in">
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: '#888' }}>Password Strength:</span>
                  <span className="font-bold" style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden flex gap-1" style={{ background: '#1b1d23' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className="h-full flex-1 rounded-full transition-all duration-300"
                      style={{ background: lvl <= strengthInfo.score ? strengthInfo.color : '#282b34' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#c0c0c0' }}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm outline-none transition-all"
                style={{ background: '#1b1d23', border: '1px solid #282b34', color: 'white' }}
                onFocus={(e) => e.target.style.borderColor = '#6d3bff'}
                onBlur={(e) => e.target.style.borderColor = '#282b34'}
              />
              <div className="absolute left-3.5 top-3 pointer-events-none" style={{ color: '#6b6b6b' }}>
                <LockIcon />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg cursor-pointer disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 6px 20px rgba(109,59,255,0.35)' }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Save & Update Password</span>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 'success' && (
        <div className="text-center py-4 space-y-5 slide-in relative z-10">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-green-400 border-2 border-green-500/30" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-lg cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #6d3bff, #ff4db8)', boxShadow: '0 6px 20px rgba(109,59,255,0.35)' }}
          >
            Proceed to Sign In
          </button>
        </div>
      )}
    </div>
  )

  if (isModal) {
    return cardContent
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: '#09090b', paddingTop: 80 }}>
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

function KeyIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-2-2l2 2M12 11l-9 9a2.828 2.828 0 0 0 4 4l3-3m-1-5l2 2m-2-2l3-3"/><circle cx="16.5" cy="7.5" r="4.5"/></svg>
}

function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.5 4.5l5.5 4 5.5-4"/></svg>
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
