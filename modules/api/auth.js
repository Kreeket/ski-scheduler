// auth.js - API module for authentication
import { getApiBaseUrl, createRequestOptions } from './base.js';

/**
 * Authenticate a user with password
 * @param {string} password - User password
 * @returns {Promise<boolean>} - Authentication success
 */
export async function authenticateUser(password) {
    if (!password || password.trim() === '') {
        throw new Error('Password is required');
    }
    
    try {
        const url = `${getApiBaseUrl()}/login`;
        console.log("Login URL:", url); // Debugging
        
        const options = createRequestOptions('POST', { password });
        
        const response = await fetch(url, options);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Login endpoint not found (404).');
            }
            
            // Try to get error message from response
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            } catch (jsonError) {
                throw new Error(`Login failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        return data.success;

    } catch (error) {
        console.error("Authentication error:", error);
        
        // Provide more informative error message for common errors
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error: Could not connect to the server. Make sure your backend is running.');
        }
        
        throw error;
    }
}

/**
 * Check if the user is authenticated with session expiration
 * @returns {boolean} - Authentication status
 */
export function isAuthenticated() {
    const authData = getAuthData();
    
    if (!authData) {
        return false;
    }
    
    // Check if the session has expired (24 hours)
    const now = new Date().getTime();
    if (now > authData.expiresAt) {
        // Session expired, clear it
        clearAuth();
        return false;
    }
    
    return true;
}

/**
 * Set the authentication status with expiration time
 * @param {boolean} status - Authentication status
 */
export function setAuthenticated(status) {
    if (status) {
        // Set expiration to 24 hours from now
        const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000);
        
        const authData = {
            authenticated: true,
            expiresAt: expiresAt
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
    } else {
        clearAuth();
    }
}

/**
 * Get authentication data from localStorage
 * @returns {Object|null} - Authentication data or null
 */
function getAuthData() {
    try {
        const authDataStr = localStorage.getItem('authData');
        if (!authDataStr) {
            return null;
        }
        
        return JSON.parse(authDataStr);
    } catch (error) {
        console.error('Error parsing auth data:', error);
        return null;
    }
}

/**
 * Clear authentication data
 */
function clearAuth() {
    localStorage.removeItem('authData');
}

/**
 * Log out the user
 */
export function logout() {
    clearAuth();
}