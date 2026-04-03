import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // Jalur ini wajib tanpa prefix /src/ agar Tailwind mendeteksi filemu
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'off-white':  '#f9f9f8',
        'charcoal':   '#1d1d1b',
        'sidebar-bg': '#f0ede8',
        'border':     '#e8e5e0',
        'accent':     '#c97b4b',
        'muted':      '#8a8680',
        'hover-bg':   '#eeebe6',
      },
      fontFamily: {
        serif:  ['var(--font-serif)',  'Georgia',    'Cambria', 'serif'],
        sans:   ['var(--font-sans)',   'system-ui',  'sans-serif'],
      },
      maxWidth: {
        '3xl': '48rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'pulse-dot':   'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%':           { transform: 'scale(1)',   opacity: '1'   },
        },
      },
    },
  },
  plugins: [],
};

export default config;
