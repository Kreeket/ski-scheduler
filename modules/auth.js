import * as api from './api.js';

export async function authenticateUser(username, password) {
    try {
        const users = await api.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        return !!user; // Returns true if user is found, false otherwise
    } catch (error) {
        console.error("Authentication error:", error);
        return false; // Assume authentication failure on error
    }
}