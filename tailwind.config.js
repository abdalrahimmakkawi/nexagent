/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'serif'],
        sans: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#07070d',
        s1: '#0d0d18',
        s2: '#12121f',
        s3: '#18182a',
        accent: '#6b5ce7',
        'accent-2': '#8b7cf8',
        'accent-3': '#c4baff',
        green: '#3dffa0',
        amber: '#ffb84d',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
      },
    },
  },
  plugins: [],
}
