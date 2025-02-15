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
// MODIFIED functions: now include group in the URL
export async function getSchedule(group, yearWeek) {
    const response = await fetch(`${API_BASE_URL}/schedules/${group}/${yearWeek}`);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Failed to fetch schedule: ${response.status}`);
    }
    return response.json();
}

export async function updateSchedule(group, yearWeek, scheduleData) {
    const response = await fetch(`${API_BASE_URL}/schedules/${group}/${yearWeek}`, {
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

export async function deleteSchedule(group, yearWeek) {
    const response = await fetch(`${API_BASE_URL}/schedules/${group}/${yearWeek}`, {
        method: 'DELETE',
    });
     if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
    }
    return response.json();
}
//get all schedules
//Not used at the moment
export async function getSchedules() {
    const response = await fetch(`${API_BASE_URL}/schedules`);
    if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
    }
    return response.json();
}