/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html"], // Scans all HTML files in the root directory
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
      },
    },
    plugins: [],
  };