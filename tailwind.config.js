/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        trade: {
          bg: '#080B11',
          surface: '#0F1523',
          card: '#141C2E',
          cardBorder: '#1F2B45',
          accent: '#3B82F6',
          green: '#10B981',
          greenGlow: '#059669',
          red: '#EF4444',
          redGlow: '#DC2626',
          gold: '#F59E0B',
          cyan: '#06B6D4',
          muted: '#64748B',
          text: '#F1F5F9',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 40s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
