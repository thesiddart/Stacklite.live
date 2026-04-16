'use client'

import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleReset = async () => {
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
      <div className="w-full max-w-sm rounded-2xl border border-border-base bg-background-highlight p-8 shadow-md">
        <h1 className="mb-6 text-xl font-semibold text-text-base">Set new password</h1>

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
              className="rounded-lg border border-border-base bg-background-base px-4 py-3 text-text-base"
            />
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="rounded-lg bg-button-primary py-3 text-sm font-medium text-button-primary-fg disabled:opacity-60"
            type="button"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </main>
  )
}
