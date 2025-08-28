import typography from '@tailwindcss/typography'
import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:     'hsl(var(--bg))',
        fg:     'hsl(var(--fg))',
        muted:  'hsl(var(--muted))',
        card:   'hsl(var(--card))',
        border: 'hsl(var(--border))',
        accent: 'hsl(var(--accent))',
        accent50: 'hsl(var(--accent-50))',
        code:   'hsl(var(--code))',
        codefg: 'hsl(var(--code-fg))',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [typography, animate]
}
