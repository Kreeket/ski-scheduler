// frontend/modules/exercises.js

import * as api from './api.js'; // Import everything from api.js
import { showElement, hideElement } from './ui.js'; // Import UI helpers


// --- Data Variables ---
// Keep exercises data *local* to this module.
let exercises = [];

// --- Functions ---

// Load exercises (and update the UI)
export async function loadExercises() {
    try {
        exercises = await api.getExercises(); // Use the api module
        renderExerciseList(); // Update the displayed list
        updateExerciseDropdown(); //Keep the dropdown updated.
    } catch (error) {
        // Error handling is already done in api.request, but you
        // *could* add module-specific handling here if needed.
        console.error("Error in loadExercises:", error);
    }
}

export async function addExercise(exerciseData) {
    try {
        const newExercise = await api.createExercise(exerciseData);
        exercises.push(newExercise);
        renderExerciseList();
        updateExerciseDropdown();
        return newExercise; // Return the newly created exercise
    } catch (error) {
        console.error("Error in addExercise:", error);
        throw error; // Re-throw for handling in calling function.
    }
}

export async function editExercise(exerciseName, exerciseData) {
    try {
        const updatedExercise = await api.updateExercise(exerciseName, exerciseData);
        const index = exercises.findIndex(ex => ex.name === exerciseName);
        if (index !== -1) {
            exercises[index] = updatedExercise; // Update local data
        }
        renderExerciseList();
        updateExerciseDropdown();
        return updatedExercise;
    } catch (error) {
        console.error("Error in editExercise:", error);
        throw error;
    }
}

export async function deleteExercise(exerciseName) {
    try {
        await api.deleteExercise(exerciseName); // No response expected
        exercises = exercises.filter(ex => ex.name !== exerciseName);
        renderExerciseList();
        updateExerciseDropdown();
    } catch (error) {
        console.error("Error in deleteExercise:", error);
        throw error;
    }
}
// Function to get the exercise list (for other modules that might need it)
export function getExercises() {
    return exercises;
}

// --- UI Update Functions ---
// (These functions *stay* in this module, as they are specific to exercises)

export function updateExerciseDropdown() {
    const exerciseSelect = document.getElementById('exercise-select');
     if (!exerciseSelect) { // Check if element exists
      return;
     }
    exerciseSelect.innerHTML = ''; // Clear existing options
    exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.name;
        option.textContent = exercise.name;
        exerciseSelect.appendChild(option);
    });
}

export function renderExerciseList() {
    const exerciseListContainer = document.getElementById('exercise-list');
    if (!exerciseListContainer) {
        console.error("Could not find element with ID 'exercise-list'");
        return; // Exit if container doesn't exist
    }

    exerciseListContainer.innerHTML = ''; // Clear existing list

    exercises.forEach(exercise => {
        const listItem = document.createElement('li');
        listItem.className = 'flex items-center justify-between py-1 border-b'; // Tailwind for styling
        listItem.textContent = exercise.name;

        // ADDED: Display the description
        const description = document.createElement('p');
        description.className = 'text-gray-600 text-sm italic'; // Tailwind classes
        description.textContent = exercise.description || 'No description provided.'; // Handle missing descriptions
        listItem.appendChild(description);


        const buttonGroup = document.createElement('div'); // Container for buttons

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'edit-exercise-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2';
        editButton.dataset.exercise = exercise.name; // Store the exercise name
        editButton.addEventListener('click', () => {
          // Set modal title to "Edit Exercise"
          document.getElementById('modal-title').textContent = 'Edit Exercise';
          document.getElementById('new-exercise-name').value = exercise.name;
          document.getElementById('new-exercise-description').value = exercise.description; //Populate the description
          document.getElementById('edit-exercise-id').value = exercise.name; // Set hidden input
          showElement(document.getElementById('add-exercise-modal')); // Show modal
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-exercise-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline';
        deleteButton.dataset.exercise = exercise.name;  // Store exercise name

        deleteButton.addEventListener('click', (event) => {
          const exerciseName = event.target.dataset.exercise;
          if (confirm(`Are you sure you want to delete the exercise "${exerciseName}"?`)) {
            deleteExercise(exerciseName);
          }
        });

        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);
        listItem.appendChild(buttonGroup);
        exerciseListContainer.appendChild(listItem);
    });
}