/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Baloo 2"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        momentum: {
          dark: '#0f172a',    // slate-950
          darker: '#020617',  // slate-950 darker
          panel: '#1e293b',   // slate-800
          border: '#334155',  // slate-700
          purple: '#a855f7',  // purple-500
          pink: '#ec4899',    // pink-500
          blue: '#3b82f6',    // blue-500
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 0.5s ease both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
