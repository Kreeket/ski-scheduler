// exercises.js
import { getApiBaseUrl } from './api.js'; // Simplified import
import * as ui from './ui.js';

let exercises = []; // Local cache

export async function loadExercises() {
    ui.showLoadingIndicator();
    try {
        exercises = await api.getExercises();
        populateAddExerciseDropdown(); // Populate the "Add Exercise" dropdown

    } catch (error) {
        console.error('Error loading exercises:', error);
        ui.showAlert('Failed to load exercises. Please try again later.', 'error');
    } finally {
        ui.hideLoadingIndicator();
    }
}

export function populateAddExerciseDropdown() {
    const dropdown = document.getElementById('addExerciseSelect');
    if (!dropdown) return; // Important: check if element exists

    dropdown.innerHTML = '<option value="">Select an Exercise</option>'; // Clear

    exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.name; // Use NAME for value (schedule data)
        option.textContent = exercise.name;
        dropdown.appendChild(option);
    });
}

export function getExerciseByName(name) {
    return exercises.find(ex => ex.name === name);
}

export async function saveNewExercise() {
    const name = document.getElementById('newExerciseName').value.trim();
    let description = document.getElementById('newExerciseDescription').value.trim();

    if (!name) {
        ui.showAlert('Please enter an exercise name.', 'error');
        return;
    }

    description = description.replace(/\n\s*\n/g, '\n\n');
    description = description.replace(/\n+/g, '\n\n');
    const newExercise = { name, description };

    try {
        const createdExercise = await api.createExercise(newExercise);
        exercises.push(createdExercise);
        populateAddExerciseDropdown();
        renderExerciseList();
        document.getElementById('newExerciseName').value = ''; // Clear inputs
        document.getElementById('newExerciseDescription').value = '';
        ui.hideElement(document.getElementById('exercisesModal'));
        ui.showAlert('Exercise created successfully!', 'success');
    } catch (error) {
        console.error('Error creating exercise:', error);
        ui.showAlert('Failed to create exercise. Please try again.', 'error');
    }
}

export function showExercisesModal() {
    renderExerciseList();
    ui.showElement(document.getElementById('exercisesModal')); // Show the modal

    // Attach close button handler *after* showing the modal
    const closeButton = document.querySelector('#exercisesModal .modal-close-btn');
    if (closeButton) {
        closeButton.onclick = () => ui.hideElement(document.getElementById('exercisesModal'));
    }
}

export function renderExerciseList() {
    const listContainer = document.getElementById('exerciseList');
    listContainer.innerHTML = '';

    const searchTerm = document.getElementById('exerciseSearch')?.value.toLowerCase() || '';

    exercises.forEach(exercise => {
        if (searchTerm && !exercise.name.toLowerCase().includes(searchTerm) && !exercise.description.toLowerCase().includes(searchTerm)) {
            return;
        }

        const details = document.createElement('details');
        details.classList.add('exercise-item', 'mb-2', 'border', 'rounded', 'p-2');

        const summary = document.createElement('summary');
        summary.classList.add('cursor-pointer', 'font-bold');
        summary.textContent = exercise.name;
        details.appendChild(summary);

        const content = document.createElement('div');
        content.classList.add('mt-2');
        content.innerHTML = `<p class="whitespace-pre-wrap">${exercise.description}</p>`;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.type = 'button';
        editButton.className = 'btn-base btn-primary mr-2';
        editButton.addEventListener('click', () => {
            editExercise(exercise); // Pass the whole exercise object
        });
        content.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.className = 'btn-base btn-danger';
        deleteButton.addEventListener('click', () => {
            deleteExercise(exercise); // Pass the whole exercise object
        });
        content.appendChild(deleteButton);

        details.appendChild(content);
        listContainer.appendChild(details);
    });
}

function editExercise(exercise) {
    const editModal = document.getElementById('editExerciseModal');
    if (!editModal) {
      createEditExerciseModal();
      //This is needed if we create a new modal
      document.getElementById('editExerciseModal').addEventListener('click', handleModalClickOutside);
    }

    // Populate the modal with the exercise data
    document.getElementById('editExerciseName').value = exercise.name;
    document.getElementById('editExerciseDescription').value = exercise.description;

    document.getElementById('saveEditedExerciseButton').onclick = async () => {
        const newName = document.getElementById('editExerciseName').value.trim();
        let newDescription = document.getElementById('editExerciseDescription').value.trim();

          if (!newName) {
            ui.showAlert('Please enter an exercise name.', 'error');
            return;
        }
        newDescription = newDescription.replace(/\n\s*\n/g, '\n\n');
        newDescription = newDescription.replace(/\n+/g, '\n\n');

        const updatedExercise = { name: newName, description: newDescription };
        await api.updateExercise(exercise.id, updatedExercise);
        ui.hideElement(document.getElementById('editExerciseModal'));
    };

    ui.showElement(document.getElementById('editExerciseModal')); // Show the modal

    // Attach close button handler *after* showing the modal
    const closeButton = document.querySelector('#editExerciseModal .modal-close-btn');
    if (closeButton) {
        closeButton.onclick = () => ui.hideElement(document.getElementById('editExerciseModal'));
    }
}

function createEditExerciseModal(){
    const modalHtml = `
        <div id="editExerciseModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden flex items-center justify-center">
            <div class="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
                <button type="button" class="modal-close-btn absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 class="text-lg font-medium mb-4">Edit Exercise</h3>
                <input type="text" id="editExerciseName" placeholder="Exercise Name" class="input-base mb-2 w-full">
                <textarea id="editExerciseDescription" placeholder="Description" class="input-base mb-2 w-full" rows="4"></textarea>
                <button type="button" id="saveEditedExerciseButton" class="btn-base btn-primary w-full">Save Changes</button>
                <button type="button" id="closeEditExerciseModal" class="btn-base btn-secondary w-full mt-2">Close</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('closeEditExerciseModal').addEventListener('click', () => {
          ui.hideElement(document.getElementById('editExerciseModal'));
      });
}

function handleModalClickOutside(event) {
    if (event.target.id === 'editExerciseModal') {
        ui.hideElement(document.getElementById('editExerciseModal'));
    }
}
async function updateExercise(id, updatedExercise) {
    try {
        const result = await api.updateExercise(id, updatedExercise); // Pass ID to API
        // Find and update the exercise in the local array using the ID
        const index = exercises.findIndex(ex => ex.id === id);
        if (index !== -1) {
            exercises[index] = { ...exercises[index], ...result }; // Keep ID, update
            populateAddExerciseDropdown(); // Update "Add Exercise" dropdown
            renderExerciseList();
            ui.showAlert("Exercise updated successfully!", 'success');
        }
    } catch (error) {
        console.error("Error updating exercise:", error);
        ui.showAlert("Failed to update exercise. Please try again.", 'error');
    }
}

async function deleteExercise(exercise) {
    const confirmDelete = await ui.showConfirm(`Are you sure you want to delete "${exercise.name}"?`);
    if (confirmDelete) {
        try {
            await api.deleteExercise(exercise.id); // Pass ID to API
            exercises = exercises.filter(ex => ex.id !== exercise.id); // Filter by ID
            populateAddExerciseDropdown(); // Update "Add Exercise" dropdown
            renderExerciseList();
            ui.showAlert("Exercise deleted successfully!", 'success');
        } catch (error) {
            console.error("Error deleting exercise:", error);
            ui.showAlert("Failed to delete exercise. Please try again.", 'error');
        }
    }
}

export function showExerciseDetails(exercise) {
    if (!exercise) {
        console.error("showExerciseDetails called with null or undefined exercise");
        return;
    }
    document.getElementById('exerciseDetailsName').textContent = exercise.name;
    document.getElementById('exerciseDetailsDescription').innerHTML = `<p class="whitespace-pre-wrap">${exercise.description}</p>`;
     // Show the modal *before* attaching the event listener
    ui.showElement(document.getElementById('exerciseDetailsModal'));

    // Find the close button *within* the modal and attach the event listener
    const closeButton = document.querySelector('#exerciseDetailsModal .modal-close-btn');
    if (closeButton) {
        closeButton.onclick = () => ui.hideElement(document.getElementById('exerciseDetailsModal'));
    }
}