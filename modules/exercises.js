import * as api from './api.js';
import * as ui from './ui.js';

let exercises = []; //Local cache

export async function loadExercises() {
  try {
    exercises = await api.getExercises();
    populateExerciseDropdowns()

  } catch (error) {
    console.error('Error loading exercises:', error);
    alert('Failed to load exercises.');
  }
}

//Call this function every time the schedule is switched or loaded.
export function populateExerciseDropdowns() {
    const dropdowns = document.querySelectorAll('#scheduleContainer select');
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value; // Save the current value
        dropdown.innerHTML = '<option value="">Select an Exercise</option>'; // Clear existing options

        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.name;
            option.textContent = exercise.name;
            // NO click listener on the option itself anymore
            dropdown.appendChild(option);
        });
        dropdown.value = currentValue; // Restore selected value
    });
    // Add click listeners to the *buttons* (outside the dropdown loop)
    addDetailsButtonListeners();
}

export async function saveNewExercise() {
    const name = document.getElementById('newExerciseName').value.trim();
    let description = document.getElementById('newExerciseDescription').value.trim();

    if (!name) {
        alert('Please enter an exercise name.');
        return;
    }

    // Add line breaks before saving (basic paragraph formatting)
    description = description.replace(/\n\s*\n/g, '\n\n'); // Ensure double line breaks between paragraphs
    description = description.replace(/\n+/g, '\n\n');     //Multiple to double
    const newExercise = { name, description };

    try {
        const createdExercise = await api.createExercise(newExercise);
        exercises.push(createdExercise);
        populateExerciseDropdowns();
        renderExerciseList();
        // Clear input fields and close modal
        document.getElementById('newExerciseName').value = '';
        document.getElementById('newExerciseDescription').value = '';
        ui.hideElement(document.getElementById('exercisesModal'));
        alert('Exercise created successfully!');
    } catch (error) {
        console.error('Error creating exercise:', error);
        alert('Failed to create exercise.');
    }
}

export function showExercisesModal(){
        renderExerciseList();
        ui.showElement(document.getElementById('exercisesModal'));
}

export function renderExerciseList() {
    const listContainer = document.getElementById('exerciseList');
    listContainer.innerHTML = '';

    exercises.forEach(exercise => {
        const listItem = document.createElement('div');
        listItem.className = 'exercise-item mb-2 p-2 border rounded';

        const textSpan = document.createElement('span');
        textSpan.textContent = `${exercise.name} - ${exercise.description}`;
        listItem.appendChild(textSpan);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.type = 'button';
        editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2';
        editButton.addEventListener('click', () => editExercise(exercise));
        listItem.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2';
        deleteButton.addEventListener('click', () => deleteExercise(exercise));
        listItem.appendChild(deleteButton);

        listContainer.appendChild(listItem);
    });
}

function editExercise(exercise) {
    let newName = prompt("Enter new exercise name (leave blank to keep current):", exercise.name);
    let newDescription = prompt("Enter new exercise description (leave blank to keep current):", exercise.description);

    if ((newName !== null && newName.trim() !== exercise.name) || (newDescription !== null && newDescription.trim() !== exercise.description)) {
        newName = newName.trim() === "" ? exercise.name : newName.trim();
        newDescription = newDescription.trim() === "" ? exercise.description : newDescription.trim();
         // Format the description
        newDescription = newDescription.replace(/\n\s*\n/g, '\n\n');
        newDescription = newDescription.replace(/\n+/g, '\n\n');


        const updatedExercise = { name: newName, description: newDescription };
        updateExercise(exercise, updatedExercise);
    } else {
        alert("No changes made.");
    }
}

async function updateExercise(exercise, updatedExercise) {
    try {
        const result = await api.updateExercise(exercise.name, updatedExercise);
        const index = exercises.findIndex(ex => ex.name === exercise.name);
        if (index !== -1) {
            exercises[index] = result;
            populateExerciseDropdowns();
            renderExerciseList();
            alert("Exercise updated successfully!");
        }
    } catch (error) {
        console.error("Error updating exercise:", error);
        alert("Failed to update exercise.");
    }
}

async function deleteExercise(exercise) {
    if (confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
        try {
            await api.deleteExercise(exercise.name);
            exercises = exercises.filter(ex => ex.name !== exercise.name);
            populateExerciseDropdowns();
            renderExerciseList();
            alert("Exercise deleted successfully!");
        } catch (error) {
            console.error("Error deleting exercise:", error);
            alert("Failed to delete exercise.");
        }
    }
}

function showExerciseDetails(exercise) {
    document.getElementById('exerciseDetailsName').textContent = exercise.name;
    document.getElementById('exerciseDetailsDescription').textContent = exercise.description;
    ui.showElement(document.getElementById('exerciseDetailsModal'));
}

function addDetailsButtonListeners() {
    const detailsButtons = document.querySelectorAll('.show-details-button');
    detailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectId = button.dataset.selectId; // Get the select ID from data-select-id
            const selectElement = document.getElementById(selectId);
            const selectedExerciseName = selectElement.value;

            if (selectedExerciseName) {
                const exercise = exercises.find(ex => ex.name === selectedExerciseName);
                if (exercise) {
                    showExerciseDetails(exercise);
                }
            }
        });
    });
}