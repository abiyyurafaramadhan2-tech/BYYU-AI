import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // Jalur ini harus sesuai dengan folder src/app di repo kamu
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    // Jalur cadangan jika ada file di luar src
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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
    },
  },
  plugins: [],
};
export default config;
