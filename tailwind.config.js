/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}",     // All HTML and JS files in the root directory
    "./modules/*.js"  // All JS files in the modules directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 