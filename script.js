// script.js - Main entry point
import * as app from './modules/app.js';
import * as auth from './modules/api/auth.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add debugging to track initialization progress
    console.log('DOM loaded, initializing application...');
    
    // Check URL parameters for logout
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('logout')) {
            console.log('Logout parameter detected, clearing authentication');
            auth.logout();
            // Remove the parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.warn('Error checking URL parameters:', error);
    }
    
    try {
        app.init()
            .then(() => {
                console.log('Application initialized successfully');
            })
            .catch(error => {
                console.error('Failed to initialize application:', error);
                // Display a user-friendly error in case of initialization failure
                showApplicationError(error);
            });
    } catch (error) {
        console.error('Error during app initialization setup:', error);
        showApplicationError(error);
    }
});

/**
 * Display a user-friendly error message
 * @param {Error} error - The error that occurred
 */
function showApplicationError(error) {
    // Try to create an error message element
    try {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'bg-red-600 text-white p-4 rounded-md shadow-md max-w-md mx-auto mt-8';
        errorMessage.innerHTML = `
            <h2 class="text-xl font-bold mb-2">Application Error</h2>
            <p>Sorry, we encountered a problem while starting the application. Please try refreshing the page.</p>
            <p class="text-sm mt-2">Error details: ${error.message || 'Unknown error'}</p>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorMessage, container.firstChild);
        } else {
            // If container not found, add to body
            document.body.appendChild(errorMessage);
        }
    } catch (displayError) {
        console.error('Error displaying error message:', displayError);
        // Last resort: alert
        alert('Application Error: ' + (error.message || 'Unknown error'));
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});

// Handle promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});