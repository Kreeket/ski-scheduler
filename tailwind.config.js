/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./script.js",
        "./modules/**/*.js",
        "./styles/**/*.css"
    ],
    theme: {
        extend: {
            colors: {
                // Primary colors
                'primary': {
                    DEFAULT: '#1e3a8a',  // Base primary color (darker blue)
                    'hover': '#0f2361',   // Hover state
                    'active': '#0a1845',  // Active/pressed state
                    'light': '#3151a6',   // Lighter shade for backgrounds
                    'dark': '#102154'     // Darker shade for contrast
                },
                
                // Secondary colors
                'secondary': {
                    DEFAULT: '#e2e8f0',   // Base secondary color (light gray)
                    'hover': '#cbd5e1',   // Hover state
                    'active': '#94a3b8',  // Active/pressed state
                },
                
                // Accent colors
                'accent': {
                    DEFAULT: '#ea580c',   // Base accent color (orange)
                    'hover': '#c2410c',   // Hover state
                    'active': '#9a3412',  // Active/pressed state
                },
                
                // Semantic colors
                'success': '#16a34a',     // Success messages
                'danger': {
                    DEFAULT: '#dc2626',   // Error/danger (red)
                    'hover': '#b91c1c',   // Hover state
                },
                'warning': '#eab308',     // Warning messages
                'info': '#0284c7',        // Info messages
                
                // UI colors
                'text': {
                    'primary': '#1e293b', // Main text color
                    'secondary': '#334155' // Secondary text
                },
                'card-bg': '#ffffff',     // Card background
                'body-bg': '#f1f5f9',     // Page background
            },
            
            fontFamily: {
                'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                'heading': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
            },
            
            spacing: {
                '72': '18rem',
                '80': '20rem',
                '96': '24rem',
                '128': '32rem',
            },
            
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            
            boxShadow: {
                'card': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
                'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            
            zIndex: {
                'modal': 1000,
                'dropdown': 100,
                'header': 50,
            },
            
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}