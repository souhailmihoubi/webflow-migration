const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000', // Black buttons
          hover: '#333333',
        },
        accent: {
          DEFAULT: '#C5A572', // Tan/Gold for secondary buttons/text
          hover: '#B09060',
        },
        cream: {
          DEFAULT: '#F9EFDB', // Site background
          light: '#FCF6E9',
        },
        dark: {
          DEFAULT: '#1A1A1A', // Footer background
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
    },
  },
  plugins: [],
}
