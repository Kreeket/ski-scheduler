// auth.js
import { getApiBaseUrl } from './api.js'; // Simplified import

export async function authenticateUser(username, password) { // username is unused
    try {
        const url = `${getApiBaseUrl()}/login`;
        console.log("Login URL:", url); // DEBUGGING
        const response = await fetch(url, { // Use the function
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Login endpoint not found (404).');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        return data.success;

    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}