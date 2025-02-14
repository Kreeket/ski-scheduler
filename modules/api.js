const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual API URL

// --- User Authentication ---


// --- Exercises ---

export async function getExercises() {
    const response = await fetch(`${API_BASE_URL}/exercises`);
    if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.status}`);
    }
    return response.json();
}

export async function createExercise(exerciseData) {
    const response = await fetch(`${API_BASE_URL}/exercises`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
    });
    if (!response.ok) {
        throw new Error(`Failed to create exercise: ${response.status}`);
    }
    return response.json();
}

export async function updateExercise(id, exerciseData) {
  const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exerciseData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update exercise: ${response.status}`);
  }
  return response.json();
}

export async function deleteExercise(id) {
    const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete exercise: ${response.status}`);
    }
    return response.json(); // Or just return response.ok if you don't need the data
}

// --- Schedules ---

export async function getSchedule(weekNumber) {
    const response = await fetch(`${API_BASE_URL}/schedules/${weekNumber}`);
     if (!response.ok) {
       if (response.status === 404) {
         return null; // Return null for 404 (schedule not found)
       }
        throw new Error(`Failed to fetch schedule: ${response.status}`);
    }
    return response.json();
}

export async function updateSchedule(weekNumber, scheduleData) {
    const response = await fetch(`${API_BASE_URL}/schedules/${weekNumber}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
        throw new Error(`Failed to update schedule: ${response.status}`);
    }
    return response.json();
}

export async function deleteSchedule(weekNumber) {
    const response = await fetch(`${API_BASE_URL}/schedules/${weekNumber}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.status}`);
    }
      return response.json(); // Or just return response.ok if you don't need the data
}

export async function getSchedules() {
    const response = await fetch(`${API_BASE_URL}/schedules`);
    if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
    }
    return response.json();
}