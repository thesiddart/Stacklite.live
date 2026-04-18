'use client'

import React from 'react'
import { AppNavbar } from '@/components/layout/AppNavbar'

export type DashboardShellProps = {
  children: React.ReactNode
  onOpenPrivacyPolicy: () => void
  onDownloadReport: () => void
}

export function DashboardShell({
  children,
  onOpenPrivacyPolicy,
  onDownloadReport,
}: DashboardShellProps) {
  return (
    <div className="theme-page-shell">
      <div className="dots-background" aria-hidden />

      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onDownloadReport={onDownloadReport}
      />

      {children}
    </div>
  )
}
