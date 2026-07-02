/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#333333', // Premium Charcoal
          900: '#1a1a1a', // Deep Charcoal
          950: '#0f0f0f',
        },
        accent: {
          blue: '#3b82f6', // Muted Blue
          navy: '#1e3a8a', // Deep Navy
          emerald: '#0f766e', // Dark Emerald
          amber: '#d97706', // Warm Amber
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      maxWidth: {
        'article': '680px', // Perfect reading width
      }
    },
  },
  plugins: [],
}

