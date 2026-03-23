'use client'

import React from 'react'
import { ClientManager } from '@/components/modules/ClientManager'
import { AppNavbar } from '@/components/layout/AppNavbar'

export default function ClientsPage() {
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
        <ClientManager variant="page" />
      </div>
    </div>
  )
}
