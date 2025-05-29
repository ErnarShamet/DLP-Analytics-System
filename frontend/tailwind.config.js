// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", // if public/index.html is at root, this should be "./index.html"
    "./index.html" 
  ],
  darkMode: 'class', // or 'media' if you prefer OS-level dark mode
  theme: {
    extend: {
      colors: {
        'primary': {
          light: '#67e8f9', 
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        },
        'secondary': {
          light: '#f9a8d4',
          DEFAULT: '#ec4899',
          dark: '#be185d',
        },
        'dlp-bg': '#1a202c', 
        'dlp-surface': '#2d3748', 
        'dlp-text-primary': '#e2e8f0',
        'dlp-text-secondary': '#a0aec0',
        'dlp-accent': '#4299e1', 
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), 
  ],
}
