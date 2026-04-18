'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseEnv, SUPABASE_ENV_ERROR_MESSAGE } from '@/lib/supabase/env'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { track } from '@/lib/analytics'
import { SmsBold, UserBold } from 'sicons'
import { buildAuthRedirectUrl } from '@/lib/supabase/env'
import { useSessionStore } from '@/stores/sessionStore'
import { migrateGuestData } from '@/lib/migration/migrateGuestData'

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function SignupPageContent() {
  const searchParams = useSearchParams()
  const isGuest = useSessionStore((s) => s.isGuest)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false)
  const [verificationFeedback, setVerificationFeedback] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const shouldMigrateGuest =
    isGuest || searchParams.get('migrate') === 'true'

  function getSupabaseClient() {
    if (!getSupabaseEnv().isConfigured) {
      throw new Error(SUPABASE_ENV_ERROR_MESSAGE)
    }

    return createClient()
  }

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
      const supabase = getSupabaseClient()
      const callbackUrl = buildAuthRedirectUrl(
        `/auth/callback?next=/dashboard${shouldMigrateGuest ? '&migrate=true' : ''}`
      )

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
        if (shouldMigrateGuest && data.user?.id) {
          await migrateGuestData(data.user.id)
        }
        track('signup_completed')
        router.push('/dashboard')
        router.refresh()
        return
      }

      if (data.user) {
        track('signup_completed')
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
      const supabase = getSupabaseClient()
      const callbackUrl = buildAuthRedirectUrl(
        `/auth/callback?next=/dashboard${shouldMigrateGuest ? '&migrate=true' : ''}`
      )

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
      const supabase = getSupabaseClient()
      const callbackUrl = buildAuthRedirectUrl(
        `/auth/callback?next=/dashboard${shouldMigrateGuest ? '&migrate=true' : ''}`
      )

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
      const supabase = getSupabaseClient()
      const callbackUrl = buildAuthRedirectUrl(
        `/auth/callback?next=/dashboard${shouldMigrateGuest ? '&migrate=true' : ''}`
      )

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
        zClassName="z-50"
        showThemeButton
        showProfileButton
      />

      <main className="absolute left-1/2 top-1/2 z-10 flex w-[693px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-2">
        <div className="flex items-center">
          <div className="theme-shell-chip flex h-8 items-center gap-1 rounded-lg px-2">
            {needsEmailVerification ? <SmsBold size={16} /> : <UserBold size={16} />}
            <p className="text-sm font-medium text-[var(--tertiary)]">
              {needsEmailVerification ? 'verify your email' : 'Sign Up'}
            </p>
          </div>
        </div>

        <section className="theme-shell-panel relative w-full rounded-[14px] p-6">
          <div className="mx-auto flex w-[510px] max-w-full flex-col gap-6">

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-feedback-error-base/40 bg-feedback-error-base/10 px-4 py-3">
                <p className="text-sm text-feedback-error-text">{error}</p>
              </div>
            )}

            {needsEmailVerification ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-semibold text-text-base">
                  Verify your email
                </h2>
                <p className="text-lg leading-8 text-text-muted">
                  We just sent an email to{' '}
                  <span className="font-medium text-[var(--tertiary)]">{normalizeEmail(email)}</span>. Click the
                  link in that email to verify your account.
                </p>

                {verificationFeedback && (
                  <div className="rounded-lg border border-feedback-success-base/40 bg-feedback-success-base/10 px-4 py-3">
                    <p className="text-sm text-feedback-success-text">{verificationFeedback}</p>
                  </div>
                )}

                {verificationError && (
                  <div className="rounded-lg border border-feedback-error-base/40 bg-feedback-error-base/10 px-4 py-3">
                    <p className="text-sm text-feedback-error-text">{verificationError}</p>
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
                  className="h-10 rounded-full border border-[var(--primary)] px-8 py-2 text-xs font-medium text-text-muted transition-all hover:bg-[var(--surface-overlay)]"
                >
                  Update email address
                </button>

                <div className="my-2 h-px bg-[var(--surface-divider)]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center rounded-full border border-border-muted px-8 py-2 text-xs font-medium text-text-muted transition-all hover:bg-[var(--surface-overlay)]"
                  >
                    Open Gmail
                  </a>
                  <a
                    href="https://outlook.live.com/mail"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 items-center justify-center rounded-full border border-border-muted px-8 py-2 text-xs font-medium text-text-muted transition-all hover:bg-[var(--surface-overlay)]"
                  >
                    Open Outlook
                  </a>
                </div>

                <Link
                  href="/login"
                  className="text-center text-sm text-text-muted underline"
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
                    className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-border-muted px-8 py-2 transition-colors hover:bg-[var(--surface-overlay)]"
                    disabled={isLoading}
                  >
                    <Image src="/icons/social/google-original.svg" alt="Google" width={16} height={16} />
                    <span className="text-xs font-medium text-text-muted">
                      Google
                    </span>
                  </button>

                  <button
                    onClick={handleGithubSignup}
                    type="button"
                    className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-border-muted px-8 py-2 transition-colors hover:bg-[var(--surface-overlay)]"
                    disabled={isLoading}
                  >
                    <Image src="/icons/social/github-original.svg" alt="GitHub" width={16} height={16} />
                    <span className="text-xs font-medium text-text-muted">
                      Github
                    </span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border-muted" />
                  <p className="text-sm text-text-base">
                    or sign up with email
                  </p>
                  <div className="flex-1 border-t border-border-muted" />
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  {/* Full Name Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <label htmlFor="fullName" className="text-sm font-medium text-text-base">
                        Full Name
                      </label>
                      <span className="text-sm font-medium text-text-brand">*</span>
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
                      <span className="text-sm font-medium text-text-brand">*</span>
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
                      <span className="text-sm font-medium text-text-brand">*</span>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="theme-shell-field h-9 w-full rounded-md px-3 py-1 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder=" "
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-text-base"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                        disabled={isLoading}
                      >
                        {isPasswordVisible ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M3.5 12C4.6 8.7 8.1 5.25 12 5.25C15.9 5.25 19.4 8.7 20.5 12C19.4 15.3 15.9 18.75 12 18.75C8.1 18.75 4.6 15.3 3.5 12Z" fill="currentColor" opacity="0.45" />
                            <circle cx="12" cy="12" r="2.6" fill="currentColor" />
                            <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M2.5 12C3.5 8.5 7.2 4.75 12 4.75C16.8 4.75 20.5 8.5 21.5 12C20.5 15.5 16.8 19.25 12 19.25C7.2 19.25 3.5 15.5 2.5 12Z" fill="currentColor" opacity="0.45" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-text-base">
                        Confirm Password
                      </label>
                      <span className="text-sm font-medium text-text-brand">*</span>
                    </div>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="theme-shell-field h-9 w-full rounded-md px-3 py-1 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder=" "
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                        className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-text-base"
                        aria-label={isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}
                        disabled={isLoading}
                      >
                        {isConfirmPasswordVisible ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M3.5 12C4.6 8.7 8.1 5.25 12 5.25C15.9 5.25 19.4 8.7 20.5 12C19.4 15.3 15.9 18.75 12 18.75C8.1 18.75 4.6 15.3 3.5 12Z" fill="currentColor" opacity="0.45" />
                            <circle cx="12" cy="12" r="2.6" fill="currentColor" />
                            <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M2.5 12C3.5 8.5 7.2 4.75 12 4.75C16.8 4.75 20.5 8.5 21.5 12C20.5 15.5 16.8 19.25 12 19.25C7.2 19.25 3.5 15.5 2.5 12Z" fill="currentColor" opacity="0.45" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </div>
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

                    <Link href="/login" className="block">
                      <button
                        type="button"
                        className="flex h-10 w-full items-center justify-center rounded-full border border-[var(--primary)] px-8 py-2 text-[12px] font-medium leading-[12px] text-text-muted transition-all hover:bg-[var(--surface-overlay)]"
                      >
                        Already have an account? Sign In
                      </button>
                    </Link>

                    <p className="text-center text-xs text-text-muted">
                      By continuing, you agree to our{' '}
                      <Link href="/terms" className="!text-[var(--primary)] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="!text-[var(--primary)] hover:underline">
                        Privacy Policy
                      </Link>
                      . For support: <a href="mailto:hello@siddart.net" className="!text-[var(--primary)] hover:underline">hello@siddart.net</a>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
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
