'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    let active = true

    const initializeRecoverySession = async () => {
      const supabase = createClient()
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const hashParams = new URLSearchParams(hash)
      const type = hashParams.get('type')
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (type === 'recovery' && accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (setSessionError) {
          if (!active) return
          setError('This reset link is invalid or expired. Request a new one from sign in.')
          setSessionReady(true)
          return
        }

        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) return

      if (!session?.user) {
        setError('This reset link is invalid or expired. Request a new one from sign in.')
        setIsRecoverySession(false)
      } else {
        setIsRecoverySession(true)
      }
      setSessionReady(true)
    }

    void initializeRecoverySession()

    return () => {
      active = false
    }
  }, [])

  const handleReset = async () => {
    if (!isRecoverySession) {
      setError('This reset link is invalid or expired. Request a new one from sign in.')
      return
    }

    setError('')
    setSuccess('')

    const parsed = resetPasswordSchema.safeParse({ password, confirm })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid password')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.password })

      if (updateError) {
        throw updateError
      }

      setSuccess('Password updated. Redirecting to dashboard...')
      window.setTimeout(() => {
        router.push('/dashboard')
      }, 800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background-base p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-border-base bg-background-highlight p-8 shadow-md">
        <h1 className="mb-6 text-xl font-semibold text-text-base">Set new password</h1>

        {!sessionReady ? (
          <p className="text-sm text-text-muted">Validating reset link...</p>
        ) : null}

        {sessionReady && !isRecoverySession ? (
          <div className="mb-4 rounded-lg border border-border-base bg-background-base p-4">
            <p className="text-sm text-feedback-errorText">
              {error || 'This reset link is invalid or expired. Request a new one from sign in.'}
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-sm font-medium text-text-brand underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
          {error ? <p className="text-sm text-feedback-errorText">{error}</p> : null}
          {success ? <p className="text-sm text-feedback-successText">{success}</p> : null}

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-text-base">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!sessionReady || !isRecoverySession}
              className="rounded-lg border border-border-base bg-background-base px-4 py-3 text-text-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="text-sm font-medium text-text-base">Confirm new password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!sessionReady || !isRecoverySession}
              className="rounded-lg border border-border-base bg-background-base px-4 py-3 text-text-base"
            />
          </div>

          <button
            onClick={handleReset}
            disabled={loading || !sessionReady || !isRecoverySession}
            className="rounded-lg bg-button-primary py-3 text-sm font-medium text-button-primary-fg disabled:opacity-60"
            type="button"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          </div>
        )}
      </div>
    </main>
  )
}
