/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.html", "./public/*.js"],
  theme: {
    extend: {
      colors: {
        'izzy-blue': '#0047AB',
        'izzy-purple': {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        'izzy-pink': {
          500: '#EC4899',
          600: '#DB2777',
        },
      },
      // Add animation definitions
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(0.5rem)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards', // Use 'forwards' to keep the final state
      },
    },
  },
  plugins: [],
};
 