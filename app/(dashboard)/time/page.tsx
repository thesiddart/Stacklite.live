'use client'

import React from 'react'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { TimeTracker } from '@/components/modules/TimeTracker'

export default function TimePage() {
  return (
    <div className="theme-page-shell">
      <div className="dots-background" />
      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
      />

      <div className="relative z-10 mx-auto max-w-5xl px-lg pb-2xl pt-[120px]">
        <TimeTracker variant="page" />
      </div>
    </div>
  )
}
