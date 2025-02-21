/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./index.html",      // Scan index.html
      "./script.js",       // Scan script.js  <-- VERY IMPORTANT
      "./modules/*.js"     // Scan all .js files in modules/
  ],
  theme: {
      extend: {
          colors: {
              'primary': '#84a59d', // Cambridge Blue
              'primary-hover': '#6b8880', // Darker Cambridge Blue
              'secondary': '#f7ede2', // Linen
              'secondary-hover': '#e7d9ce', //Darker Linen
              'text-primary': '#1a1a1a',
              'text-secondary': '#666666',
              'danger': '#f28482', // Light Coral
              'danger-hover': '#d96563', // Darker Light Coral
              'accent': '#f6bd60', // Hunyadi Yellow
              'accent-hover': '#e8a84d', //Deeper yellow
              'success' : '#16a34a',
              'card-bg': '#e2e8f0', // Light gray for card background (Tailwind's gray-200)
              'body-bg': '#b8d9cf', // Custom background color. <--- THIS WAS THE ONLY CHANGE!
          }
      },
  },
  plugins: [],
}