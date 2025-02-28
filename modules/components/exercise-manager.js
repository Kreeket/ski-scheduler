// modules/components/exercise-manager.js - Improved exercise management

import * as exercisesApi from '../api/exercises.js';
import * as ui from '../ui/common.js';
import * as modal from '../ui/modal.js';

// Centralized exercise state
let exercises = [];
let isLoading = false;
let lastError = null;
let searchTerm = '';

/**
 * Initialize the exercise manager
 */
export function init() {
    // Background load exercises for other components
    loadExercises().catch(error => {
        console.warn('Non-critical error pre-loading exercises:', error);
    });
    
    // Register event handler for manage exercises button
    const manageBtn = document.getElementById('manageExercisesBtn');
    if (manageBtn) {
        manageBtn.addEventListener('click', showExerciseManager);
    }
}

/**
 * Ensure exercises are loaded
 * @returns {Promise<Array>} - Array of exercises
 */
export async function ensureExercisesLoaded() {
    if (exercises.length === 0 && !isLoading) {
        return loadExercises();
    }
    return exercises;
}

/**
 * Load exercises from the server
 * @returns {Promise<Array>} - Array of exercises
 */
export async function loadExercises() {
    if (isLoading) {
        return exercises; // Already loading
    }
    
    try {
        isLoading = true;
        ui.showLoadingIndicator();
        
        console.log('Loading exercises...');
        const fetchedExercises = await exercisesApi.getExercises();
        
        // Replace the entire array to ensure reactivity
        exercises = fetchedExercises;
        
        console.log(`Loaded ${exercises.length} exercises`);
        lastError = null;
        return exercises;
    } catch (error) {
        console.error('Error loading exercises:', error);
        lastError = error;
        throw error;
    } finally {
        isLoading = false;
        ui.hideLoadingIndicator();
    }
}

/**
 * Find exercise by ID
 * @param {string} id - Exercise ID
 * @returns {Object|null} - Exercise object or null if not found
 */
export function getExerciseById(id) {
    return exercises.find(ex => ex.id === id) || null;
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
 * Show the exercise manager modal
 */
export function showExerciseManager() {
    // Create content for the modal
    const content = document.createElement('div');
    content.className = 'exercise-manager';
    content.innerHTML = `
        <div class="mb-4">
            <input type="text" id="exerciseSearch" placeholder="Search Exercises..." class="input-base mb-4 w-full">
        </div>
        
        <div class="mb-4">
            <button type="button" id="newExerciseBtn" class="w-full btn-base btn-primary mb-4">+ Add New Exercise</button>
            <div id="exerciseList" class="max-h-96 overflow-y-auto">
                <div class="flex justify-center py-4">
                    <div class="loading-spinner"></div>
                    <span class="ml-2">Loading exercises...</span>
                </div>
            </div>
        </div>
    `;
    
    // Create the modal
    const exerciseModal = modal.createModal('exerciseManagerModal', {
        title: 'Manage Exercises',
        content,
        size: 'large',
        onOpen: async () => {
            try {
                await loadExercises();
                renderExerciseList();
                
                // Add event listener for search
                const searchInput = document.getElementById('exerciseSearch');
                if (searchInput) {
                    searchInput.value = searchTerm;
                    searchInput.addEventListener('input', handleSearchInput);
                    searchInput.focus();
                }
                
                // Add event listener for new exercise button
                const newExerciseBtn = document.getElementById('newExerciseBtn');
                if (newExerciseBtn) {
                    newExerciseBtn.addEventListener('click', showNewExerciseForm);
                }
            } catch (error) {
                renderExerciseListError();
            }
        },
        onClose: () => {
            // Save search term for next time
            const searchInput = document.getElementById('exerciseSearch');
            if (searchInput) {
                searchTerm = searchInput.value;
            }
        }
    });
    
    // Show the modal
    modal.openModal('exerciseManagerModal');
}

/**
 * Handle search input
 * @param {Event} event - Input event
 */
function handleSearchInput(event) {
    searchTerm = event.target.value.toLowerCase();
    renderExerciseList();
}

/**
 * Render the list of exercises with search filtering
 */
function renderExerciseList() {
    const listContainer = document.getElementById('exerciseList');
    if (!listContainer) return;
    
    // Clear existing content
    listContainer.innerHTML = '';
    
    // Filter exercises based on search term
    const filteredExercises = searchTerm
        ? exercises.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm) || 
            ex.description.toLowerCase().includes(searchTerm))
        : exercises;
    
    // Check if we have exercises to display
    if (exercises.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                No exercises found. Add your first exercise using the button above.
            </div>
        `;
        return;
    }
    
    // Check if search returned no results
    if (filteredExercises.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                No exercises found matching "${searchTerm}".
            </div>
        `;
        return;
    }
    
    // Render each exercise
    filteredExercises.forEach(exercise => {
        const exerciseCard = createExerciseCard(exercise);
        listContainer.appendChild(exerciseCard);
    });
}

/**
 * Render error state for exercise list
 */
function renderExerciseListError() {
    const listContainer = document.getElementById('exerciseList');
    if (!listContainer) return;
    
    listContainer.innerHTML = `
        <div class="text-center py-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Failed to load exercises. Please try again.</p>
            <button id="retryLoadExercises" class="mt-2 btn-base btn-secondary btn-sm">Retry</button>
        </div>
    `;
    
    // Add retry handler
    document.getElementById('retryLoadExercises')?.addEventListener('click', async () => {
        listContainer.innerHTML = `
            <div class="flex justify-center py-4">
                <div class="loading-spinner"></div>
                <span class="ml-2">Loading exercises...</span>
            </div>
        `;
        
        try {
            await loadExercises();
            renderExerciseList();
        } catch (error) {
            renderExerciseListError();
        }
    });
}

/**
 * Create an exercise card element
 * @param {Object} exercise - Exercise data
 * @returns {HTMLElement} - Exercise card element
 */
function createExerciseCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200';
    card.dataset.exerciseId = exercise.id;
    
    // Truncate description for display
    const shortDescription = exercise.description.length > 100
        ? exercise.description.substring(0, 100) + '...'
        : exercise.description;
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <h3 class="text-lg font-semibold">${exercise.name}</h3>
            <div class="flex space-x-2">
                <button class="exercise-info-btn text-blue-600 hover:text-blue-800" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                <button class="exercise-edit-btn text-gray-600 hover:text-gray-800" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button class="exercise-delete-btn text-red-600 hover:text-red-800" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
        <p class="text-gray-600 mt-2 whitespace-pre-line">${shortDescription}</p>
    `;
    
    // Add event listeners
    card.querySelector('.exercise-info-btn').addEventListener('click', () => {
        showExerciseDetails(exercise);
    });
    
    card.querySelector('.exercise-edit-btn').addEventListener('click', () => {
        showEditExerciseForm(exercise);
    });
    
    card.querySelector('.exercise-delete-btn').addEventListener('click', () => {
        confirmDeleteExercise(exercise);
    });
    
    return card;
}

/**
 * Show exercise details
 * @param {Object} exercise - Exercise data
 */
function showExerciseDetails(exercise) {
    const content = `
        <div class="p-2">
            <p class="whitespace-pre-wrap text-gray-700">${exercise.description}</p>
        </div>
    `;
    
    // Create and show modal
    modal.createModal('exerciseDetailsModal', {
        title: exercise.name,
        content,
        size: 'medium'
    });
    
    modal.openModal('exerciseDetailsModal');
}

/**
 * Show form to create a new exercise
 */
function showNewExerciseForm() {
    // Create form content
    const formContent = createExerciseForm();
    
    // Create and show modal
    modal.createModal('exerciseFormModal', {
        title: 'Add New Exercise',
        content: formContent,
        size: 'medium'
    });
    
    modal.openModal('exerciseFormModal');
    
    // Set up form submission
    setupExerciseForm(async (exerciseData) => {
        try {
            ui.showLoadingIndicator();
            const newExercise = await exercisesApi.createExercise(exerciseData);
            
            // Add to local cache
            exercises.push(newExercise);
            
            // Close form modal
            modal.closeModal('exerciseFormModal');
            
            // Refresh the list
            renderExerciseList();
            
            // Show success message
            ui.showAlert('Exercise created successfully!', 'success');
        } catch (error) {
            console.error('Error creating exercise:', error);
            
            // Show error in the form
            const errorElement = document.getElementById('exerciseFormError');
            if (errorElement) {
                errorElement.textContent = error.message || 'Failed to create exercise';
                errorElement.classList.remove('hidden');
            }
        } finally {
            ui.hideLoadingIndicator();
        }
    });
}

/**
 * Show form to edit an exercise
 * @param {Object} exercise - Exercise to edit
 */
function showEditExerciseForm(exercise) {
    // Create form content
    const formContent = createExerciseForm(exercise);
    
    // Create and show modal
    modal.createModal('exerciseFormModal', {
        title: 'Edit Exercise',
        content: formContent,
        size: 'medium'
    });
    
    modal.openModal('exerciseFormModal');
    
    // Set up form submission
    setupExerciseForm(async (exerciseData) => {
        try {
            ui.showLoadingIndicator();
            const updatedExercise = await exercisesApi.updateExercise(exercise.id, exerciseData);
            
            // Update in local cache
            const index = exercises.findIndex(ex => ex.id === exercise.id);
            if (index !== -1) {
                exercises[index] = updatedExercise;
            }
            
            // Close form modal
            modal.closeModal('exerciseFormModal');
            
            // Refresh the list
            renderExerciseList();
            
            // Show success message
            ui.showAlert('Exercise updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating exercise:', error);
            
            // Show error in the form
            const errorElement = document.getElementById('exerciseFormError');
            if (errorElement) {
                errorElement.textContent = error.message || 'Failed to update exercise';
                errorElement.classList.remove('hidden');
            }
        } finally {
            ui.hideLoadingIndicator();
        }
    });
}

/**
 * Create an exercise form element
 * @param {Object} exercise - Optional exercise data for editing
 * @returns {HTMLElement} - Form element
 */
function createExerciseForm(exercise = null) {
    const formContainer = document.createElement('div');
    
    formContainer.innerHTML = `
        <form id="exerciseForm" class="space-y-4">
            <!-- Hidden ID field for editing -->
            <input type="hidden" id="exerciseId" value="${exercise?.id || ''}">
            
            <!-- Error message area -->
            <div id="exerciseFormError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative hidden"></div>
            
            <!-- Name field -->
            <div>
                <label for="exerciseName" class="block mb-1 font-medium">Exercise Name</label>
                <input type="text" id="exerciseName" class="input-base w-full" value="${exercise?.name || ''}" required>
            </div>
            
            <!-- Description field -->
            <div>
                <label for="exerciseDescription" class="block mb-1 font-medium">Description</label>
                <textarea id="exerciseDescription" class="input-base w-full" rows="6" required>${exercise?.description || ''}</textarea>
                <p class="text-sm text-gray-500 mt-1">Provide a detailed description of how to perform this exercise.</p>
            </div>
            
            <!-- Form buttons -->
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" class="btn-base btn-secondary" data-close-modal>Cancel</button>
                <button type="submit" id="saveExerciseBtn" class="btn-base btn-primary">
                    ${exercise ? 'Update Exercise' : 'Save Exercise'}
                </button>
            </div>
        </form>
    `;
    
    return formContainer;
}

/**
 * Set up exercise form submission
 * @param {Function} onSubmit - Callback function when form is submitted
 */
function setupExerciseForm(onSubmit) {
    const form = document.getElementById('exerciseForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide any previous error
        const errorElement = document.getElementById('exerciseFormError');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        // Get form data
        const exerciseData = {
            name: document.getElementById('exerciseName').value.trim(),
            description: formatDescription(document.getElementById('exerciseDescription').value.trim())
        };
        
        // Basic validation
        if (!exerciseData.name) {
            if (errorElement) {
                errorElement.textContent = 'Please enter an exercise name';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        
        if (!exerciseData.description) {
            if (errorElement) {
                errorElement.textContent = 'Please enter a description';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        
        // Set loading state
        const saveButton = document.getElementById('saveExerciseBtn');
        const originalText = saveButton.textContent;
        saveButton.disabled = true;
        saveButton.innerHTML = `
            <svg class="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
        `;
        
        // Submit the form
        try {
            await onSubmit(exerciseData);
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Show error message
            if (errorElement) {
                errorElement.textContent = error.message || 'An error occurred';
                errorElement.classList.remove('hidden');
            }
            
            // Reset button
            saveButton.disabled = false;
            saveButton.textContent = originalText;
        }
    });
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
 * Confirm and delete an exercise
 * @param {Object} exercise - Exercise to delete
 */
async function confirmDeleteExercise(exercise) {
    const confirmed = await modal.showConfirmModal(
        `Are you sure you want to delete "${exercise.name}"? This cannot be undone.`, 
        { title: 'Delete Exercise' }
    );
    
    if (confirmed) {
        try {
            ui.showLoadingIndicator();
            await exercisesApi.deleteExercise(exercise.id);
            
            // Remove from local cache
            exercises = exercises.filter(ex => ex.id !== exercise.id);
            
            // Refresh the list
            renderExerciseList();
            
            // Show success message
            ui.showAlert('Exercise deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting exercise:', error);
            ui.showAlert('Failed to delete exercise: ' + error.message, 'error');
        } finally {
            ui.hideLoadingIndicator();
        }
    }
}

/**
 * Get all exercises (for other components)
 * @returns {Array} - Array of exercises
 */
export function getAllExercises() {
    return [...exercises]; // Return a copy to prevent direct mutation
}