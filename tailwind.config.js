/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fefab8',
          200: '#fef380',
          300: '#fde547',
          400: '#fbd01e',
          500: '#d99f05',
          600: '#b87b00',
          700: '#935800',
          800: '#774507',
          900: '#64390c',
        },
        rosewood: {
          50: '#fcf4f5',
          100: '#f9e6e8',
          500: '#8c263e',
          900: '#47101e',
        },
        cream: {
          50: '#fdfcf7',
          100: '#f9f6e8',
          200: '#f3eed2',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        script: ['Great Vibes', 'Alex Brush', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
