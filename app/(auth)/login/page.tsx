'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginBold } from 'sicons'
import { createClient } from '@/lib/supabase/client'
import { AppNavbar } from '@/components/layout/AppNavbar'

function GoogleIcon() {
  return <Image src="/icons/social/google-original.svg" alt="Google" width={16} height={16} />
}

function GithubIcon() {
  return <Image src="/icons/social/github-original.svg" alt="GitHub" width={16} height={16} />
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerificationHelp, setNeedsVerificationHelp] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [forgotFeedback, setForgotFeedback] = useState('')
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<'google' | 'github' | null>(
    null
  )

  const callbackError = searchParams.get('error')

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLocked) {
      setError('Too many attempts. Please wait 15 minutes before trying again.')
      return
    }

    setError('')
    setForgotFeedback('')
    setNeedsVerificationHelp(false)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.'

      if (/email\s+not\s+confirmed/i.test(message)) {
        setNeedsVerificationHelp(true)
        setError('Your email is not verified yet. Please verify your inbox email before signing in.')
      } else {
        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)

        if (nextAttempts >= 5) {
          setIsLocked(true)
          setError('Too many attempts. Please wait 15 minutes before trying again.')
          window.setTimeout(() => {
            setIsLocked(false)
            setAttempts(0)
          }, 15 * 60 * 1000)
        } else {
          setError(`${message} (${5 - nextAttempts} attempts remaining)`)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase()
    setError('')
    setForgotFeedback('')

    if (!trimmedEmail) {
      setError('Enter your email first to reset password.')
      return
    }

    try {
      const supabase = createClient()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin
      const redirectUrl = `${appUrl}/auth/reset-password`

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      })

      if (resetError) {
        throw resetError
      }

      setForgotFeedback('Password reset email sent. Check your inbox and spam folder.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send password reset email.')
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError('')
    setOauthLoadingProvider(provider)

    try {
      const supabase = createClient()
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || window.location.origin
      const callbackUrl = `${appUrl}/auth/callback?next=/dashboard`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (oauthError) {
        throw oauthError
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `${provider} sign in failed. Check OAuth provider settings in Supabase.`
      )
      setOauthLoadingProvider(null)
    }
  }

  return (
    <div className="theme-page-shell">
      <div className="dots-background" />

      <AppNavbar
        topClassName="top-[50px]"
        zClassName="z-50"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
        connectDisabled={oauthLoadingProvider !== null}
        onConnectGoogle={() => {
          void handleOAuthSignIn('google')
        }}
        onConnectGithub={() => {
          void handleOAuthSignIn('github')
        }}
      />

      <main className="absolute left-1/2 top-1/2 z-10 flex w-[693px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-2">
        <div className="flex w-full items-center">
          <div className="theme-shell-chip inline-flex h-8 items-center justify-center gap-1 rounded-[8px] px-2 py-4">
            <LoginBold size={16} />
            <span className="text-[14px] font-medium leading-none">Sign In</span>
          </div>
        </div>

        <section className="theme-shell-panel w-full rounded-[14px] px-4 py-[59px]">
          <div className="mx-auto flex w-[510px] max-w-full flex-col gap-6">
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthLoadingProvider !== null}
                className="flex h-10 min-w-0 items-center justify-center gap-1 rounded-full border border-border-muted px-8 py-2 text-[12px] font-medium leading-[12px] text-text-muted transition-colors hover:bg-[var(--surface-overlay)] disabled:opacity-60"
              >
                <GoogleIcon />
                <span>{oauthLoadingProvider === 'google' ? 'Connecting...' : 'Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={oauthLoadingProvider !== null}
                className="flex h-10 min-w-0 items-center justify-center gap-1 rounded-full border border-border-muted px-8 py-2 text-[12px] font-medium leading-[12px] text-text-muted transition-colors hover:bg-[var(--surface-overlay)] disabled:opacity-60"
              >
                <GithubIcon />
                <span>Github</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <hr className="h-px flex-1 border-0 bg-border-muted" />
              <span className="text-[14px] leading-5 text-text-base">or sign in with email</span>
              <hr className="h-px flex-1 border-0 bg-border-muted" />
            </div>

            <form id="login-form" onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
              {callbackError && (
                <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md">
                  <p className="text-sm text-feedback-error-text">{callbackError}</p>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md">
                  <p className="text-sm text-feedback-error-text">{error}</p>
                </div>
              )}

              {forgotFeedback && (
                <div className="rounded-md border border-feedback-success-base/40 bg-feedback-success-base/10 p-md">
                  <p className="text-sm text-feedback-success-text">{forgotFeedback}</p>
                </div>
              )}

              {needsVerificationHelp && (
                <div className="rounded-md border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-md">
                  <p className="text-sm text-[var(--tertiary)]">
                    Need a new verification email?{' '}
                    <Link
                      href={
                        email.trim()
                          ? `/signup?email=${encodeURIComponent(email.trim().toLowerCase())}`
                          : '/signup'
                      }
                      className="font-medium underline"
                    >
                      Go to Sign Up and resend it
                    </Link>
                    .
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium leading-4 text-text-base">
                  Your email<span className="text-text-brand">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="theme-shell-field h-9 w-full rounded-[6px] px-3 py-1 text-[14px] leading-5 outline-none focus-visible:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-medium leading-4 text-text-base">
                    Password<span className="text-text-brand">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      void handleForgotPassword()
                    }}
                    className="text-[14px] leading-none text-text-muted underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="theme-shell-field h-9 w-full rounded-[6px] px-3 py-1 pr-10 text-[14px] leading-5 outline-none focus-visible:border-[var(--primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-text-base"
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
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
            </form>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                form="login-form"
                disabled={isLoading || isLocked}
                className="flex h-10 w-full items-center justify-center rounded-full bg-[var(--primary)] px-8 py-2 text-[14px] font-medium leading-4 text-[var(--base-white)] transition-all hover:opacity-90 disabled:opacity-60"
              >
                {isLocked ? 'Too many attempts' : isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <Link href="/signup" className="block">
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center rounded-full border border-[var(--primary)] px-8 py-2 text-[12px] font-medium leading-[12px] text-text-muted transition-all hover:bg-[var(--surface-overlay)]"
                >
                  Create New Account
                </button>
              </Link>

              <p className="text-center text-xs text-text-muted">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-[var(--primary)] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-text-brand hover:underline">
                  Privacy Policy
                </Link>
                . For support: <a href="mailto:hello@siddart.net" className="text-[var(--primary)] hover:underline">hello@siddart.net</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
