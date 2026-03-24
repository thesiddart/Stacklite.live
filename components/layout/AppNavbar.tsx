'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { CloseCircleBold, ColorfilterBold, EditBold, LoginBold, MusicCircleBold, TrashBold, UserBold, WatchBold } from 'sicons'
import { useAuth } from '@/hooks/useAuth'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

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
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const period = hours24 >= 12 ? 'PM' : 'AM'
  return `${String(hours12).padStart(2, '0')}:${minutes}:${seconds} ${period}`
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
  const { user } = useAuth()
  const { data: profile } = useProfile(Boolean(user))
  const updateProfileMutation = useUpdateProfile()
  const [currentTime, setCurrentTime] = useState(formatWorkspaceTime(new Date()))
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light')
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [profileView, setProfileView] = useState<'menu' | 'details'>('menu')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    company_name: '',
    company_address: '',
    tax_id: '',
  })
  const musicMenuRef = useRef<HTMLDivElement | null>(null)
  const themeMenuRef = useRef<HTMLDivElement | null>(null)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const photoInputId = useId()
  const authInputClassName =
    'theme-shell-field h-9 w-full rounded-[6px] pl-3 pr-3 py-1 text-[13px] leading-5 focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
  const authTextareaClassName =
    'theme-shell-field w-full rounded-[6px] pl-3 pr-3 py-2 text-[13px] leading-5 focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
  const profileName = profile?.full_name
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Profile'
  const profileEmail = profile?.email || user?.email || ''
  const profilePhoto = photoPreview || user?.user_metadata?.avatar_url || null
  const profileInitial = profileName.charAt(0).toUpperCase()

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('stacklite-theme')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setSelectedTheme(storedTheme)
      document.documentElement.classList.toggle('dark', storedTheme === 'dark')
    }
  }, [])

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

      const clickedInThemeMenu = themeMenuRef.current?.contains(target) ?? false
      const clickedInMusicMenu = musicMenuRef.current?.contains(target) ?? false
      const clickedInProfileMenu = profileMenuRef.current?.contains(target) ?? false

      if (!clickedInThemeMenu) {
        setIsThemeMenuOpen(false)
      }

      if (!clickedInMusicMenu) {
        setIsMusicMenuOpen(false)
      }

      if (!clickedInProfileMenu) {
        setIsProfileMenuOpen(false)
        setProfileView('menu')
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsThemeMenuOpen(false)
        setIsMusicMenuOpen(false)
        setIsProfileMenuOpen(false)
        setProfileView('menu')
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme)
    setIsThemeMenuOpen(false)
    window.localStorage.setItem('stacklite-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  useEffect(() => {
    if (!profile && !user) {
      return
    }

    setProfileForm({
      full_name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      email: profile?.email || user?.email || '',
      company_name: profile?.company_name || '',
      company_address: profile?.company_address || '',
      tax_id: profile?.tax_id || '',
    })
  }, [profile, user])

  useEffect(() => {
    if (!isProfileMenuOpen) {
      setProfileView('menu')
      setProfileError('')
      setProfileSuccess('')
    }
  }, [isProfileMenuOpen])

  const handleProfileFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
    setProfileError('')
    setProfileSuccess('')
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    try {
      await updateProfileMutation.mutateAsync({
        full_name: profileForm.full_name.trim() || null,
        company_name: profileForm.company_name.trim() || null,
        company_address: profileForm.company_address.trim() || null,
        tax_id: profileForm.tax_id.trim() || null,
      })
      setProfileSuccess('Profile updated')
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  return (
    <header
      className={`absolute left-1/2 ${topClassName} ${zClassName} flex w-[1371px] max-w-[calc(100%-100px)] -translate-x-1/2 items-center justify-between`}
    >
      <div className="theme-shell-card flex h-12 items-center gap-[5.94px] rounded-[14px] p-2">
        <Image src="/logo.svg" alt="Stacklite" width={161} height={44} className="h-8 w-auto" priority />
      </div>

      <div className="theme-shell-card relative flex h-12 items-center gap-2 rounded-[14px] p-2">
        <div className="theme-shell-subtle flex h-8 items-center justify-center gap-1 rounded-[8px] px-2">
          <WatchBold size={16} />
          <span className="text-[14px] font-medium leading-none">{currentTime.split(' ')[0]}</span>
          <span className="text-[14px] font-medium leading-none">{currentTime.split(' ')[1]}</span>
        </div>

        {showThemeButton && (
          <div ref={themeMenuRef} className="relative">
            <button
              type="button"
              aria-label="Theme"
              onClick={() => {
                setIsThemeMenuOpen((prev) => !prev)
                setIsMusicMenuOpen(false)
                setIsProfileMenuOpen(false)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary)] text-white"
            >
              <ColorfilterBold size={16} />
            </button>

            <div
              aria-hidden={!isThemeMenuOpen}
              className={`theme-shell-card absolute right-0 top-[48px] z-50 overflow-hidden rounded-[18px] p-4 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isThemeMenuOpen
                  ? 'pointer-events-auto h-auto w-[364px] opacity-100 translate-y-0'
                  : 'pointer-events-none h-0 w-[220px] opacity-0 -translate-y-2 p-0'
              }`}
            >
              <div className="theme-shell-strong flex h-full flex-col gap-4">
                <div className="theme-shell-chip flex items-center justify-between rounded-[8px] px-2 py-2">
                  <span className="text-[14px] font-medium leading-none">Theme</span>
                  <span className="inline-flex h-4 w-4" aria-hidden="true" />
                </div>

                <div className="grid flex-1 grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`overflow-hidden rounded-[18px] border bg-[var(--surface-card)] text-left transition-all duration-200 ${
                      selectedTheme === 'dark'
                        ? 'border-[#1f275f]'
                        : 'border-[rgba(31,39,95,0.12)] hover:border-[rgba(31,39,95,0.28)]'
                    }`}
                  >
                    <div className="flex h-[92px] items-center justify-center bg-[radial-gradient(circle_at_25%_20%,rgba(130,146,255,0.45),transparent_22%),linear-gradient(135deg,#28306d_0%,#131a46_100%)]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#d8c8ff_0%,#ab8dff_100%)] text-white shadow-[0_12px_24px_rgba(42,50,118,0.32)]">
                        <ColorfilterBold size={28} />
                      </div>
                    </div>
                    <div className="bg-[var(--surface-card)] px-4 py-4 text-[14px] font-semibold leading-none text-[var(--text-soft-strong)]">
                      Dark
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`overflow-hidden rounded-[18px] border bg-[var(--surface-card)] text-left transition-all duration-200 ${
                      selectedTheme === 'light'
                        ? 'border-[var(--primary)]'
                        : 'border-[rgba(121,98,244,0.18)] hover:border-[rgba(121,98,244,0.38)]'
                    }`}
                  >
                    <div className="flex h-[92px] items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(255,235,200,0.8),transparent_24%),linear-gradient(180deg,#fff3dc_0%,#efdfbb_100%)]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#efe5ff_0%,#c1b2f0_100%)] text-[#6753cb] shadow-[0_12px_24px_rgba(201,171,132,0.22)]">
                        <ColorfilterBold size={28} />
                      </div>
                    </div>
                    <div className="bg-[var(--surface-card)] px-4 py-4 text-[14px] font-semibold leading-none text-[var(--text-soft-strong)]">
                      Light
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
              className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary)] text-white"
            >
              <MusicCircleBold size={16} />
            </button>

            {showMusicDropdownSkeleton && isMusicMenuOpen && (
              <div className="theme-shell-card absolute right-0 top-[48px] z-50 w-[200px] rounded-[10px] p-4">
                <div className="theme-shell-chip flex h-8 items-center gap-1 rounded-[8px] px-2 text-[14px] font-medium">
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
              className={`flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary)] text-white ${
                showProfileActiveBorder && isProfileMenuOpen
                  ? 'border border-[var(--tertiary)]'
                  : 'border border-[rgba(121,98,244,0.46)]'
              }`}
            >
              {profilePhoto ? (
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-[6px] bg-white">
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-[6px] object-cover"
                  />
                </span>
              ) : (
                <UserBold size={16} />
              )}
            </button>

            {showProfileDropdown && (
              <div
                aria-hidden={!isProfileMenuOpen}
                className={`theme-shell-card absolute right-0 top-[48px] z-50 overflow-hidden rounded-[10px] p-4 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isProfileMenuOpen
                    ? `${profileView === 'details' ? 'h-[420px] w-[320px]' : 'h-[182px] w-[200px]'} pointer-events-auto opacity-100 translate-y-0 scale-100`
                    : 'pointer-events-none h-[140px] w-[180px] opacity-0 -translate-y-2 scale-[0.98]'
                }`}
              >
                {profileView === 'details' ? (
                  <div className="flex h-full min-h-0 flex-col gap-3 text-[var(--tertiary)]">
                    <div className="theme-shell-chip flex h-8 items-center justify-between rounded-[8px] px-2">
                      <span className="text-[14px] font-medium leading-none">Profile</span>
                      <button
                        type="button"
                        onClick={() => setProfileView('menu')}
                        aria-label="Close profile details"
                        className="inline-flex h-4 w-4 items-center justify-center text-[var(--tertiary)]"
                      >
                        <CloseCircleBold size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative h-[73px] w-[73px] shrink-0">
                        {profilePhoto ? (
                          <Image
                            src={profilePhoto}
                            alt="Profile"
                            width={73}
                            height={73}
                            className="h-[73px] w-[73px] rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-[73px] w-[73px] items-center justify-center rounded-full bg-[var(--primary)] text-[26px] font-semibold text-white">
                            {profileInitial}
                          </div>
                        )}

                        <label
                          htmlFor={photoInputId}
                          className="theme-shell-chip absolute right-0 top-0 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                        >
                          <EditBold size={14} />
                        </label>

                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          aria-label="Remove profile photo"
                          className="absolute bottom-0 right-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-card)] text-[#d14343] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                        >
                          <TrashBold size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-medium leading-none text-[var(--tertiary)]">
                          Profile photo
                        </span>
                        <span className="theme-shell-subtle text-[12px] leading-none">
                          Use the edit icon to upload or trash to remove.
                        </span>
                        <input
                          id={photoInputId}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1 theme-scrollbar">
                        <div>
                          <label className="mb-1 block text-[12px] font-medium leading-none text-text-base">
                            Full Name
                          </label>
                          <input
                            name="full_name"
                            value={profileForm.full_name}
                            onChange={handleProfileFieldChange}
                            className={authInputClassName}
                            placeholder="Your name"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[12px] font-medium leading-none text-text-base">
                            Email
                          </label>
                          <input
                            name="email"
                            value={profileForm.email}
                            disabled
                            className={`${authInputClassName} cursor-not-allowed`}
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[12px] font-medium leading-none text-text-base">
                            Company
                          </label>
                          <input
                            name="company_name"
                            value={profileForm.company_name}
                            onChange={handleProfileFieldChange}
                            className={authInputClassName}
                            placeholder="Studio name"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[12px] font-medium leading-none text-text-base">
                            Tax ID
                          </label>
                          <input
                            name="tax_id"
                            value={profileForm.tax_id}
                            onChange={handleProfileFieldChange}
                            className={authInputClassName}
                            placeholder="Tax identifier"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[12px] font-medium leading-none text-text-base">
                            Address
                          </label>
                          <textarea
                            name="company_address"
                            value={profileForm.company_address}
                            onChange={handleProfileFieldChange}
                            className={authTextareaClassName}
                            rows={3}
                            placeholder="Business address"
                          />
                        </div>
                      </div>

                      {(profileError || profileSuccess) && (
                        <p className={`text-[12px] leading-none ${profileError ? 'text-[#d14343]' : 'text-[#2f8f4e]'}`}>
                          {profileError || profileSuccess}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-end gap-2">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[var(--primary)] px-3 text-[12px] font-medium text-white disabled:opacity-60"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex h-full flex-col gap-[10px] text-[var(--tertiary)]">
                    <button
                      type="button"
                      onClick={() => setProfileView('details')}
                      className="flex h-8 w-full items-center gap-1 rounded-[8px] px-2 text-left transition-colors duration-200 hover:bg-[var(--surface-chip)]"
                    >
                      <UserBold size={16} />
                      <span className="text-[14px] font-medium leading-none">Profile</span>
                    </button>

                    <form action="/auth/signout" method="post" className="w-full">
                      <button
                        type="submit"
                        className="flex h-8 w-full items-center gap-1 rounded-[8px] px-2 text-left transition-colors duration-200 hover:bg-[var(--surface-chip)]"
                      >
                        <LoginBold size={16} />
                        <span className="text-[14px] font-medium leading-none">logout</span>
                      </button>
                    </form>

                    <div className="theme-shell-divider h-px w-full" />

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
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
