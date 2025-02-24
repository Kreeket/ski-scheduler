// api.js

// Function to get the API base URL
export function getApiBaseUrl() {
    //return 'http://localhost:3000/api'; // DEVELOPMENT
    return 'https://ski-scheduler.onrender.com/api'; // PRODUCTION - Use your Render URL
}

// --- Exercises ---

export async function getExercises() {
    const url = `${getApiBaseUrl()}/exercises`;
    console.log("getExercises URL:", url); // DEBUGGING
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch exercises: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.json();
}

export async function createExercise(exerciseData) {
    const url = `${getApiBaseUrl()}/exercises`;
    console.log("createExercise URL:", url); // DEBUGGING
    const response = await fetch(url, {
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
  const url = `${getApiBaseUrl()}/exercises/${id}`;
  console.log("updateExercise URL:", url); // DEBUGGING
  const response = await fetch(url, {
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
    const url = `${getApiBaseUrl()}/exercises/${id}`;
    console.log("deleteExercise URL:", url); // DEBUGGING

    const response = await fetch(url, {
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
    const url = `${getApiBaseUrl()}/schedules/${group}/${yearWeek}`;
    console.log("getSchedule URL:", url); // DEBUGGING
    const response = await fetch(url);
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
    const url = `${getApiBaseUrl()}/schedules/${group}/${yearWeek}`;
    console.log("updateSchedule URL:", url); // DEBUGGING
    const response = await fetch(url, {
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
    const url = `${getApiBaseUrl()}/schedules/${group}/${yearWeek}`;
    console.log("deleteSchedule URL:", url); // DEBUGGING
    const response = await fetch(url, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete schedule: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.ok;
}

export async function getSchedules() {
    const url = `${getApiBaseUrl()}/schedules`;
    console.log("getSchedules URL:", url); // DEBUGGING
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
        throw new Error(`Failed to fetch schedules: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    return response.json();
}