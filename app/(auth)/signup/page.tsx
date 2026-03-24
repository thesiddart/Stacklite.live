'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AppNavbar } from '@/components/layout/AppNavbar'

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function SignupPageContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false)
  const [verificationFeedback, setVerificationFeedback] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const emailFromQuery = searchParams.get('email')
    if (emailFromQuery) {
      setEmail(emailFromQuery)
    }
  }, [searchParams])

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setVerificationError('')
    setVerificationFeedback('')
    setIsLoading(true)

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin
      const callbackUrl = `${appUrl}/auth/callback?next=/dashboard`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      if (data.user) {
        setNeedsEmailVerification(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setVerificationError('Missing or invalid email address. Update your email and try again.')
      setVerificationFeedback('')
      return
    }

    setVerificationError('')
    setVerificationFeedback('')
    setIsResending(true)

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin
      const callbackUrl = `${appUrl}/auth/callback?next=/dashboard`

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: callbackUrl,
        },
      })

      if (resendError) {
        throw resendError
      }

      setVerificationFeedback('Verification email sent again. Please check inbox and spam.')
    } catch (err: unknown) {
      setVerificationError(
        err instanceof Error ? err.message : 'Could not resend verification email.'
      )
    } finally {
      setIsResending(false)
    }
  }

  const handleUpdateEmail = () => {
    setNeedsEmailVerification(false)
    setVerificationError('')
    setVerificationFeedback('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleGoogleSignup = async () => {
    setError('')
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin
      const callbackUrl = `${appUrl}/auth/callback?next=/dashboard`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred with Google sign up')
    }
  }

  const handleGithubSignup = async () => {
    setError('')
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin
      const callbackUrl = `${appUrl}/auth/callback?next=/dashboard`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred with GitHub sign up')
    }
  }

  return (
    <div className="theme-page-shell">
      {/* Dots Background */}
      <div className="dots-background" />

      {/* Navbar */}
      <AppNavbar
        topClassName="top-[50px]"
        zClassName="z-10"
        showThemeButton
        showProfileButton
      />

      {/* Main Content */}
      <div className="absolute left-1/2 top-1/2 z-10 w-[693px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2">
        {/* Sign Up Tab */}
        <div className="flex items-center mb-2">
          <div className="theme-shell-chip flex h-8 items-center gap-1 rounded-lg px-2">
            {needsEmailVerification ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2.6665 4.33325C2.6665 3.96506 2.96498 3.66659 3.33317 3.66659H12.6665C13.0347 3.66659 13.3332 3.96506 13.3332 4.33325V11.6666C13.3332 12.0348 13.0347 12.3333 12.6665 12.3333H3.33317C2.96498 12.3333 2.6665 12.0348 2.6665 11.6666V4.33325Z"
                  stroke="var(--tertiary)"
                  strokeWidth="1.5"
                />
                <path
                  d="M3.3335 4.33325L8.00016 8.33325L12.6668 4.33325"
                  stroke="var(--tertiary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="var(--tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.5998 14C13.5998 11.79 11.0798 10 7.9998 10C4.9198 10 2.3998 11.79 2.3998 14" stroke="var(--tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <p className="text-sm font-medium text-[var(--tertiary)]">
              {needsEmailVerification ? 'verify your email' : 'Sign Up'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="theme-shell-panel rounded-[14px] px-4 py-[59px]">
          <div className="w-[510px] max-w-full mx-auto flex flex-col gap-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {needsEmailVerification ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-semibold text-text-base">
                  Verify your email
                </h2>
                <p className="text-lg leading-8 text-[var(--text-soft-subtle)]">
                  We just sent an email to{' '}
                  <span className="font-medium text-[var(--tertiary)]">{normalizeEmail(email)}</span>. Click the
                  link in that email to verify your account.
                </p>

                {verificationFeedback && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-emerald-700">{verificationFeedback}</p>
                  </div>
                )}

                {verificationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-600">{verificationError}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    void handleResendVerification()
                  }}
                  disabled={isResending}
                  className="h-10 rounded-full bg-[var(--primary)] px-8 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isResending ? 'Resending email...' : 'Resend email'}
                </button>

                <button
                  type="button"
                  onClick={handleUpdateEmail}
                  className="h-10 rounded-full border border-[var(--primary)] px-8 py-2 text-xs font-medium text-[var(--text-soft-subtle)] transition-all hover:bg-[var(--surface-overlay)]"
                >
                  Update email address
                </button>

                <div className="my-2 h-px bg-[var(--surface-divider)]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center rounded-full border border-[var(--text-soft-subtle)] px-8 py-2 text-xs font-medium text-[var(--text-soft-subtle)] transition-all hover:bg-[var(--surface-overlay)]"
                  >
                    Open Gmail
                  </a>
                  <a
                    href="https://outlook.live.com/mail"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center rounded-full border border-[var(--text-soft-subtle)] px-8 py-2 text-xs font-medium text-[var(--text-soft-subtle)] transition-all hover:bg-[var(--surface-overlay)]"
                  >
                    Open Outlook
                  </a>
                </div>

                <Link
                  href="/login"
                  className="text-center text-sm text-[var(--text-soft-subtle)] underline"
                >
                  Already verified? Sign in
                </Link>
              </div>
            ) : (
              <>
                {/* OAuth Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleGoogleSignup}
                    type="button"
                    className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-[var(--text-soft-subtle)] px-8 py-2 transition-colors hover:bg-[var(--surface-overlay)]"
                    disabled={isLoading}
                  >
                    <Image src="/icons/social/google-original.svg" alt="Google" width={16} height={16} />
                    <span className="text-xs font-medium text-[var(--text-soft-subtle)]">
                      Google
                    </span>
                  </button>

                  <button
                    onClick={handleGithubSignup}
                    type="button"
                    className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-[var(--text-soft-subtle)] px-8 py-2 transition-colors hover:bg-[var(--surface-overlay)]"
                    disabled={isLoading}
                  >
                    <Image src="/icons/social/github-original.svg" alt="GitHub" width={16} height={16} />
                    <span className="text-xs font-medium text-[var(--text-soft-subtle)]">
                      Github
                    </span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-[var(--text-soft-subtle)]" />
                  <p className="text-sm text-text-base">
                    or sign up with email
                  </p>
                  <div className="flex-1 border-t border-[var(--text-soft-subtle)]" />
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  {/* Full Name Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <label htmlFor="fullName" className="text-sm font-medium text-text-base">
                        Full Name
                      </label>
                      <span className="text-sm font-medium text-[#fb3748]">*</span>
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="theme-shell-field h-9 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                      placeholder=" "
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <label htmlFor="email" className="text-sm font-medium text-text-base">
                        Your email
                      </label>
                      <span className="text-sm font-medium text-[#fb3748]">*</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="theme-shell-field h-9 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                      placeholder=" "
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <label htmlFor="password" className="text-sm font-medium text-text-base">
                        Password
                      </label>
                      <span className="text-sm font-medium text-[#fb3748]">*</span>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="theme-shell-field h-9 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                      placeholder=" "
                      disabled={isLoading}
                    />
                  </div>

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-text-base">
                        Confirm Password
                      </label>
                      <span className="text-sm font-medium text-[#fb3748]">*</span>
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="theme-shell-field h-9 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                      placeholder=" "
                      disabled={isLoading}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="h-10 rounded-full bg-[var(--primary)] px-8 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <Link
                      href="/login"
                      className="flex h-10 items-center justify-center rounded-full border border-[var(--primary)] px-8 py-2 text-xs font-medium text-[var(--text-soft-subtle)] transition-all hover:bg-[var(--surface-overlay)]"
                    >
                      Already have an account? Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  )
}
