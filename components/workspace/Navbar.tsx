'use client'

import React from 'react'
import { ClockBold, Setting2Bold, UserBold } from 'sicons'

interface NavbarProps {
  userEmail?: string
  onSettingsClick?: () => void
  onProfileClick?: () => void
  currentTime?: string
}

export function Navbar({
  userEmail,
  onSettingsClick,
  onProfileClick,
  currentTime = '00:00:00',
}: NavbarProps) {
  return (
    <nav
      className="h-[60px] bg-background-base border-b border-border-muted shadow-sm flex items-center justify-between px-3xl"
      role="navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-md">
        <div className="bg-button-primary text-button-primary-fg rounded-md p-sm font-bold">
          S
        </div>
        <span className="font-semibold text-text-base text-lg hidden sm:inline">
          Stacklite
        </span>
      </div>

      {/* Right Section - Time, Settings, Profile */}
      <div className="flex items-center gap-lg">
        {/* Time Display */}
        <div className="hidden sm:flex items-center gap-md px-lg py-sm bg-background-highlight rounded-md text-text-muted">
          <ClockBold className="w-4 h-4" />
          <span className="text-sm font-medium">{currentTime}</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="p-md text-text-muted hover:text-text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-brand rounded-md"
          aria-label="Settings"
        >
          <Setting2Bold className="w-5 h-5" />
        </button>

        {/* Profile Button */}
        <button
          onClick={onProfileClick}
          className="p-md text-background-base bg-button-primary hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand rounded-md"
          aria-label="Profile"
          title={userEmail}
        >
          <UserBold className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}
