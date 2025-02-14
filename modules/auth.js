import * as api from './api.js'; // We'll use the api module for the request

export async function authenticateUser(username, password) {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }), // Send only the password
        });

        if (!response.ok) {
          const errorData = await response.json(); //get the error
          throw new Error(errorData.message || 'Login failed'); //show it
        }

        const data = await response.json();
        return data.success; // Return true or false based on the server's response

    } catch (error) {
        console.error("Authentication error:", error);
        return false;
    }
}