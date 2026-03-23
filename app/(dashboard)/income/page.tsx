'use client'

import React from 'react'
import { IncomeTracker } from '@/components/modules/IncomeTracker'
import { AppNavbar } from '@/components/layout/AppNavbar'

export default function IncomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f4f4]">
      <div className="dots-background" />
      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
      />

      <div className="relative z-10 mx-auto max-w-7xl px-lg pb-2xl pt-[120px]">
        <IncomeTracker variant="page" />
      </div>
    </div>
  )
}