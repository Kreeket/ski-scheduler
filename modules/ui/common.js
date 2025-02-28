// common.js - Common UI utilities
// This module centralizes UI utilities for consistent behavior across the app

/**
 * Show an element
 * @param {HTMLElement} element - Element to show
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    } else {
        console.warn('Attempted to show a null/undefined element');
    }
}

/**
 * Hide an element
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    } else {
        console.warn('Attempted to hide a null/undefined element');
    }
}

/**
 * Show the app's loading indicator
 */
export function showLoadingIndicator() {
    const loader = document.getElementById('loadingIndicatorWrapper');
    if (loader) {
        showElement(loader);
    } else {
        console.warn('Loading indicator element not found');
    }
}

/**
 * Hide the app's loading indicator
 */
export function hideLoadingIndicator() {
    const loader = document.getElementById('loadingIndicatorWrapper');
    if (loader) {
        hideElement(loader);
    }
}

/**
 * Show a section of the app
 * @param {string} sectionId - ID of the section to show
 */
export function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        showElement(section);
    } else {
        console.warn(`Section with ID '${sectionId}' not found`);
    }
}

/**
 * Hide a section of the app
 * @param {string} sectionId - ID of the section to hide
 */
export function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        hideElement(section);
    } else {
        console.warn(`Section with ID '${sectionId}' not found`);
    }
}

/**
 * Show an alert using SweetAlert2
 * @param {string} message - Message to display
 * @param {string} iconType - Icon type ('success', 'error', 'warning', 'info', 'question')
 */
export function showAlert(message, iconType = 'error') {
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 is not loaded');
        alert(message); // Fallback to browser alert
        return;
    }
    
    Swal.fire({
        icon: iconType,
        title: iconType === 'success' ? 'Success' : 'Alert',
        text: message,
    });
}

/**
 * Show a confirmation dialog using SweetAlert2
 * @param {string} message - Message to display
 * @param {string} title - Dialog title
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
 */
export async function showConfirm(message, title = 'Confirm') {
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 is not loaded');
        return confirm(message); // Fallback to browser confirm
    }
    
    const result = await Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    });
    return result.isConfirmed;
}

/**
 * Set loading state for a button
 * @param {string} buttonId - ID of the button
 * @param {boolean} isLoading - Whether the button is loading
 */
export function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) {
        console.warn(`Button with ID '${buttonId}' not found`);
        return;
    }
    
    if (isLoading) {
        const originalText = button.textContent;
        button.dataset.originalText = originalText;
        button.innerHTML = '<svg class="animate-spin h-4 w-4 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>' + originalText;
        button.disabled = true;
        button.classList.add('btn-loading');
    } else {
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
        }
        button.disabled = false;
        button.classList.remove('btn-loading');
    }
}

/**
 * Handle errors in a consistent way
 * @param {Error} error - Error object
 * @param {string} userMessage - Message to show to the user
 */
export function handleError(error, userMessage) {
    console.error(error);
    const message = userMessage || "An unexpected error occurred. Please try again.";
    showAlert(message, 'error');
}

/**
 * Create a modal dialog
 * @param {string} id - Modal ID
 * @param {string} title - Modal title
 * @param {string} content - Modal content HTML
 * @param {Function} onSave - Optional save callback
 * @param {Function} onClose - Optional close callback
 * @returns {HTMLElement} - The modal element
 */
export function createModal(id, title, content, onSave, onClose) {
    // Remove existing modal if it exists
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create new modal
    const modalHTML = `
        <div id="${id}" class="modal-container hidden">
            <div class="relative p-5 border w-full max-w-md mx-2 md:mx-auto shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <button type="button" class="modal-close-btn absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 class="text-lg font-medium mb-4">${title}</h3>
                ${content}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup event listeners
    const modal = document.getElementById(id);
    
    // Close when clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideElement(modal);
            if (onClose) onClose();
        }
    });
    
    // Close button
    const closeButton = modal.querySelector('.modal-close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideElement(modal);
            if (onClose) onClose();
        });
    }
    
    // Save button if provided
    const saveButtonId = `save${id.charAt(0).toUpperCase() + id.slice(1)}`;
    const saveButton = modal.querySelector(`#${saveButtonId}`);
    if (saveButton && onSave) {
        saveButton.addEventListener('click', onSave);
    }
    
    return modal;
}

/**
 * Show a modal dialog
 * @param {string} id - Modal ID
 */
export function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        showElement(modal);
    } else {
        console.error(`Modal with id ${id} not found`);
    }
}