/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07080f',
        card: '#0d1117',
        cardAlt: '#111827',
        border: 'rgba(255,255,255,0.06)',
        gold: '#f5c518',
        success: '#22c55e',
        warning: '#f97316',
        danger: '#ef4444',
        textPrimary: '#e2e8f0',
        textMuted: '#94a3b8',
        sub: '#64748b',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
