import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080808',
          card: '#111111',
          card2: '#181818',
          card3: '#1f1f1f',
        },
        accent: {
          DEFAULT: '#00e5a0',
          dim: '#00b37d',
        },
        border: {
          DEFAULT: '#222222',
          accent: 'rgba(0,229,160,0.3)',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
