/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'felt-green': '#0B5C0E',
        'felt-dark': '#063807',
        'card-red': '#DC2626',
        'card-black': '#0F172A',
        'gold': '#FFD700',
      },
      animation: {
        'deal': 'dealCard 0.5s ease-out',
        'flip': 'flipCard 0.6s ease-in-out',
      },
      keyframes: {
        dealCard: {
          '0%': { transform: 'translateY(-100px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        flipCard: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}