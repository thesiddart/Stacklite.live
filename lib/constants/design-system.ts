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
      base: '#cee1f1',
      highlight: '#99acbb',
      muted: '#7a8c9a',
      emphasis: '#000711',
      disabled: '#60717f',
    },
    text: {
      base: '#000711',
      muted: '#253440',
      disabled: '#4a5b68',
      inverse: '#cee1f1',
      brand: '#4a00b3',
    },
    border: {
      base: '#60717f',
      muted: '#7a8c9a',
      disabled: '#99acbb',
    },
    button: {
      primary: '#5a00cc',
      primaryFg: '#cee1f1',
      secondary: '#7a8c9a',
      secondaryFg: '#000711',
      ghostFg: '#15242f',
    },
    link: {
      base: '#4a00b3',
      hover: '#3d009c',
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
      brand: '#6c00e6',
    },
    border: {
      base: '#253440',
      muted: '#15242f',
      disabled: '#07151f',
    },
    button: {
      primary: '#5a00cc',
      primaryFg: '#cee1f1',
      secondary: '#15242f',
      secondaryFg: '#cee1f1',
      ghostFg: '#60717f',
    },
    link: {
      base: '#6c00e6',
      hover: '#8114ff',
    },
  },
  // Feedback colors (consistent across modes)
  feedback: {
    error: {
      base: '#c40066',
      text: '#780033',
    },
    success: {
      base: '#007e00',
      text: '#004600',
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
