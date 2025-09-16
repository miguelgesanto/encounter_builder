/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // D&D theme colors that match CSS custom properties
        dnd: {
          // Primary background colors
          'bg-primary': 'var(--color-bg-primary)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-elevated': 'var(--color-bg-elevated)',
          'bg-hover': 'var(--color-bg-hover)',
          'bg-card': 'var(--color-bg-card)',

          // Text colors
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',

          // Combat colors
          'combat-current': 'var(--color-combat-current-turn)',
          'combat-pc': 'var(--color-combat-player-character)',
          'combat-monster': 'var(--color-combat-monster)',

          // UI colors
          'border': 'var(--color-ui-border)',
          'border-focus': 'var(--color-ui-border-focus)',
          'button': 'var(--color-ui-button)',
          'button-hover': 'var(--color-ui-button-hover)',
          'button-primary': 'var(--color-ui-button-primary)',
          'button-primary-hover': 'var(--color-ui-button-primary-hover)',
          'success': 'var(--color-ui-success)',
          'warning': 'var(--color-ui-warning)',
          'error': 'var(--color-ui-error)',
          'info': 'var(--color-ui-info)',

          // Legacy D&D colors (keeping for compatibility)
          red: '#c41e3a',
          gold: '#ffd700',
          blue: '#0066cc',
          green: '#228b22',
          purple: '#800080',
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.3' }],
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      }
    },
  },
  plugins: [],
}