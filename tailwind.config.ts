import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg1: 'var(--bg-1)',
        bg2: 'var(--bg-2)',
        bg3: 'var(--bg-3)',
        bg4: 'var(--bg-4)',
        tx1: 'var(--tx-1)',
        tx2: 'var(--tx-2)',
        tx3: 'var(--tx-3)',
        tx4: 'var(--tx-4)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
