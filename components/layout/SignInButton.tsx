'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export function SignInButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push('/login')}
      aria-label="Sign in to Stacklite"
      className="h-8 rounded-[8px] bg-button-primary px-3 text-[12px] font-medium text-button-primary-fg transition-opacity hover:opacity-90"
    >
      Sign In
    </button>
  )
}
