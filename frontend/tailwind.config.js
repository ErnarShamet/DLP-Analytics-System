// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // or 'media' if you prefer OS-level dark mode
  theme: {
    extend: {
      colors: {
        // Example custom colors
        'primary': {
          light: '#67e8f9', // Adjust to your theme
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        },
        'secondary': {
          light: '#f9a8d4',
          DEFAULT: '#ec4899',
          dark: '#be185d',
        },
        // Add more custom colors for your DLP theme
        'dlp-bg': '#1a202c', // Example dark background
        'dlp-surface': '#2d3748', // Example surface color
        'dlp-text-primary': '#e2e8f0',
        'dlp-text-secondary': '#a0aec0',
        'dlp-accent': '#4299e1', // Example accent color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: Using Inter font
      },
      // You can extend other properties like spacing, borderRadius, etc.
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // For better default form styles
  ],
}