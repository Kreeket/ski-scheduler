// modules/components/session-form.js - Updated to use the new exercise selector
import * as ui from '../ui/common.js';
import * as modal from '../ui/modal.js';
import * as exerciseSelector from './exercise-selector.js';

/**
 * Show form to create/edit a session
 * @param {string} title - Modal title
 * @param {Object} sessionData - Session data to populate the form
 * @param {Function} onSave - Callback when the form is saved
 */
export function showSessionForm(title, sessionData, onSave) {
    // Create the form element
    const formElement = createSessionFormElement(sessionData);
    
    // Create modal with the form
    modal.createModal('sessionModal', {
        title: title,
        content: formElement,
        size: 'large',
        onOpen: () => {
            // Initialize the form
            initializeSessionForm(formElement, sessionData, onSave);
        }
    });
    
    // Show the modal
    modal.openModal('sessionModal');
}

/**
 * Create the session form element
 * @param {Object} sessionData - Session data to populate the form
 * @returns {HTMLElement} - Form element
 */
function createSessionFormElement(sessionData) {
    const formContainer = document.createElement('div');
    
    formContainer.innerHTML = `
        <form id="sessionForm" class="space-y-4" novalidate>
            <!-- Error message area -->
            <div id="sessionFormError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative hidden"></div>
            
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
                <label for="exerciseSelectorContainer" class="block text-sm font-medium mb-1">Exercises</label>
                <div id="exerciseSelectorContainer" class="border rounded-md p-3"></div>
            </div>
            
            <div>
                <label for="sessionNotes" class="block text-sm font-medium mb-1">Notes</label>
                <textarea id="sessionNotes" name="notes" class="input-base w-full" rows="3"
                    placeholder="Additional information...">${sessionData.notes || ''}</textarea>
            </div>
            
            <input type="hidden" id="sessionGroup" name="group" value="${sessionData.group || ''}">
            <input type="hidden" id="sessionId" name="id" value="${sessionData.id || ''}">
            
            <div class="flex justify-end space-x-2 mt-4">
                <button type="button" id="cancelSessionBtn" class="btn-base btn-secondary" data-close-modal="sessionModal">Cancel</button>
                <button type="submit" id="saveSessionBtn" class="btn-base btn-primary">Save Session</button>
            </div>
        </form>
    `;
    
    return formContainer;
}

/**
 * Initialize the session form
 * @param {HTMLElement} formElement - Form element
 * @param {Object} sessionData - Session data
 * @param {Function} onSave - Callback when form is saved
 */
function initializeSessionForm(formElement, sessionData, onSave) {
    // Initialize exercise selector
    const selectorContainer = document.getElementById('exerciseSelectorContainer');
    if (selectorContainer) {
        exerciseSelector.initExerciseSelector(
            selectorContainer, 
            sessionData.exercises || [],
            // Callback when exercises change - not needed here but could be useful
            (exercises) => {
                console.log('Exercises changed:', exercises);
            }
        );
    }
    
    // Prevent submitting on enter key in text inputs
    formElement.querySelectorAll('input[type="text"], input[type="date"], input[type="time"]').forEach(input => {
        input.addEventListener('keypress', (e) => {
            // If Enter key and not in a textarea
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                return false;
            }
        });
    });
    
    // Form submission handler
    const form = document.getElementById('sessionForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            handleFormSubmission(sessionData, onSave);
        });
    }
    
    // Make all buttons within exercise container stop propagation
    const exerciseContainer = document.getElementById('exerciseSelectorContainer');
    if (exerciseContainer) {
        exerciseContainer.addEventListener('click', (e) => {
            // If the click is on or within the exercise container, but not on a save/cancel button
            if (!e.target.closest('[data-close-modal]') && !e.target.closest('#saveSessionBtn')) {
                // Stop propagation to prevent form submission
                e.stopPropagation();
            }
        });
    }
}

/**
 * Handle form submission
 * @param {Object} sessionData - Original session data
 * @param {Function} onSave - Callback when form is saved
 */
async function handleFormSubmission(sessionData, onSave) {
    // Hide any existing error message
    const errorElement = document.getElementById('sessionFormError');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
    
    try {
        console.log('Form submission started');
        
        // Get form data
        const formData = {
            id: sessionData.id,
            group: document.getElementById('sessionGroup').value,
            title: document.getElementById('sessionTitle').value.trim() || 'Training Session',
            date: document.getElementById('sessionDate').value,
            startTime: document.getElementById('sessionStartTime').value,
            endTime: document.getElementById('sessionEndTime').value,
            location: document.getElementById('sessionLocation').value.trim(),
            leaders: document.getElementById('sessionLeaders').value.trim(),
            notes: document.getElementById('sessionNotes').value.trim(),
        };
        
        // Get selected exercises from the selector
        const selectorContainer = document.getElementById('exerciseSelectorContainer');
        formData.exercises = exerciseSelector.getSelection(selectorContainer);
        
        // Basic validation
        if (!formData.date || !formData.startTime || !formData.endTime) {
            throw new Error('Please fill out all required fields');
        }
        
        // Set loading state
        ui.setButtonLoading('saveSessionBtn', true);
        
        // Close modal
        modal.closeModal('sessionModal');
        
        // Save using the provided callback
        if (typeof onSave === 'function') {
            await onSave(formData);
        }
    } catch (error) {
        // Show error message
        if (errorElement) {
            errorElement.textContent = error.message || 'An error occurred';
            errorElement.classList.remove('hidden');
        }
        
        // Reset loading state
        ui.setButtonLoading('saveSessionBtn', false);
        
        console.error('Form submission error:', error);
    }
}