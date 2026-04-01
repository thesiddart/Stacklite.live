/**
 * Design System Constants & Utilities
 * Stacklite Design System based on Lumea Tokens
 */

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const

export const RADIUS = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
} as const

export const SHADOWS = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
  md: '0 4px 16px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
} as const

/**
 * Color Palette
 * Light Mode & Dark Mode support via CSS variables
 */
export const COLORS = {
  // Light mode
  light: {
    background: {
      base: '#f3f7f1',
      highlight: '#e3eee8',
      muted: '#cddfd4',
      emphasis: '#000711',
      disabled: '#97aa9f',
    },
    text: {
      base: '#000711',
      muted: '#253440',
      disabled: '#4a5b68',
      inverse: '#f3f7f1',
      brand: '#2d8a64',
    },
    border: {
      base: '#97aa9f',
      muted: '#b8ccc1',
      disabled: '#d5e4db',
    },
    button: {
      primary: '#2d8a64',
      primaryFg: '#f3f7f1',
      secondary: '#c7d8ce',
      secondaryFg: '#000711',
      ghostFg: '#1f6f51',
    },
    link: {
      base: '#2d8a64',
      hover: '#1f6f51',
    },
  },
  // Dark mode
  dark: {
    background: {
      base: '#000711',
      highlight: '#07151f',
      muted: '#15242f',
      emphasis: '#99acbb',
      disabled: '#253440',
    },
    text: {
      base: '#cee1f1',
      muted: '#4a5b68',
      disabled: '#364653',
      inverse: '#000711',
      brand: '#58b389',
    },
    border: {
      base: '#253440',
      muted: '#15242f',
      disabled: '#07151f',
    },
    button: {
      primary: '#2d8a64',
      primaryFg: '#cee1f1',
      secondary: '#15242f',
      secondaryFg: '#cee1f1',
      ghostFg: '#8fc7ae',
    },
    link: {
      base: '#58b389',
      hover: '#7dccaa',
    },
  },
  // Feedback colors (consistent across modes)
  feedback: {
    error: {
      base: '#c40066',
      text: '#780033',
    },
    success: {
      base: '#2d8a64',
      text: '#1f6f51',
    },
    warning: {
      base: '#a35600',
      text: '#400d00',
    },
    info: {
      base: '#0077c3',
      text: '#003f7c',
    },
  },
} as const

// Module minimum width for canvas layout
export const MODULE_MIN_WIDTH = '280px'

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  timer: {
    start_pause: 'Space',
    stop: 'Escape',
  },
} as const

// Input validation rules
export const VALIDATION = {
  client: {
    nameMin: 1,
    nameMax: 255,
    emailMax: 255,
    phoneMax: 20,
  },
  contract: {
    descriptionMin: 10,
    descriptionMax: 2000,
  },
  invoice: {
    noteMax: 1000,
    itemDescriptionMax: 500,
  },
} as const
