'use client'

import React from 'react'
import { ContractGenerator } from '@/components/modules/ContractGenerator'
import { AppNavbar } from '@/components/layout/AppNavbar'

export default function ContractsPage() {
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

      <div className="relative z-10 mx-auto max-w-7xl px-lg pb-2xl pt-[120px]">
        <ContractGenerator variant="page" />
      </div>
    </div>
  )
}
