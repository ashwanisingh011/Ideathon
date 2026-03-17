/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'duo-green': '#58CC02',
        'duo-green-dark': '#58A700',
        'duo-blue': '#1CB0F6',
        'duo-blue-dark': '#1899D6',
        'duo-yellow': '#FFC800',
        'duo-yellow-dark': '#D7A700',
        'duo-gray': '#E5E5E5',
        'duo-gray-dark': '#AFAFAF',
        'duo-red': '#FF4B4B',
        'duo-red-dark': '#EA2B2B',
      }
    },
  },
  plugins: [],
}

