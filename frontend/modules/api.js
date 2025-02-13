// frontend/modules/api.js

const API_BASE = 'http://localhost:3000/api';

async function request(url, method = 'GET', data = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        const options = {
            method,
            headers,
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text(); // Get error details
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        // Handle 204 No Content responses (e.g., from DELETE)
        if (response.status === 204) {
            return; // Return nothing for 204
        }

        return await response.json(); // Parse JSON for other successful responses

    } catch (error) {
        console.error('API Request Error:', error);
        alert('An error occurred. Please try again.'); // User-friendly error
        throw error; // Re-throw to allow calling functions to handle it
    }
}

// --- Exercise API Calls ---
export async function getExercises() {
    return await request(`${API_BASE}/exercises`);
}

export async function getExercise(exerciseName) {
  return await request(`${API_BASE}/exercises/${exerciseName}`);
}

export async function createExercise(exerciseData) {
    return await request(`${API_BASE}/exercises`, 'POST', exerciseData);
}

export async function updateExercise(exerciseName, exerciseData) {
    return await request(`${API_BASE}/exercises/${exerciseName}`, 'PUT', exerciseData);
}

export async function deleteExercise(exerciseName) {
    return await request(`${API_BASE}/exercises/${exerciseName}`, 'DELETE');
}

// --- Schedule API Calls ---
export async function getSchedules(){
    return await request(`${API_BASE}/schedules`);
}

export async function getSchedule(date, group) {
    return await request(`${API_BASE}/schedules/${date}/${group}`);
}

export async function updateSchedule(date, group, scheduleData) {
    return await request(`${API_BASE}/schedules/${date}/${group}`, 'PUT', scheduleData);
}

export async function deleteSchedule(date, group) {
    return await request(`${API_BASE}/schedules/${date}/${group}`, 'DELETE');
}

// --- User API Calls ---
export async function getUsers() {
  return await request(`${API_BASE}/users`);
}