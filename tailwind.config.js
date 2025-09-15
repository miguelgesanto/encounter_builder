/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
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
      }
    },
  },
  plugins: [],
}