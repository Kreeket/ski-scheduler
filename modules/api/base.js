// base.js - Base API configuration and utilities

/**
 * Get the API base URL
 * @returns {string} - API base URL
 */
export function getApiBaseUrl() {
    // Use development URL during development
    // Make sure this matches your backend server URL
   // return 'http://localhost:3000/api';
    
    // For production, uncomment this:
     return 'https://ski-scheduler.onrender.com/api';
}

/**
 * Generic fetch function with error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export async function fetchWithErrorHandling(url, options = {}) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            } catch (jsonError) {
                throw new Error(`Request failed with status ${response.status}`);
            }
        }
        
        return response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error: Check your connection and try again');
        }
        throw error;
    }
}

/**
 * Create standard request options for API calls
 * @param {string} method - HTTP method
 * @param {Object} data - Request data
 * @returns {Object} - Request options
 */
export function createRequestOptions(method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    return options;
}