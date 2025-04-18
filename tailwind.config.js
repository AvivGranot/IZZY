/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/**/*.{html,js}",
    "./index.html",
    "./*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        'izzy-purple': {
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        'izzy-pink': {
          100: '#FCE7F3',
          200: '#FBCFE8',
          500: '#EC4899',
          600: '#DB2777',
        },
        'izzy-blue': {
          500: '#3B82F6',
          600: '#2563EB',
        }
      },
    },
  },
  plugins: [],
}