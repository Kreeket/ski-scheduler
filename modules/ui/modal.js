// modules/ui/modal.js - Centralized modal management system

/**
 * Map of active modals
 * @type {Map<string, HTMLElement>}
 */
const activeModals = new Map();

/**
 * Create a modal with the given ID and options
 * @param {string} id - Modal ID
 * @param {object} options - Modal configuration options
 * @param {string} options.title - Modal title
 * @param {string|HTMLElement} options.content - Modal content (HTML string or element)
 * @param {Function} options.onClose - Function to call when modal is closed
 * @param {Function} options.onOpen - Function to call when modal is opened
 * @param {boolean} options.closeOnEscape - Whether to close on escape key (default: true)
 * @param {boolean} options.closeOnOutsideClick - Whether to close when clicking outside (default: true)
 * @returns {HTMLElement} - The modal element
 */
export function createModal(id, options = {}) {
    // Remove existing modal with same ID if it exists
    if (document.getElementById(id)) {
        closeModal(id);
        document.getElementById(id)?.remove();
    }

    // Default options
    const defaultOptions = {
        title: '',
        content: '',
        onClose: null,
        onOpen: null,
        closeOnEscape: true,
        closeOnOutsideClick: true,
        size: 'medium', // small, medium, large
    };

    const config = { ...defaultOptions, ...options };

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = id;
    modalContainer.className = 'modal-container hidden'; // Start hidden
    modalContainer.setAttribute('role', 'dialog');
    modalContainer.setAttribute('aria-modal', 'true');
    modalContainer.setAttribute('aria-labelledby', `${id}-title`);

    // Size classes
    const sizeClass = config.size === 'small' ? 'max-w-sm' : 
                      config.size === 'large' ? 'max-w-2xl' : 'max-w-md';

    // Create modal content
    modalContainer.innerHTML = `
        <div class="modal-content ${sizeClass}">
            <button type="button" class="modal-close-btn" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            ${config.title ? `<h3 id="${id}-title" class="modal-title">${config.title}</h3>` : ''}
            <div class="modal-body"></div>
        </div>
    `;

    // Add content to modal body
    const modalBody = modalContainer.querySelector('.modal-body');
    if (typeof config.content === 'string') {
        modalBody.innerHTML = config.content;
    } else if (config.content instanceof HTMLElement) {
        modalBody.appendChild(config.content);
    }

    // Add event listeners
    const closeBtn = modalContainer.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(id));
    }

    // Close on outside click if enabled
    if (config.closeOnOutsideClick) {
        modalContainer.addEventListener('click', (event) => {
            if (event.target === modalContainer) {
                closeModal(id);
            }
        });
    }

    // Store callbacks in data attributes
    if (config.onClose) {
        modalContainer.dataset.onClose = 'true';
    }
    if (config.onOpen) {
        modalContainer.dataset.onOpen = 'true';
    }

    // Add to DOM
    document.body.appendChild(modalContainer);

    // Store modal and callbacks in our map
    activeModals.set(id, {
        element: modalContainer,
        onClose: config.onClose,
        onOpen: config.onOpen
    });

    // Escape key listener (will be added when opened)
    const handleEscapeKey = (event) => {
        if (event.key === 'Escape' && config.closeOnEscape) {
            closeModal(id);
        }
    };

    // Store the handler on the modal for later removal
    modalContainer.handleEscapeKey = handleEscapeKey;

    return modalContainer;
}

/**
 * Open a modal by ID
 * @param {string} id - Modal ID
 */
export function openModal(id) {
    const modal = document.getElementById(id);
    
    if (!modal) {
        console.error(`Modal with ID "${id}" not found`);
        return;
    }

    // Add global event listeners
    if (modal.handleEscapeKey) {
        document.addEventListener('keydown', modal.handleEscapeKey);
    }

    // Show the modal
    modal.classList.remove('hidden');
    
    // Add animation class if needed
    modal.classList.add('modal-open');
    
    // Set focus to the first focusable element
    setTimeout(() => {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
            focusable[0].focus();
        }
    }, 50);

    // Call onOpen callback if exists
    const modalData = activeModals.get(id);
    if (modalData?.onOpen) {
        modalData.onOpen();
    }
}

/**
 * Close a modal by ID
 * @param {string} id - Modal ID
 */
export function closeModal(id) {
    const modal = document.getElementById(id);
    
    if (!modal) {
        return; // Modal not found, already closed
    }

    // Remove global event listeners
    if (modal.handleEscapeKey) {
        document.removeEventListener('keydown', modal.handleEscapeKey);
    }

    // Hide the modal
    modal.classList.add('hidden');
    modal.classList.remove('modal-open');

    // Call onClose callback if exists
    const modalData = activeModals.get(id);
    if (modalData?.onClose) {
        modalData.onClose();
    }
}

/**
 * Update modal content
 * @param {string} id - Modal ID
 * @param {object} updates - Content to update
 * @param {string} [updates.title] - New title
 * @param {string|HTMLElement} [updates.content] - New content
 */
export function updateModal(id, updates = {}) {
    const modal = document.getElementById(id);
    
    if (!modal) {
        console.error(`Modal with ID "${id}" not found`);
        return;
    }

    // Update title if provided
    if (updates.title) {
        const titleElement = modal.querySelector(`#${id}-title`);
        if (titleElement) {
            titleElement.textContent = updates.title;
        }
    }

    // Update content if provided
    if (updates.content) {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
            
            if (typeof updates.content === 'string') {
                modalBody.innerHTML = updates.content;
            } else if (updates.content instanceof HTMLElement) {
                modalBody.appendChild(updates.content);
            }
        }
    }
}

/**
 * Create a confirmation modal
 * @param {string} message - Confirmation message
 * @param {object} options - Options
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
 */
export function showConfirmModal(message, options = {}) {
    return new Promise((resolve) => {
        const id = 'confirm-modal-' + Date.now();
        
        const content = `
            <div class="p-4">
                <p class="mb-4">${message}</p>
                <div class="flex justify-end space-x-2">
                    <button id="${id}-cancel" class="btn-base btn-secondary">Cancel</button>
                    <button id="${id}-confirm" class="btn-base btn-primary">Confirm</button>
                </div>
            </div>
        `;
        
        const modal = createModal(id, {
            title: options.title || 'Confirm',
            content,
            onClose: () => resolve(false)
        });
        
        // Add button event listeners
        document.getElementById(`${id}-cancel`).addEventListener('click', () => {
            closeModal(id);
            resolve(false);
        });
        
        document.getElementById(`${id}-confirm`).addEventListener('click', () => {
            closeModal(id);
            resolve(true);
        });
        
        openModal(id);
    });
}

/**
 * Clean up all modals (for page transitions)
 */
export function cleanupModals() {
    activeModals.forEach((data, id) => {
        closeModal(id);
    });
    activeModals.clear();
}

// Initialize - Add global event handlers
document.addEventListener('DOMContentLoaded', () => {
    // Allow data-close-modal attributes to work
    document.addEventListener('click', (e) => {
        const closeModalBtn = e.target.closest('[data-close-modal]');
        if (closeModalBtn) {
            const modalId = closeModalBtn.dataset.closeModal;
            closeModal(modalId || closeModalBtn.closest('.modal-container')?.id);
        }
    });
});