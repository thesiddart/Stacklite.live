'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ClockBold, ColorfilterBold, LoginBold, MusicCircleBold, UserBold } from 'sicons'

function GoogleIcon() {
  return <Image src="/icons/social/google-original.svg" alt="Google" width={16} height={16} />
}

function GithubIcon() {
  return <Image src="/icons/social/github-original.svg" alt="GitHub" width={16} height={16} />
}

function NotionIcon() {
  return <Image src="/icons/social/notion-original.svg" alt="Notion" width={16} height={16} />
}

function formatWorkspaceTime(date: Date): string {
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const period = hours24 >= 12 ? 'PM' : 'AM'
  return `${String(hours12).padStart(2, '0')}:${minutes} ${period}`
}

type AppNavbarProps = {
  topClassName?: string
  zClassName?: string
  showThemeButton?: boolean
  showMusicButton?: boolean
  showMusicDropdownSkeleton?: boolean
  showProfileButton?: boolean
  showProfileDropdown?: boolean
  showProfileActiveBorder?: boolean
  connectDisabled?: boolean
  onConnectGoogle?: () => void
  onConnectGithub?: () => void
}

export function AppNavbar({
  topClassName = 'top-[50px]',
  zClassName = 'z-40',
  showThemeButton = false,
  showMusicButton = false,
  showMusicDropdownSkeleton = false,
  showProfileButton = true,
  showProfileDropdown = false,
  showProfileActiveBorder = false,
  connectDisabled = false,
  onConnectGoogle,
  onConnectGithub,
}: AppNavbarProps) {
  const [currentTime, setCurrentTime] = useState(formatWorkspaceTime(new Date()))
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const musicMenuRef = useRef<HTMLDivElement | null>(null)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatWorkspaceTime(new Date()))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      const clickedInMusicMenu = musicMenuRef.current?.contains(target) ?? false
      const clickedInProfileMenu = profileMenuRef.current?.contains(target) ?? false

      if (!clickedInMusicMenu) {
        setIsMusicMenuOpen(false)
      }

      if (!clickedInProfileMenu) {
        setIsProfileMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMusicMenuOpen(false)
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <header
      className={`absolute left-1/2 ${topClassName} ${zClassName} flex w-[1371px] max-w-[calc(100%-100px)] -translate-x-1/2 items-center justify-between`}
    >
      <div className="flex h-12 items-center gap-[5.94px] rounded-[14px] border border-[#e2e2e2] bg-white p-2 shadow-[0_4px_6px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)]">
        <Image src="/logo.svg" alt="Stacklite" width={161} height={44} className="h-8 w-auto" priority />
      </div>

      <div className="relative flex h-12 items-center gap-2 rounded-[14px] border border-[#e2e2e2] bg-white p-2 shadow-[0_4px_6px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.06)]">
        <div className="flex h-8 items-center justify-center gap-1 rounded-[8px] px-2 text-[#7f7f7f]">
          <ClockBold size={16} />
          <span className="text-[14px] font-medium leading-none">{currentTime.split(' ')[0]}</span>
          <span className="text-[14px] font-medium leading-none">{currentTime.split(' ')[1]}</span>
        </div>

        {showThemeButton && (
          <button
            type="button"
            aria-label="Theme"
            className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary,#7962f4)] text-white"
          >
            <ColorfilterBold size={16} />
          </button>
        )}

        {showMusicButton && (
          <div ref={musicMenuRef} className="relative">
            <button
              type="button"
              aria-label="Music"
              onClick={() => {
                setIsMusicMenuOpen((prev) => !prev)
                setIsProfileMenuOpen(false)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary,#7962f4)] text-white"
            >
              <MusicCircleBold size={16} />
            </button>

            {showMusicDropdownSkeleton && isMusicMenuOpen && (
              <div className="absolute right-0 top-[48px] z-50 w-[200px] rounded-[10px] border border-[#e2e2e2] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex h-8 items-center gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-[14px] font-medium text-[var(--tertairy,#251f7b)]">
                  <MusicCircleBold size={16} />
                  <span>Music</span>
                </div>
                <div className="mt-[10px] space-y-2">
                  <div className="h-2.5 w-24 animate-pulse rounded bg-[#e8e4f6]" />
                  <div className="h-2.5 w-32 animate-pulse rounded bg-[#eceaf6]" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-[#f0eef8]" />
                </div>
              </div>
            )}
          </div>
        )}

        {showProfileButton && (
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              aria-label="Profile"
              onClick={() => {
                if (!showProfileDropdown) {
                  return
                }

                setIsProfileMenuOpen((prev) => !prev)
                setIsMusicMenuOpen(false)
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary,#7962f4)] text-white ${
                showProfileActiveBorder && isProfileMenuOpen ? 'border border-[var(--tertairy,#251f7b)]' : ''
              }`}
            >
              <UserBold size={16} />
            </button>

            {showProfileDropdown && isProfileMenuOpen && (
              <div className="absolute right-0 top-[48px] z-50 w-[200px] rounded-[10px] border border-[#e2e2e2] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-[10px] text-[var(--tertairy,#251f7b)]">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex h-8 w-full items-center gap-1 rounded-[8px] bg-[#f3e8ff] px-2 text-left"
                  >
                    <UserBold size={16} />
                    <span className="text-[14px] font-medium leading-none">Profile</span>
                  </button>

                  <form action="/auth/signout" method="post" className="w-full">
                    <button
                      type="submit"
                      className="flex h-8 w-full items-center gap-1 rounded-[8px] px-2 text-left"
                    >
                      <LoginBold size={16} />
                      <span className="text-[14px] font-medium leading-none">logout</span>
                    </button>
                  </form>

                  <div className="h-px w-full bg-[#d8d8d8]" />

                  <div className="px-2">
                    <p className="text-[14px] font-medium leading-[19px]">Connect to</p>
                    <div className="mt-1 flex items-center gap-3 text-[#2b2b2b]">
                      <button
                        type="button"
                        onClick={onConnectGithub}
                        disabled={connectDisabled}
                        aria-label="Connect GitHub"
                        className="disabled:opacity-60"
                      >
                        <GithubIcon />
                      </button>
                      <button
                        type="button"
                        onClick={onConnectGoogle}
                        disabled={connectDisabled}
                        aria-label="Connect Gmail"
                        className="disabled:opacity-60"
                      >
                        <GoogleIcon />
                      </button>
                      <button type="button" aria-label="Connect Notion">
                        <NotionIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
