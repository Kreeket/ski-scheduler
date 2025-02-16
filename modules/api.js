const API_BASE_URL = 'http://localhost:3000/api'; // Use environment variable in production

// --- Exercises ---

export async function getExercises() {
    const response = await fetch(`${API_BASE_URL}/exercises`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch exercises: ${response.status} - ${errorData.message || 'Unknown error'}`);
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
        const errorData = await response.json();
        throw new Error(`Failed to create exercise: ${response.status} - ${errorData.message || 'Unknown error'}`);
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
      const errorData = await response.json();
    throw new Error(`Failed to update exercise: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }
  return response.json();
}

export async function deleteExercise(id) {
    const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete exercise: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.ok;
}

// --- Schedules ---
export async function getSchedule(group, yearWeek) {
    const response = await fetch(`${API_BASE_URL}/schedules/${group}/${yearWeek}`);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        const errorData = await response.json();
        throw new Error(`Failed to fetch schedule: ${response.status} - ${errorData.message || 'Unknown error'}`);
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
        const errorData = await response.json();
        throw new Error(`Failed to update schedule: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.json();
}

export async function deleteSchedule(group, yearWeek) {
    const response = await fetch(`${API_BASE_URL}/schedules/${group}/${yearWeek}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete schedule: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.ok;
}

export async function getSchedules() {
    const response = await fetch(`${API_BASE_URL}/schedules`);
    if (!response.ok) {
      const errorData = await response.json();
        throw new Error(`Failed to fetch schedules: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.json();
}