/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./index.html",
      "./script.js",
      "./modules/*.js"
  ],
  theme: {
      extend: {
          colors: {
              'primary': '#2c3e50',       // Dark desaturated blue (for buttons, chips)
              'primary-hover': '#1a2833', // Darker shade for hover states
              'secondary': '#ecf0f1',     // Very light gray (for secondary buttons)
              'secondary-hover': '#d9dfe1',// Slightly darker gray for hover
              'text-primary': '#2c3e50',       // Same as primary (for headings, important text)
              'text-secondary': '#34495e',     // Slightly lighter dark blue (for regular text)
              'danger': '#e74c3c',       // Red (for delete buttons)
              'danger-hover': '#c0392b',   // Darker red for hover
              'accent': '#f39c12',       // Gold/yellow (for "Manage Exercises")
              'accent-hover': '#d68910',    //Deeper yellow.
              'success': '#27ae60',        // Green (for success messages)
              'card-bg': '#ffffff',       // Pure white (for cards/schedule container)
              'body-bg': '#f5f7fa',       // Very light gray (for overall background)
          }
      },
  },
  plugins: [],
}