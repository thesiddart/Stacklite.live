import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: 'var(--background-base)',
          highlight: 'var(--background-highlight)',
          muted: 'var(--background-muted)',
          emphasis: 'var(--background-emphasis)',
          disabled: 'var(--background-disabled)',
        },
        text: {
          base: 'var(--text-base)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
          inverse: 'var(--text-inverse)',
          brand: 'var(--text-brand)',
        },
        border: {
          base: 'var(--border-base)',
          muted: 'var(--border-muted)',
          disabled: 'var(--border-disabled)',
        },
        button: {
          primary: 'var(--button-primary)',
          'primary-fg': 'var(--button-primary-fg)',
          secondary: 'var(--button-secondary)',
          'secondary-fg': 'var(--button-secondary-fg)',
          'ghost-fg': 'var(--button-ghost-fg)',
        },
        link: {
          base: 'var(--link-base)',
          hover: 'var(--link-hover)',
        },
        feedback: {
          error: {
            base: 'var(--feedback-error-base)',
            text: 'var(--feedback-error-text)',
          },
          success: {
            base: 'var(--feedback-success-base)',
            text: 'var(--feedback-success-text)',
          },
          warning: {
            base: 'var(--feedback-warning-base)',
            text: 'var(--feedback-warning-text)',
          },
          info: {
            base: 'var(--feedback-info-base)',
            text: 'var(--feedback-info-text)',
          },
        },
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: "var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)",
      },
      minWidth: {
        module: '280px',
      },
    },
  },
  plugins: [],
}

export default config
