export const radianTheme = {
  colors: {
    primary: 'var(--button-primary)',
    primaryFg: 'var(--button-primary-fg)',
    secondary: 'var(--button-secondary)',
    secondaryFg: 'var(--button-secondary-fg)',
    background: 'var(--background-base)',
    surface: 'var(--background-highlight)',
    muted: 'var(--background-muted)',
    border: 'var(--border-base)',
    text: 'var(--text-base)',
    textMuted: 'var(--text-muted)',
    error: 'var(--feedback-error-base)',
    success: 'var(--feedback-success-base)',
    warning: 'var(--feedback-warning-base)',
    info: 'var(--feedback-info-base)',
  },
} as const

export type RadianTheme = typeof radianTheme
