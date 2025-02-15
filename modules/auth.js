// auth.js
import * as api from './api.js'; // Import the api module

export async function authenticateUser(username, password) { // username is unused, but keep for consistency
    try {
        const response = await fetch('http://localhost:3000/api/login', { // Or use api.login() if you create it
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }), // Send only the password
        });

        if (!response.ok) {
            const errorData = await response.json(); // Get error details
            throw new Error(errorData.message || 'Login failed'); // Throw a specific error
        }

        const data = await response.json();
        return data.success; // Return true or false

    } catch (error) {
        console.error("Authentication error:", error); // Log the error
        throw error; // Re-throw the error for the caller to handle
    }
}