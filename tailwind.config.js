/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffdfa',
          100: '#fdfbf7',
          200: '#f7f2eb',
          300: '#eee5d8',
        },
        rosewood: {
          50: '#fcf6f6',
          100: '#f7eaea',
          200: '#eed2d3',
          300: '#dfacae',
          500: '#b85b65',
          700: '#8c3842',
          900: '#4a191f',
        },
        champagne: {
          50: '#fffcf5',
          100: '#fef7e6',
          200: '#fcecc7',
          300: '#fae0a2',
          400: '#f5c65d',
          500: '#d4a237',
          600: '#b88126',
        },
        espresso: {
          700: '#5c3a38',
          800: '#3e2423',
          900: '#261413',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        script: ['Great Vibes', 'Alex Brush', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'petal-fall': 'petalFall 7s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-10%) rotate(0deg) translateX(0px)', opacity: '0.9' },
          '50%': { transform: 'translateY(50vh) rotate(180deg) translateX(30px)', opacity: '0.8' },
          '100%': { transform: 'translateY(105vh) rotate(360deg) translateX(-20px)', opacity: '0.2' }
        }
      }
    },
  },
  plugins: [],
}
