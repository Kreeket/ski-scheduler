// exercise-manager.js - Component for managing exercises
import * as exercisesApi from '../api/exercises.js';
import * as ui from '../ui/common.js';

// Local cache of exercises
let exercises = [];

/**
 * Load exercises from the server
 * @returns {Promise<Array>} - Array of exercises
 */
export async function loadExercises() {
    ui.showLoadingIndicator();
    try {
        console.log('Loading exercises...');
        exercises = await exercisesApi.getExercises();
        console.log(`Loaded ${exercises.length} exercises`);
        return exercises;
    } catch (error) {
        console.error('Error loading exercises:', error);
        ui.showAlert('Failed to load exercises. Please try again later.', 'error');
        return [];
    } finally {
        ui.hideLoadingIndicator();
    }
}

/**
 * Find an exercise by name
 * @param {string} name - Exercise name
 * @returns {Object|null} - Exercise object or null if not found
 */
export function getExerciseByName(name) {
    return exercises.find(ex => ex.name === name) || null;
}

/**
 * Save a new exercise
 */
export async function saveNewExercise() {
    const nameInput = document.getElementById('newExerciseName');
    const descInput = document.getElementById('newExerciseDescription');
    
    if (!nameInput || !descInput) {
        console.error('Exercise form inputs not found');
        return;
    }
    
    const name = nameInput.value.trim();
    let description = descInput.value.trim();

    if (!name) {
        ui.showAlert('Please enter an exercise name.', 'error');
        return;
    }

    // Format description
    description = formatDescription(description);
    const newExercise = { name, description };

    try {
        ui.setButtonLoading('saveNewExerciseButton', true);
        const createdExercise = await exercisesApi.createExercise(newExercise);
        
        // Update local cache
        exercises.push(createdExercise);
        
        // Clear form
        nameInput.value = '';
        descInput.value = '';
        
        // Close modal and show success message
        const modal = document.getElementById('exercisesModal');
        if (modal) {
            ui.hideElement(modal);
        }
        ui.showAlert('Exercise created successfully!', 'success');
    } catch (error) {
        console.error('Error creating exercise:', error);
        ui.showAlert('Failed to create exercise. Please try again.', 'error');
    } finally {
        ui.setButtonLoading('saveNewExerciseButton', false);
    }
}

/**
 * Format description text
 * @param {string} description - Raw description text
 * @returns {string} - Formatted description
 */
function formatDescription(description) {
    // Replace multiple newlines with double newlines
    description = description.replace(/\n\s*\n/g, '\n\n');
    // Normalize consecutive newlines to a maximum of two
    description = description.replace(/\n+/g, '\n\n');
    return description;
}

/**
 * Show the exercises modal
 */
export function showExercisesModal() {
    console.log('Showing exercises modal');
    // Ensure exercises are loaded
    if (exercises.length === 0) {
        loadExercises().then(() => {
            renderExerciseList();
        });
    } else {
        renderExerciseList();
    }
    
    const modal = document.getElementById('exercisesModal');
    if (modal) {
        ui.showElement(modal);
        
        // Set up search functionality
        const searchInput = document.getElementById('exerciseSearch');
        if (searchInput) {
            searchInput.addEventListener('input', renderExerciseList);
            // Clear any previous search
            searchInput.value = '';
        }
    } else {
        console.error('Exercises modal not found in the DOM');
    }
}

/**
 * Render the list of exercises
 */
export function renderExerciseList() {
    const listContainer = document.getElementById('exerciseList');
    if (!listContainer) {
        console.error('Exercise list container not found');
        return;
    }
    
    listContainer.innerHTML = '';

    // Get search term if any
    const searchInput = document.getElementById('exerciseSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    console.log(`Rendering exercise list with ${exercises.length} exercises`);
    
    // Filter and render exercises
    if (exercises.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-4">No exercises found. Add your first exercise above.</div>';
        return;
    }
    
    let matchFound = false;
    
    // Filter and render exercises
    exercises.forEach(exercise => {
        // Skip if doesn't match search
        if (searchTerm && 
            !exercise.name.toLowerCase().includes(searchTerm) && 
            !exercise.description.toLowerCase().includes(searchTerm)) {
            return;
        }
        
        matchFound = true;

        // Create exercise item
        const details = document.createElement('details');
        details.classList.add('exercise-item', 'mb-2', 'border', 'rounded', 'p-2');

        // Create summary (header)
        const summary = document.createElement('summary');
        summary.classList.add('cursor-pointer', 'font-bold');
        summary.textContent = exercise.name;
        details.appendChild(summary);

        // Create content
        const content = document.createElement('div');
        content.classList.add('mt-2');
        content.innerHTML = `<p class="whitespace-pre-wrap">${exercise.description}</p>`;

        // Add edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.type = 'button';
        editButton.className = 'btn-base btn-primary mr-2';
        editButton.addEventListener('click', () => {
            editExercise(exercise);
        });
        content.appendChild(editButton);

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.className = 'btn-base btn-danger';
        deleteButton.id = `deleteExerciseBtn-${exercise.id}`;
        deleteButton.addEventListener('click', () => {
            handleDeleteExercise(exercise);
        });
        content.appendChild(deleteButton);

        details.appendChild(content);
        listContainer.appendChild(details);
    });
    
    // Show message if no matches found
    if (!matchFound && searchTerm) {
        listContainer.innerHTML = `<div class="text-center text-gray-500 py-4">No exercises found matching "${searchTerm}"</div>`;
    }
}

/**
 * Edit an exercise
 * @param {Object} exercise - Exercise to edit
 */
function editExercise(exercise) {
    // Create edit modal if it doesn't exist
    const editModal = document.getElementById('editExerciseModal');
    if (!editModal) {
        createEditExerciseModal();
    }

    // Populate form
    document.getElementById('editExerciseName').value = exercise.name;
    document.getElementById('editExerciseDescription').value = exercise.description;

    // Set up save handler
    document.getElementById('saveEditedExerciseButton').onclick = async () => {
        const newName = document.getElementById('editExerciseName').value.trim();
        let newDescription = document.getElementById('editExerciseDescription').value.trim();

        if (!newName) {
            ui.showAlert('Please enter an exercise name.', 'error');
            return;
        }
        
        // Format description
        newDescription = formatDescription(newDescription);
        const updatedExercise = { name: newName, description: newDescription };
        
        try {
            ui.setButtonLoading('saveEditedExerciseButton', true);
            await exercisesApi.updateExercise(exercise.id, updatedExercise);
            
            // Update local cache
            const index = exercises.findIndex(ex => ex.id === exercise.id);
            if (index !== -1) {
                exercises[index] = { ...exercises[index], ...updatedExercise };
                renderExerciseList();
            }
            
            ui.hideElement(document.getElementById('editExerciseModal'));
            ui.showAlert("Exercise updated successfully!", 'success');
        } catch (error) {
            console.error("Error updating exercise:", error);
            ui.showAlert("Failed to update exercise. Please try again.", 'error');
        } finally {
            ui.setButtonLoading('saveEditedExerciseButton', false);
        }
    };

    // Show modal
    ui.showElement(document.getElementById('editExerciseModal'));

    // Set up close handler
    const closeButton = document.querySelector('#editExerciseModal .modal-close-btn');
    if (closeButton) {
        closeButton.onclick = () => ui.hideElement(document.getElementById('editExerciseModal'));
    }
}