// frontend/modules/auth.js

// VERY BASIC authentication (for demonstration only - NOT SECURE)
export function authenticateUser(users, username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    return user; // Returns the user object if found, otherwise undefined
}