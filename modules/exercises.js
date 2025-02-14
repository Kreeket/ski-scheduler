import * as api from './api.js';
import * as ui from './ui.js';

let exercises = []; //Local cache

export async function loadExercises() {
  ui.showLoadingIndicator(); // Add this line
  try {
    exercises = await api.getExercises();
    populateExerciseDropdowns()

  } catch (error) {
    console.error('Error loading exercises:', error);
    alert('Failed to load exercises.');
  } finally {
    ui.hideLoadingIndicator(); // Add this line, inside a finally block
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
// MODIFIED function
export function renderExerciseList() {
    const listContainer = document.getElementById('exerciseList');
    listContainer.innerHTML = ''; // Clear previous list

    const searchTerm = document.getElementById('exerciseSearch')?.value.toLowerCase() || ''; // Get search term, handle null

    exercises.forEach(exercise => {
        // Filter exercises based on search term
        if (searchTerm && !exercise.name.toLowerCase().includes(searchTerm) && !exercise.description.toLowerCase().includes(searchTerm)) {
            return; // Skip this exercise if it doesn't match
        }

        const listItem = document.createElement('div');
        listItem.classList.add('exercise-item', 'mb-2', 'border', 'rounded', 'p-2');

        const heading = document.createElement('div');
        heading.classList.add('cursor-pointer', 'font-bold', 'flex', 'justify-between', 'items-center'); // Make it clickable
        heading.textContent = exercise.name;
        listItem.appendChild(heading);

        // Add a "+" or "-" icon
        const toggleIcon = document.createElement('span');
        toggleIcon.textContent = '+';
        toggleIcon.classList.add('toggle-icon');
        heading.appendChild(toggleIcon);



        const content = document.createElement('div');
        content.classList.add('exercise-content', 'hidden', 'mt-2'); // Initially hidden
        content.innerHTML = `<p class="whitespace-pre-wrap">${exercise.description}</p>`; // Use innerHTML to render paragraphs

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.type = 'button';
        editButton.className = 'btn-base btn-primary mr-2'; // Use consistent styles
        editButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the accordion from toggling
            editExercise(exercise);
        });
        content.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.className = 'btn-base btn-danger'; // Use consistent styles
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the accordion from toggling
            deleteExercise(exercise);
        });
        content.appendChild(deleteButton);
        listItem.appendChild(content);

        // Toggle visibility on heading click
        heading.addEventListener('click', () => {
            content.classList.toggle('hidden');
            toggleIcon.textContent = content.classList.contains('hidden') ? '+' : '-'; // Update icon
        });

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