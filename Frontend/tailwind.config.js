/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-green': '#4CAF50',
        'duo-green-dark': '#388E3C',
        'duo-blue': '#2196F3',
        'duo-blue-dark': '#1976D2',
        'duo-yellow': '#FFEB3B',
        'duo-yellow-dark': '#FBC02D',
        'duo-gray': '#BDBDBD',
        'duo-gray-dark': '#616161',
        'duo-red': '#F44336',
        'duo-red-dark': '#D32F2F',
        'background-dark': '#121212',
        'unit-purple': '#5E35B1',
        'unit-teal': '#00897B',
        'unit-orange': '#FB8C00',
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          300: '#D1D5DB',
          200: '#E5E7EB',
        },
      },
      animation: {
        'pulse-dark': 'pulse-dark 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-dark': {
          '0%, 100%': {
            backgroundColor: '#4CAF50', // duo-green
            opacity: 1,
          },
          '50%': {
            backgroundColor: '#388E3C', // duo-green-dark
            opacity: 0.7,
          },
        },
      },
    },
  },
  plugins: [],
}

