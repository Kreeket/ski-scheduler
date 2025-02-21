// auth.js
import * as api from './api.js'; // Import the api module

export async function authenticateUser(username, password) { // username is unused, but keep for consistency
    try {
        const response = await fetch(`${api.API_BASE_URL}/login`, { // USE THE API_BASE_URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }), // Send only the password
        });

        if (!response.ok) {
            // IMPORTANT CHANGE: Check for response.status BEFORE trying to parse JSON
            if (response.status === 404) {
                throw new Error('Login endpoint not found (404).'); // More specific error
            }
            const errorData = await response.json(); // Get error details *only* if not a 404
            throw new Error(errorData.message || 'Login failed'); // Throw a specific error
        }

        const data = await response.json();
        return data.success; // Return true or false

    } catch (error) {
        console.error("Authentication error:", error); // Log the error
        throw error; // Re-throw the error for the caller to handle
    }
}