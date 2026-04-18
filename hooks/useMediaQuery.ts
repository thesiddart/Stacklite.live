'use client'

import { useSyncExternalStore } from 'react'

function subscribe(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onStoreChange)
  return () => {
    media.removeEventListener('change', onStoreChange)
  }
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches
}

/** SSR / pre-hydration: assume no match so layout matches server output. */
function getServerSnapshot() {
  return false
}

/**
 * Subscribes to a CSS media query. Before hydration, returns `false` to match SSR;
 * after mount, reflects `window.matchMedia(query).matches`.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getSnapshot(query),
    getServerSnapshot
  )
}
