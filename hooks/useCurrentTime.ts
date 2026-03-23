'use client'

import { useSyncExternalStore } from 'react'

let currentTime = Date.now()
const listeners = new Set<() => void>()
let intervalId: number | null = null

function emitChange() {
  currentTime = Date.now()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  if (listeners.size === 1) {
    intervalId = window.setInterval(emitChange, 1000)
  }

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0 && intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
  }
}

function getSnapshot() {
  return currentTime
}

export function useCurrentTime() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0)
}
