/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bbe5c9',
          300: '#88d3a4',
          400: '#50b87a',
          500: '#2c9d5b',
          600: '#1d8049',
          700: '#18663c',
          800: '#155231',
          900: '#11442a',
          950: '#072717',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#fddba8',
          300: '#f9bf71',
          400: '#f59938',
          500: '#f37c14',
          600: '#e1630b',
          700: '#b94a0c',
          800: '#943c11',
          900: '#783312',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'count-up': 'countUp 1.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        countUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
