// scripts.js (COMPLETE REVISED)
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const loginForm = document.getElementById('login-form');
    const appContainer = document.getElementById('app-container');
    const groupButtons = document.querySelectorAll('.group-button');
    const groupTitle = document.getElementById('group-title');
    const datePicker = document.getElementById('date-picker');
    const scheduleDisplay = document.getElementById('schedule-display');
    const exerciseModal = document.getElementById('exercise-modal');
    const exerciseSelect = document.getElementById('exercise-select');
    const saveExerciseButton = document.getElementById('save-exercise');
    const cancelExerciseButton = document.getElementById('cancel-exercise');
    const addExerciseButton = document.getElementById('add-exercise-button');
    const addExerciseModal = document.getElementById('add-exercise-modal');
    const newExerciseNameInput = document.getElementById('new-exercise-name');
    const saveNewExerciseButton = document.getElementById('save-new-exercise');
    const cancelNewExerciseButton = document.getElementById('cancel-new-exercise');
    const deleteExerciseButton = document.getElementById('delete-exercise-button')

    // --- State Variables ---
    let currentField = null;
    let exercises = [];
    let schedules = {};
    let users = [];

    // --- API Base URL ---
    const API_BASE = 'http://localhost:3000/api'; // Base URL for your API

    // --- Helper Function: Show/Hide Elements ---
    function showElement(element) {
        element.classList.remove('hidden');
    }

    function hideElement(element) {
        element.classList.add('hidden');
    }

    // --- Data Loading Functions ---
    async function loadData() {
        try {
            const usersResponse = await fetch(`${API_BASE}/users`);
            users = await usersResponse.json();
            console.log("Users loaded:", users);

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading user data. Please try again later.'); // Basic error handling
        }
    }

    async function loadExercises() {
        try {
            const response = await fetch(`${API_BASE}/exercises`);
            exercises = await response.json();
            updateExerciseDropdown(); // Update dropdown whenever exercises are loaded
        } catch (error) {
            console.error('Error loading exercises:', error);
            alert('Error loading exercises. Please try again later.');
        }
    }
    async function loadSchedule(groupId, date) {
        try {
            const response = await fetch(`${API_BASE}/schedules/${date}/${groupId}`);
            if (response.ok) {
                const scheduleData = await response.json();
                // Update the UI with the schedule data
                document.getElementById('warm-up').textContent = scheduleData['warm-up'] || '';
                document.getElementById('exercise-1').textContent = scheduleData['exercise-1'] || '';
                document.getElementById('exercise-2').textContent = scheduleData['exercise-2'] || '';
                document.getElementById('exercise-3').textContent = scheduleData['exercise-3'] || '';
                document.getElementById('main-activity').textContent = scheduleData['main-activity'] || '';
                document.getElementById('cool-down').textContent = scheduleData['cool-down'] || '';
                document.getElementById('leaders').textContent = (scheduleData.leaders || []).join(', '); // Display as comma-separated string

            } else if (response.status === 404) {
                // Handle 404 (schedule not found) - clear the fields
                document.getElementById('warm-up').textContent = '';
                document.getElementById('exercise-1').textContent = '';
                document.getElementById('exercise-2').textContent = '';
                document.getElementById('exercise-3').textContent = '';
                document.getElementById('main-activity').textContent = '';
                document.getElementById('cool-down').textContent = '';
                document.getElementById('leaders').textContent = '';
            }
            else {
                console.error('Error loading schedule:', response.status);
                alert('Error loading schedule. Please try again later.');
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
            alert('Error loading schedule. Please try again later.');
        }
    }

        // --- Save Schedule (Update) ---
        async function saveSchedule(date, group, scheduleData) {
            try {
                // Ensure leaders is an array of strings
                if (typeof scheduleData.leaders === 'string') {
                    scheduleData.leaders = scheduleData.leaders.split(',').map(s => s.trim()).filter(s => s !== "");
                }
                console.log("saveSchedule - Before fetch:", date, group, scheduleData);
                const response = await fetch(`${API_BASE}/schedules/${date}/${group}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(scheduleData),
                });
                console.log("saveSchedule - After fetch:", response);
                if (!response.ok) {
                    // Log the full response for debugging
                    console.error("saveSchedule - Response not OK:", await response.text());

                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error saving schedule:', error);
                alert('Error saving schedule. Please try again later.'); // Basic error handling
            }
        }

        // --- Delete Schedule ---
        async function deleteSchedule(date, group) {
            try {
                const response = await fetch(`${API_BASE}/schedules/${date}/${group}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // Optionally, update UI to reflect deletion (e.g., clear the schedule display)
                loadSchedule(group, date);

            } catch (error) {
                console.error('Error deleting schedule:', error);
                alert('Error deleting schedule. Please try again later.');
            }
        }

        // --- Delete Excercise ---
        async function deleteExercise(exerciseName) {
            try {
                const response = await fetch(`${API_BASE}/exercises/${exerciseName}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    // Remove the exercise from the local 'exercises' array
                    exercises = exercises.filter(ex => ex.name !== exerciseName);
                    updateExerciseDropdown(); // Refresh the dropdown
                } else {
                    console.error('Error deleting exercise:', response.status);
                    alert('Error deleting exercise. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting exercise:', error);
                alert('Error deleting exercise. Please try again.');
            }
        }


    // --- Event Listeners ---
    // Prevent form submissions on the entire document  -- Keep this as a fallback
    document.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('Form submission prevented.');
    });

    // Login
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault(); // PREVENT DEFAULT HERE
        console.log("Login button clicked");
        const username = usernameInput.value;
        const password = passwordInput.value;

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log("Login successful - hiding form");
            hideElement(loginForm);
            showElement(appContainer);
            await loadInitialSchedule();
        } else {
            console.log("Login failed");
            showElement(loginError);
        }
    });

    // Group Selection (No changes needed)
    groupButtons.forEach(button => {
        button.addEventListener('click', () => {
            groupButtons.forEach(b => b.classList.remove('active', 'bg-blue-700', 'text-white'));
            button.classList.add('active', 'bg-blue-700', 'text-white');
            const groupId = button.id.replace('group-', '');
            groupTitle.textContent = `Group ${groupId} Schedule`;
            loadSchedule(groupId, datePicker.value);
        });
    });

    // Date Change (No changes needed)
    datePicker.addEventListener('change', () => {
        const selectedGroup = document.querySelector('.group-button.active')?.id.replace('group-', '');
        if (selectedGroup) {
            loadSchedule(selectedGroup, datePicker.value);
        }
    });

    // Edit and Delete Buttons (Delegated Event Listener) (No changes needed)
    scheduleDisplay.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-button')) {
            currentField = event.target.dataset.field;
            // Pre-populate the exerciseSelect dropdown
            openExerciseModal();
                const currentExercise = document.getElementById(currentField).textContent;
                exerciseSelect.value = currentExercise;
        } else if (event.target.classList.contains('delete-button')) {
            const selectedGroup = document.querySelector('.group-button.active')?.id.replace('group-', '');
            const selectedDate = datePicker.value;
            if (confirm(`Are you sure you want to delete the schedule for ${selectedDate} group ${selectedGroup}?`)) {
                deleteSchedule(selectedDate, selectedGroup);
            }
        } else if (event.target.classList.contains('delete-exercise-button')) {
            const exerciseName = event.target.dataset.exercise;
            if (confirm(`Are you sure you want to delete the exercise "${exerciseName}"?`)) {
                deleteExercise(exerciseName);
            }
        }
    });

    // Save Exercise (from modal)
    saveExerciseButton.addEventListener('click', async (event) => {
        event.preventDefault(); // PREVENT DEFAULT HERE
        console.log("Save Exercise button clicked");
        const selectedExercise = exerciseSelect.value;
        document.getElementById(currentField).textContent = selectedExercise;
        closeExerciseModal();

        const selectedGroup = document.querySelector('.group-button.active')?.id.replace('group-', '');
        const selectedDate = datePicker.value;

        // Prepare the schedule data to be saved
        const scheduleData = {
            'warm-up': document.getElementById('warm-up').textContent,
            'exercise-1': document.getElementById('exercise-1').textContent,
            'exercise-2': document.getElementById('exercise-2').textContent,
            'exercise-3': document.getElementById('exercise-3').textContent,
            'main-activity': document.getElementById('main-activity').textContent,
            'cool-down': document.getElementById('cool-down').textContent,
            'leaders': document.getElementById('leaders').textContent, // This will be processed into an array
        };
        console.log("Saving schedule data:", scheduleData);
        await saveSchedule(selectedDate, selectedGroup, scheduleData); // Await saveSchedule
    });

    // Cancel Exercise (from modal) (No changes needed)
    cancelExerciseButton.addEventListener('click', (event) => {
        closeExerciseModal();
    });

    // Add Exercise Button (Open Modal) (No changes needed)
    addExerciseButton.addEventListener('click', (event) => {
        showElement(addExerciseModal);
    });

// Save New Exercise
    saveNewExerciseButton.addEventListener('click', async (event) => {
        event.preventDefault(); // PREVENT DEFAULT HERE
        console.log("Save New Exercise button clicked");
        const newExerciseName = newExerciseNameInput.value.trim();

        if (newExerciseName) {
            try {
                const response = await fetch(`${API_BASE}/exercises`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newExerciseName }),
                });

                if (response.ok) {
                    const newExercise = await response.json(); // Get the new exercise (with ID)
                    exercises.push(newExercise);
                    newExerciseNameInput.value = '';
                    hideElement(addExerciseModal);
                    updateExerciseDropdown();
                } else {
                    console.error('Error saving exercise:', response.status);
                    alert('Error saving exercise. Please try again.');
                }
            } catch (error) {
                console.error('Error saving exercise:', error);
                alert('Error saving exercise. Please try again.');
            }
        } else {
            alert("Please enter an exercise name.");
        }
    });

    // Cancel New Exercise (No changes needed)
    cancelNewExerciseButton.addEventListener('click', (event) => {
        newExerciseNameInput.value = '';
        hideElement(addExerciseModal);
    });

    // --- Modal Functions --- (No changes needed)

    function openExerciseModal() {
        updateExerciseDropdown();
        showElement(exerciseModal);
    }

    function closeExerciseModal() {
        hideElement(exerciseModal);
    }

    function updateExerciseDropdown() {
        exerciseSelect.innerHTML = '';
        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.name;
            option.textContent = exercise.name;
            exerciseSelect.appendChild(option);
        });
    }
    async function loadSchedules() {
        try {
            const response = await fetch(`${API_BASE}/schedules`);
            schedules = await response.json();

            // Initialize with an empty object if schedules is null/undefined
            if (!schedules) {
                schedules = {};
            }

        } catch (error) {
            console.error('Error loading schedules:', error);
            alert('Error loading schedules. Please try again later.'); // Basic error handling
        }
    }
    // --- Initial Data Load and UI Setup ---

    async function loadInitialSchedule() {
        await loadData();
        await loadExercises();
        await loadSchedules();
        document.getElementById('group-1').click();
        datePicker.value = new Date().toISOString().split('T')[0];
        loadSchedule('1', datePicker.value);
    }

    loadInitialSchedule();

});