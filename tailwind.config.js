/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./sidepanel.html', './app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#f5f5f5', dark: '#1a1a2e' },
        card: { DEFAULT: '#ffffff', dark: '#16213e' },
        accent: { DEFAULT: '#e0e7ff', dark: '#0f3460' },
        muted: { DEFAULT: '#d1d5db', dark: '#333a56' },
      }
    }
  }
}
