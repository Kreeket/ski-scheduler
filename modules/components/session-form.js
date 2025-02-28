// session-form.js - Component for session creation and editing with improved exercise selection
import * as ui from '../ui/common.js';
import * as exercisesApi from '../api/exercises.js';
import * as exerciseManager from './exercise-manager.js';

// Local cache of exercises
let cachedExercises = [];
let selectedExercises = [];

/**
 * Show form to create/edit a session with improved exercise selection
 * @param {string} title - Modal title
 * @param {Object} sessionData - Session data to populate the form
 * @param {Function} onSave - Callback when the form is saved
 */
export function showSessionForm(title, sessionData, onSave) {
    // Load exercises if not already loaded
    initializeExerciseSelection(sessionData.exercises || []);
    
    // Create modal content
    const modalContent = `
        <form id="sessionForm" class="space-y-4">
            <div>
                <label for="sessionTitle" class="block text-sm font-medium mb-1">Title</label>
                <input type="text" id="sessionTitle" name="title" class="input-base w-full" 
                    value="${sessionData.title || ''}" placeholder="Training Session">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="sessionDate" class="block text-sm font-medium mb-1">Date</label>
                    <input type="date" id="sessionDate" name="date" class="input-base w-full" 
                        value="${sessionData.date || ''}" required>
                </div>
                <div>
                    <label for="sessionLocation" class="block text-sm font-medium mb-1">Location</label>
                    <input type="text" id="sessionLocation" name="location" class="input-base w-full" 
                        value="${sessionData.location || ''}" placeholder="Location">
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="sessionStartTime" class="block text-sm font-medium mb-1">Start Time</label>
                    <input type="time" id="sessionStartTime" name="startTime" class="input-base w-full" 
                        value="${sessionData.startTime || ''}" required>
                </div>
                <div>
                    <label for="sessionEndTime" class="block text-sm font-medium mb-1">End Time</label>
                    <input type="time" id="sessionEndTime" name="endTime" class="input-base w-full" 
                        value="${sessionData.endTime || ''}" required>
                </div>
            </div>
            
            <div>
                <label for="sessionLeaders" class="block text-sm font-medium mb-1">Leaders</label>
                <input type="text" id="sessionLeaders" name="leaders" class="input-base w-full" 
                    value="${sessionData.leaders || ''}" placeholder="Leaders">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Exercises</label>
                <div id="exerciseSelectionContainer" class="border rounded-md p-3 bg-gray-50 mb-2">
                    <div class="flex justify-between mb-2">
                        <input type="text" id="exerciseSearch" placeholder="Search exercises..." class="input-base w-full mr-2">
                        <button type="button" id="addCustomExerciseBtn" class="btn-base btn-secondary text-xs">Add Custom</button>
                    </div>
                    
                    <div id="selectedExercisesList" class="mb-3 min-h-10">
                        <p class="text-gray-500 text-sm italic" id="noExercisesMessage">No exercises selected</p>
                    </div>
                    
                    <div id="exerciseAccordion" class="max-h-40 overflow-y-auto border-t pt-2">
                        <p class="text-center text-gray-500 text-sm py-2">Loading exercises...</p>
                    </div>
                </div>
            </div>
            
            <div>
                <label for="sessionNotes" class="block text-sm font-medium mb-1">Notes</label>
                <textarea id="sessionNotes" name="notes" class="input-base w-full" rows="3"
                    placeholder="Additional information...">${sessionData.notes || ''}</textarea>
            </div>
            
            <input type="hidden" id="sessionGroup" name="group" value="${sessionData.group || ''}">
            <input type="hidden" id="sessionId" name="id" value="${sessionData.id || ''}">
            
            <div class="flex justify-end space-x-2 mt-4">
                <button type="button" id="cancelSessionBtn" class="btn-base btn-secondary">Cancel</button>
                <button type="submit" id="saveSessionBtn" class="btn-base btn-primary">Save Session</button>
            </div>
        </form>
    `;
    
    // Show modal with the form
    ui.createModal('sessionModal', title, modalContent);
    ui.showModal('sessionModal');
    
    // Setup form event listeners
    setupSessionFormEventListeners(sessionData, onSave);
}

/**
 * Initialize the exercise selection with data
 * @param {Array} initialExercises - Initial selected exercises
 */
async function initializeExerciseSelection(initialExercises) {
    selectedExercises = [...initialExercises];
    
    try {
        // Only fetch exercises if we don't have them cached
        if (cachedExercises.length === 0) {
            ui.showLoadingIndicator();
            cachedExercises = await exercisesApi.getExercises();
            ui.hideLoadingIndicator();
        }
        
        // Render the exercises once the modal is shown
        setTimeout(() => {
            renderExerciseAccordion();
            renderSelectedExercises();
        }, 100);
    } catch (error) {
        console.error('Error loading exercises:', error);
        ui.hideLoadingIndicator();
        
        // Show error in the accordion
        const accordionContainer = document.getElementById('exerciseAccordion');
        if (accordionContainer) {
            accordionContainer.innerHTML = `
                <p class="text-center text-red-500 text-sm py-2">
                    Error loading exercises. Try again or add them manually.
                </p>
            `;
        }
    }
}

/**
 * Setup event listeners for the session form
 * @param {Object} sessionData - Current session data
 * @param {Function} onSave - Callback on save
 */
function setupSessionFormEventListeners(sessionData, onSave) {
    const form = document.getElementById('sessionForm');
    
    // Cancel button
    document.getElementById('cancelSessionBtn')?.addEventListener('click', () => {
        ui.hideElement(document.getElementById('sessionModal'));
    });
    
    // Exercise search
    document.getElementById('exerciseSearch')?.addEventListener('input', (e) => {
        renderExerciseAccordion(e.target.value);
    });
    
    // Add custom exercise button
    document.getElementById('addCustomExerciseBtn')?.addEventListener('click', () => {
        promptForCustomExercise();
    });
    
    // Form submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            id: sessionData.id,
            group: document.getElementById('sessionGroup').value,
            title: document.getElementById('sessionTitle').value.trim(),
            date: document.getElementById('sessionDate').value,
            startTime: document.getElementById('sessionStartTime').value,
            endTime: document.getElementById('sessionEndTime').value,
            location: document.getElementById('sessionLocation').value.trim(),
            leaders: document.getElementById('sessionLeaders').value.trim(),
            notes: document.getElementById('sessionNotes').value.trim(),
            exercises: selectedExercises
        };
        
        // Basic validation
        if (!formData.date || !formData.startTime || !formData.endTime) {
            ui.showAlert('Please fill out all required fields', 'error');
            return;
        }
        
        // Set default title if empty
        if (!formData.title) {
            formData.title = 'Training Session';
        }
        
        // Close modal
        ui.hideElement(document.getElementById('sessionModal'));
        
        // Save using the provided callback
        if (typeof onSave === 'function') {
            await onSave(formData);
        }
    });
}

/**
 * Render the exercise accordion with search filtering
 * @param {string} searchTerm - Optional search term
 */
function renderExerciseAccordion(searchTerm = '') {
    const accordionContainer = document.getElementById('exerciseAccordion');
    if (!accordionContainer) return;
    
    if (cachedExercises.length === 0) {
        accordionContainer.innerHTML = `
            <p class="text-center text-gray-500 text-sm py-2">
                No exercises found. Add custom exercises or manage the exercise library.
            </p>
        `;
        return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filteredExercises = searchTerm 
        ? cachedExercises.filter(ex => 
            ex.name.toLowerCase().includes(searchLower) || 
            ex.description.toLowerCase().includes(searchLower))
        : cachedExercises;
        
    if (filteredExercises.length === 0) {
        accordionContainer.innerHTML = `
            <p class="text-center text-gray-500 text-sm py-2">
                No exercises match "${searchTerm}". Try a different search or add a custom exercise.
            </p>
        `;
        return;
    }
    
    let html = '';
    
    filteredExercises.forEach(exercise => {
        const isSelected = selectedExercises.includes(exercise.name);
        
        html += `
            <div class="exercise-item mb-2 border rounded bg-white">
                <div class="p-2 flex items-center">
                    <input type="checkbox" id="exercise-${exercise.id}" 
                        class="exercise-checkbox mr-2" 
                        data-name="${exercise.name}" 
                        ${isSelected ? 'checked' : ''}>
                    <label for="exercise-${exercise.id}" class="flex-grow cursor-pointer font-medium">
                        ${exercise.name}
                    </label>
                    <button type="button" class="exercise-info-btn text-gray-600 hover:text-blue-500" 
                        data-id="${exercise.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });
    
    accordionContainer.innerHTML = html;
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const exerciseName = this.dataset.name;
            
            if (this.checked) {
                if (!selectedExercises.includes(exerciseName)) {
                    selectedExercises.push(exerciseName);
                }
            } else {
                selectedExercises = selectedExercises.filter(name => name !== exerciseName);
            }
            
            renderSelectedExercises();
        });
    });
    
    // Add event listeners to info buttons
    document.querySelectorAll('.exercise-info-btn').forEach(button => {
        button.addEventListener('click', function() {
            const exerciseId = this.dataset.id;
            const exercise = cachedExercises.find(ex => ex.id === exerciseId);
            if (exercise) {
                showExerciseInfoPopup(exercise);
            }
        });
    });
}

/**
 * Render the selected exercises list
 */
function renderSelectedExercises() {
    const container = document.getElementById('selectedExercisesList');
    const noExercisesMessage = document.getElementById('noExercisesMessage');
    
    if (!container) return;
    
    if (selectedExercises.length === 0) {
        if (noExercisesMessage) {
            noExercisesMessage.classList.remove('hidden');
        }
        container.innerHTML = '';
        return;
    }
    
    if (noExercisesMessage) {
        noExercisesMessage.classList.add('hidden');
    }
    
    let html = '<div class="flex flex-wrap gap-2">';
    
    selectedExercises.forEach(exercise => {
        html += `
            <div class="inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm">
                ${exercise}
                <button type="button" class="remove-exercise-btn ml-1 text-blue-600 hover:text-blue-800" data-name="${exercise}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-exercise-btn').forEach(button => {
        button.addEventListener('click', function() {
            const exerciseName = this.dataset.name;
            selectedExercises = selectedExercises.filter(name => name !== exerciseName);
            
            // Update checkboxes
            const checkbox = document.querySelector(`.exercise-checkbox[data-name="${exerciseName}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            renderSelectedExercises();
        });
    });
}

/**
 * Show a popup with exercise information
 * @param {Object} exercise - Exercise data
 */
function showExerciseInfoPopup(exercise) {
    Swal.fire({
        title: exercise.name,
        html: `<div class="text-left whitespace-pre-wrap">${exercise.description}</div>`,
        confirmButtonText: 'Close',
        showClass: {
            popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut animate__faster'
        }
    });
}

/**
 * Prompt user to add a custom exercise name
 */
function promptForCustomExercise() {
    Swal.fire({
        title: 'Add Custom Exercise',
        input: 'text',
        inputLabel: 'Exercise Name',
        inputPlaceholder: 'Enter exercise name...',
        showCancelButton: true,
        confirmButtonText: 'Add',
        showLoaderOnConfirm: true,
        inputValidator: (value) => {
            if (!value) {
                return 'Please enter an exercise name';
            }
        },
        preConfirm: (exerciseName) => {
            // Add to selected exercises if not already there
            if (!selectedExercises.includes(exerciseName)) {
                selectedExercises.push(exerciseName);
                return exerciseName;
            } else {
                Swal.showValidationMessage('Exercise already added');
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Render the updated list
            renderSelectedExercises();
            Swal.fire({
                title: 'Exercise Added',
                text: `"${result.value}" added to session`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}