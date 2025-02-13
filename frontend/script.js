import * as api from './modules/api.js';
import { authenticateUser } from './modules/auth.js';
import { loadExercises, renderExerciseList, updateExerciseDropdown, addExercise, editExercise, deleteExercise, getExercises } from './modules/exercises.js';
import { loadSchedules, loadSchedule, saveSchedule, deleteSchedule } from './modules/schedules.js';
import { showElement, hideElement } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
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
    const editExerciseIdInput = document.getElementById('edit-exercise-id');
    const newExerciseDescriptionInput = document.getElementById('new-exercise-description');
    const exerciseListContainer = document.getElementById('exercise-list-container');
    const manageExercisesButton = document.getElementById('manage-exercises-button');
	  const exerciseDescriptionDisplay = document.getElementById('exercise-description-display'); // Description display

     // --- State Variables --- No longer needed at the top level
    // let currentField = null;
    // let exercises = [];
    // let schedules = {};
    // let users = [];
    let currentField = null; // ADDED BACK

    // --- Event Listeners ---

    // Prevent form submissions (Keep this!)
    document.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('Form submission prevented.');
    });

  // Login Button
  loginButton.addEventListener('click', async (event) => {
    console.log("Login button clicked");
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
      const users = await api.getUsers(); // Fetch users from the API
      const user = authenticateUser(users, username, password); // Use auth module

      if (user) {
        console.log("Login successful - hiding form");
        hideElement(loginForm);
        showElement(appContainer);
        await loadInitialData(); // Load initial data (exercises + schedules)
      } else {
        console.log("Login failed");
        showElement(loginError);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. See console for details.");
    }
  });

    // Manage Exercises Button
    manageExercisesButton.addEventListener('click', () => {
        exerciseListContainer.classList.toggle('hidden');
        if (!exerciseListContainer.classList.contains('hidden')) {
            renderExerciseList(); // From exercises.js
        }
    });

 // Group Selection Buttons
    groupButtons.forEach(button => {
    button.addEventListener('click', async () => {
        groupButtons.forEach(b => b.classList.remove('active', 'bg-blue-700', 'text-white'));
        button.classList.add('active', 'bg-blue-700', 'text-white');
        const groupId = button.id.replace('group-', '');
        groupTitle.textContent = `Group ${groupId} Schedule`;

        // *** FIX: Check for datePicker.value *before* calling loadSchedule ***
        if (datePicker.value) {
            await loadSchedule(groupId, datePicker.value);
        } else {
            console.warn("No date selected, not loading schedule."); // Helpful message
        }
    });
    });

    // Date Picker Change
    datePicker.addEventListener('change', async () => {
        const selectedGroup = document.querySelector('.group-button.active')?.id.replace('group-', '');
        // *** FIX: Check for both selectedGroup *and* datePicker.value ***
        if (selectedGroup && datePicker.value) {
            await loadSchedule(selectedGroup, datePicker.value);
        } else {
          console.warn("No group or date selected, not loading schedule.");
        }
    });

 // Edit and Delete Buttons (Delegated Event Listener on scheduleDisplay)
    scheduleDisplay.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-button')) {
            currentField = event.target.dataset.field;
            // Pre-populate the exerciseSelect dropdown:
            openExerciseModal();
              const currentExercise = document.getElementById(currentField).textContent;
              exerciseSelect.value = currentExercise;
          // Find and display description, this have to be fired after exerciseSelect.value = currentExercise, or else it cant find the value.
          const selectedExercise = getExercises().find(ex => ex.name === currentExercise);
          if (selectedExercise) {
              exerciseDescriptionDisplay.textContent = selectedExercise.description || 'No description provided.';
          } else {
              exerciseDescriptionDisplay.textContent = ''; // Clear the display if no exercise is selected
          }
        } else if (event.target.classList.contains('delete-button')) {
            const selectedGroup = document.querySelector('.group-button.active')?.id.replace('group-', '');
            const selectedDate = datePicker.value;
            // *** FIX: Check for selectedDate and selectedGroup before confirmation ***
            if (selectedDate && selectedGroup) {
                if (confirm(`Are you sure you want to delete the schedule for ${selectedDate} group ${selectedGroup}?`)) {
                    deleteSchedule(selectedDate, selectedGroup); //Now from schedules.js
                }
            } else {
                alert("Please select both a date and a group before deleting.");
            }
        }
    });

 // Save Exercise (from modal)
    saveExerciseButton.addEventListener('click', async (event) => {
    console.log("Save Exercise button clicked");
    const selectedExercise = exerciseSelect.value;

    // Update the correct schedule field in the UI:
    document.getElementById(currentField).textContent = selectedExercise;
    closeExerciseModal();

    const selectedGroup = document.querySelector('.group-button.active')?.id.replace('group-', '');
    const selectedDate = datePicker.value;

    // *** FIX: Check for selectedDate and selectedGroup *before* saving ***
    if (!selectedDate || !selectedGroup) {
        alert("Please select both a date and a group before saving.");
        return; // Exit if either is missing
    }
    // Prepare the schedule data to be saved:
    const scheduleData = {
        'warm-up': document.getElementById('warm-up').textContent,
        'exercise-1': document.getElementById('exercise-1').textContent,
        'exercise-2': document.getElementById('exercise-2').textContent,
        'exercise-3': document.getElementById('exercise-3').textContent,
        'main-activity': document.getElementById('main-activity').textContent,
        'cool-down': document.getElementById('cool-down').textContent,
        'leaders': document.getElementById('leaders').value, // Get value from input
    };
    console.log("Saving schedule data:", scheduleData);
        await saveSchedule(selectedDate, selectedGroup, scheduleData); // Use schedules module

});

    // Cancel Exercise (from modal)
    cancelExerciseButton.addEventListener('click', () => {
        closeExerciseModal();
    });

    // Add Exercise Button (Open Modal)
    addExerciseButton.addEventListener('click', () => {
        newExerciseNameInput.value = '';
        newExerciseDescriptionInput.value = '';
        editExerciseIdInput.value = '';
        document.getElementById('modal-title').textContent = 'Add New Exercise';
        showElement(addExerciseModal);
    });

    // Save New/Edit Exercise (Modal)
saveNewExerciseButton.addEventListener('click', async (event) => {
    console.log("Save New/Edit Exercise button clicked");
    const exerciseName = newExerciseNameInput.value.trim();
    const exerciseDescription = newExerciseDescriptionInput.value.trim();
    const exerciseId = editExerciseIdInput.value;

    if (!exerciseName) {
        alert("Please enter an exercise name.");
        return;
    }

    try {
        const exerciseData = { name: exerciseName, description: exerciseDescription };
        if (exerciseId) {
            // Update existing
            await editExercise(exerciseId, exerciseData); // Use exercises module
        } else {
            // New exercise
            await addExercise(exerciseData); // Use exercises module
        }

        newExerciseNameInput.value = '';
        newExerciseDescriptionInput.value = '';
        editExerciseIdInput.value = '';
        hideElement(addExerciseModal);
        // renderExerciseList is now called within addExercise/editExercise
    } catch (error) {
        // Error handling is already done in the module functions
    }
});

    // Cancel New Exercise (Modal)
    cancelNewExerciseButton.addEventListener('click', () => {
        newExerciseNameInput.value = '';
        newExerciseDescriptionInput.value = '';
        editExerciseIdInput.value = '';
        hideElement(addExerciseModal);
    });

      // --- Event listener for exercise selection ---
      exerciseSelect.addEventListener('change', () => {
        const selectedExerciseName = exerciseSelect.value;
        const selectedExercise = getExercises().find(ex => ex.name === selectedExerciseName);

        if (selectedExercise) {
            exerciseDescriptionDisplay.textContent = selectedExercise.description || 'No description provided.';
        } else {
            exerciseDescriptionDisplay.textContent = ''; // Clear the display if no exercise is selected
        }
    });

    // --- Modal Functions --- (Delegated to ui.js)
        function openExerciseModal() {
        updateExerciseDropdown(); // Populate the dropdown with exercises, from exercise module
        showElement(exerciseModal); // Show the modal
    }

    function closeExerciseModal() {
        hideElement(exerciseModal); // Hide the modal
    }

    // --- Initial Data Load and UI Setup ---

    async function loadInitialData() {
      await loadData();       // Load users (for login)
      await loadExercises();  // Load exercises
      await loadSchedules();  // Load schedules
      datePicker.value = new Date().toISOString().split('T')[0];  // Set initial date
      document.getElementById('group-1').click();                  // Select Group 1
        // loadSchedule is now triggered by the button click, so we don't call it here
    }
    loadInitialData();

}); // END OF DOMContentLoaded