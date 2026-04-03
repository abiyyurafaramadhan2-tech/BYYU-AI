import type { Config } from 'tailwindcss';

const config: Config = {
  // BAGIAN KRUSIAL: Memastikan Tailwind mencari file di SEMUA folder
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
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
        serif:  ['var(--font-serif)',  'Georgia', 'serif'],
        sans:   ['var(--font-sans)',   'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
