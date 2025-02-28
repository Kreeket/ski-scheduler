// modules/components/exercise-selector.js - Enhanced exercise selection with browse and favorites

import * as exerciseManager from './exercise-manager.js';
import * as ui from '../ui/common.js';
import * as modal from '../ui/modal.js';

// Constants for favorites storage
const FAVORITES_STORAGE_KEY = 'exerciseFavorites';
let cachedFavorites = null;

/**
 * Initialize an exercise selector
 * @param {HTMLElement} container - Container element
 * @param {Array} initialSelected - Initially selected exercises
 * @param {Function} onChange - Callback when selection changes
 */
export async function initExerciseSelector(container, initialSelected = [], onChange = null) {
    if (!container) {
        console.error('Container element not found for exercise selector');
        return;
    }
    
    // Store selected exercises and callback in the container's dataset
    container.dataset.selectedExercises = JSON.stringify(initialSelected);
    container._onChangeCallback = onChange;
    
    // Create the selector UI
    renderSelector(container);
    
    // Ensure exercises are loaded for the selector
    try {
        await exerciseManager.ensureExercisesLoaded();
        renderSelectedExercises(container);
    } catch (error) {
        console.error('Error loading exercises for selector:', error);
        showSelectorError(container);
    }
}

/**
 * Render the exercise selector UI
 * @param {HTMLElement} container - Container element
 */
function renderSelector(container) {
    // Clear container
    container.innerHTML = '';
    
    // Create UI structure
    container.innerHTML = `
        <div class="exercise-selector">
            <!-- Selected exercises area -->
            <div id="selectedExercisesContainer" class="selected-exercises-container bg-gray-50 rounded-md p-3 mb-3 min-h-[80px] border border-gray-200">
                <p id="noExercisesMessage" class="text-gray-500 text-sm italic">No exercises selected</p>
                <div id="selectedExercisesList" class="flex flex-wrap gap-2 mt-2"></div>
            </div>
            
            <!-- Search and selection area -->
            <div class="exercise-selection flex space-x-2 mb-3">
                <div class="relative flex-grow">
                    <input type="text" id="exerciseSearchInput" class="input-base pr-8 w-full" placeholder="Search exercises...">
                    <div id="searchSpinner" class="absolute right-2 top-1/2 transform -translate-y-1/2 hidden">
                        <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    
                    <!-- Dropdown will be inserted here -->
                    <div id="exerciseDropdown" class="exercise-dropdown hidden absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"></div>
                </div>
                <button type="button" id="addCustomExerciseBtn" class="btn-base btn-secondary whitespace-nowrap">
                    + Custom
                </button>
            </div>
            
            <!-- Browse exercises section -->
            <div class="browse-exercises-section border border-gray-200 rounded-md">
                <!-- Header toggle -->
                <div id="browseToggleHeader" class="flex justify-between items-center p-3 bg-gray-50 rounded-t-md cursor-pointer hover:bg-gray-100">
                    <h3 class="font-medium">Browse Exercises</h3>
                    <div id="browseToggleIcon" class="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                </div>
                
                <!-- Collapsible content (initially hidden) -->
                <div id="browseContent" class="hidden">
                    <!-- Tabs -->
                    <div class="browse-tabs flex border-b border-gray-200">
                        <button type="button" id="allExercisesTab" class="browse-tab-active py-2 px-4 flex-1 text-center">All</button>
                        <button type="button" id="favoritesTab" class="browse-tab py-2 px-4 flex-1 text-center">Favorites</button>
                    </div>
                    
                    <!-- Exercise list -->
                    <div id="exerciseListContainer" class="p-3 max-h-60 overflow-y-auto">
                        <div class="loading-container flex justify-center py-4">
                            <div class="loading-spinner"></div>
                            <span class="ml-2">Loading exercises...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set up event listeners
    setupEventListeners(container);
}

/**
 * Set up event listeners for the selector
 * @param {HTMLElement} container - Container element
 */
function setupEventListeners(container) {
    const searchInput = container.querySelector('#exerciseSearchInput');
    const addCustomBtn = container.querySelector('#addCustomExerciseBtn');
    const dropdown = container.querySelector('#exerciseDropdown');
    const browseToggleHeader = container.querySelector('#browseToggleHeader');
    const allExercisesTab = container.querySelector('#allExercisesTab');
    const favoritesTab = container.querySelector('#favoritesTab');
    
    // Search input handler with debounce
    let searchTimeout = null;
    searchInput?.addEventListener('input', (e) => {
        // Show loading indicator
        container.querySelector('#searchSpinner')?.classList.remove('hidden');
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout
        searchTimeout = setTimeout(() => {
            handleSearch(e.target.value, container);
        }, 300);
    });
    
    // Focus handling for dropdown
    searchInput?.addEventListener('focus', () => {
        if (searchInput.value.length > 0) {
            dropdown?.classList.remove('hidden');
        }
    });
    
    // Add custom exercise button
    addCustomBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        promptForCustomExercise(container);
    });
    
    // Browse toggle
    browseToggleHeader?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation to prevent form submission
        toggleBrowseSection(container);
    });
    
    // Tab switching
    allExercisesTab?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchTab(container, 'all');
    });
    
    favoritesTab?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchTab(container, 'favorites');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown?.classList.add('hidden');
        }
    });
    
    // Listen for keydown in the container
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown?.classList.add('hidden');
        } else if (e.key === 'ArrowDown' && !dropdown?.classList.contains('hidden')) {
            // Focus the first item in the dropdown
            const firstItem = dropdown?.querySelector('.exercise-dropdown-item');
            firstItem?.focus();
            e.preventDefault();
        }
    });
}

/**
 * Toggle the browse section expansion
 * @param {HTMLElement} container - Container element
 */
function toggleBrowseSection(container) {
    const browseContent = container.querySelector('#browseContent');
    const toggleIcon = container.querySelector('#browseToggleIcon');
    
    if (!browseContent || !toggleIcon) return;
    
    const isExpanded = !browseContent.classList.contains('hidden');
    
    if (isExpanded) {
        // Collapse
        browseContent.classList.add('hidden');
        toggleIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        `;
    } else {
        // Expand
        browseContent.classList.remove('hidden');
        toggleIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
            </svg>
        `;
        
        // Load exercises if not already loaded
        loadExerciseList(container);
    }
    
    // Prevent form submission
    return false;
}

/**
 * Switch between All and Favorites tabs
 * @param {HTMLElement} container - Container element
 * @param {string} tab - Tab to switch to ('all' or 'favorites')
 */
function switchTab(container, tab) {
    const allTab = container.querySelector('#allExercisesTab');
    const favoritesTab = container.querySelector('#favoritesTab');
    
    if (!allTab || !favoritesTab) return;
    
    if (tab === 'all') {
        allTab.className = 'browse-tab-active py-2 px-4 flex-1 text-center';
        favoritesTab.className = 'browse-tab py-2 px-4 flex-1 text-center';
    } else {
        allTab.className = 'browse-tab py-2 px-4 flex-1 text-center';
        favoritesTab.className = 'browse-tab-active py-2 px-4 flex-1 text-center';
    }
    
    // Update exercise list based on selected tab
    loadExerciseList(container, tab);
}

/**
 * Load the exercise list into the browse section
 * @param {HTMLElement} container - Container element
 * @param {string} filterType - Filter type ('all' or 'favorites')
 */
async function loadExerciseList(container, filterType = 'all') {
    const listContainer = container.querySelector('#exerciseListContainer');
    if (!listContainer) return;
    
    // Show loading indicator
    listContainer.innerHTML = `
        <div class="loading-container flex justify-center py-4">
            <div class="loading-spinner"></div>
            <span class="ml-2">Loading exercises...</span>
        </div>
    `;
    
    try {
        // Load exercises
        const allExercises = await exerciseManager.ensureExercisesLoaded();
        
        // Get favorites
        const favorites = getFavorites();
        
        // Filter exercises if needed
        const exercises = filterType === 'favorites'
            ? allExercises.filter(ex => favorites.includes(ex.id))
            : allExercises;
        
        // Check if we have any exercises to display
        if (exercises.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    ${filterType === 'favorites' 
                        ? 'No favorite exercises yet. Click the star icon to add favorites.' 
                        : 'No exercises found.'}
                </div>
            `;
            return;
        }
        
        // Create HTML for exercise list
        let html = '';
        
        exercises.forEach((exercise, index) => {
            const isFavorite = favorites.includes(exercise.id);
            
            html += `
                <div class="exercise-list-item mb-2 border border-gray-200 rounded-md overflow-hidden">
                    <!-- Header row -->
                    <div class="flex justify-between items-center p-3 bg-white">
                        <div class="font-medium">${exercise.name}</div>
                        <div class="flex space-x-2">
                            <!-- Favorite toggle -->
                            <button type="button" class="favorite-toggle-btn" data-exercise-id="${exercise.id}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                ${isFavorite 
                                    ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                       </svg>`
                                    : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                       </svg>`
                                }
                            </button>
                            
                            <!-- Expand/collapse toggle -->
                            <button type="button" class="toggle-details-btn" data-index="${index}" title="Toggle details">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            <!-- Add button -->
                            <button type="button" class="add-exercise-btn" data-exercise-name="${exercise.name}" title="Add to session">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Collapsible description (initially hidden) -->
                    <div class="exercise-details hidden p-3 bg-gray-50 border-t border-gray-200">
                        <p class="text-sm text-gray-700 whitespace-pre-wrap">${exercise.description}</p>
                    </div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        
        // Add event listeners to the exercise list items
        setupExerciseListEventListeners(container);
        
    } catch (error) {
        console.error('Error loading exercise list:', error);
        listContainer.innerHTML = `
            <div class="text-center py-4 text-red-500">
                <p>Error loading exercises. Please try again.</p>
                <button id="retryLoadExercises" class="mt-2 btn-base btn-secondary btn-sm">
                    Retry
                </button>
            </div>
        `;
        
        // Add retry handler
        container.querySelector('#retryLoadExercises')?.addEventListener('click', () => {
            loadExerciseList(container, filterType);
        });
    }
}

/**
 * Set up event listeners for exercise list items
 * @param {HTMLElement} container - Container element
 */
function setupExerciseListEventListeners(container) {
    // Favorite toggle buttons
    container.querySelectorAll('.favorite-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent event from bubbling up to form
            e.preventDefault();
            e.stopPropagation();
            
            const exerciseId = btn.dataset.exerciseId;
            toggleFavorite(exerciseId);
            
            // Refresh the exercise list to update the UI
            // Check which tab is active
            const favoritesTabActive = container.querySelector('#favoritesTab').classList.contains('browse-tab-active');
            loadExerciseList(container, favoritesTabActive ? 'favorites' : 'all');
        });
    });
    
    // Toggle details buttons
    container.querySelectorAll('.toggle-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent both default action and bubbling
            e.preventDefault();
            e.stopPropagation();
            
            const parent = btn.closest('.exercise-list-item');
            const details = parent.querySelector('.exercise-details');
            
            if (details) {
                details.classList.toggle('hidden');
                
                // Update button icon
                if (details.classList.contains('hidden')) {
                    btn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    `;
                } else {
                    btn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                    `;
                }
            }
            
            // Return false to be extra sure it doesn't propagate
            return false;
        });
        
        // Also add event listeners to any child elements
        const svg = btn.querySelector('svg');
        if (svg) {
            svg.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Manually trigger the parent button's click
                btn.click();
                return false;
            });
            
            // And to the path inside the svg
            const path = svg.querySelector('path');
            if (path) {
                path.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Manually trigger the parent button's click
                    btn.click();
                    return false;
                });
            }
        }
    });
    
    // Add exercise buttons
    container.querySelectorAll('.add-exercise-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent event from bubbling up to form
            e.preventDefault();
            e.stopPropagation();
            
            const exerciseName = btn.dataset.exerciseName;
            
            // Add the exercise to the selection
            toggleExerciseSelection(exerciseName, true, container);
            
            // Show a brief confirmation
            const parent = btn.closest('.exercise-list-item');
            
            // Briefly highlight the item
            parent.classList.add('bg-green-50');
            setTimeout(() => {
                parent.classList.remove('bg-green-50');
            }, 500);
            
            // Update button to a checkmark briefly
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            `;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1000);
        });
    });
    
    // Stop clicks on exercise details from bubbling to parent elements
    container.querySelectorAll('.exercise-details').forEach(details => {
        details.addEventListener('click', (e) => {
            // Prevent click from bubbling up to parent elements
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Prevent clicks on the exercise items from submitting the form
    container.querySelectorAll('.exercise-list-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Only stop propagation if we're not clicking a button that needs to submit
            if (!e.target.closest('#saveSessionBtn') && !e.target.closest('[data-close-modal]')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // Also specifically handle the header row of each exercise
    container.querySelectorAll('.exercise-list-item > div:first-child').forEach(header => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Also add a specific handler for the entire browse section
    const browseSection = container.querySelector('.browse-exercises-section');
    if (browseSection) {
        browseSection.addEventListener('click', (e) => {
            // Only stop propagation if it's not a button that needs to submit the form
            if (!e.target.closest('#saveSessionBtn') && !e.target.closest('[data-close-modal]')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
}

/**
 * Handle search input
 * @param {string} searchTerm - Search term
 * @param {HTMLElement} container - Container element
 */
async function handleSearch(searchTerm, container) {
    const dropdown = container.querySelector('#exerciseDropdown');
    const searchSpinner = container.querySelector('#searchSpinner');
    
    try {
        // Show search indicator
        if (searchSpinner) searchSpinner.classList.remove('hidden');
        
        // Get all exercises
        const allExercises = await exerciseManager.ensureExercisesLoaded();
        
        // Filter exercises
        const filteredExercises = searchTerm.length > 0 
            ? allExercises.filter(ex => 
                ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.description.toLowerCase().includes(searchTerm.toLowerCase()))
            : allExercises;
        
        // Get currently selected exercises
        const selectedExercises = getSelectedExercises(container);
        
        // Render dropdown
        if (dropdown) {
            dropdown.innerHTML = '';
            
            // If no search results
            if (filteredExercises.length === 0) {
                dropdown.innerHTML = `
                    <div class="p-3 text-center text-gray-500">
                        No exercises found matching "${searchTerm}"
                    </div>
                `;
                dropdown.classList.remove('hidden');
                return;
            }
            
            // Create dropdown items
            filteredExercises.forEach(exercise => {
                const isSelected = selectedExercises.includes(exercise.name);
                
                const item = document.createElement('div');
                item.className = `exercise-dropdown-item p-2 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`;
                item.tabIndex = 0; // Make focusable
                item.innerHTML = `
                    <div class="flex items-center">
                        <div class="mr-2">
                            <input type="checkbox" id="ex-${exercise.id}" class="form-checkbox h-4 w-4 text-blue-600" 
                                ${isSelected ? 'checked' : ''}>
                        </div>
                        <div class="flex-grow">
                            <div class="font-medium">${exercise.name}</div>
                        </div>
                        <button type="button" class="exercise-info-btn text-blue-600 hover:text-blue-800 ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                `;
                
                // Set up item click handler
                item.addEventListener('click', (e) => {
                    // Stop propagation to prevent form submission
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Ignore if clicking on info button
                    if (e.target.closest('.exercise-info-btn')) return;
                    
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    
                    toggleExerciseSelection(exercise.name, checkbox.checked, container);
                });
                
                // Info button handler
                item.querySelector('.exercise-info-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showExerciseInfo(exercise);
                });
                
                // Keyboard handling
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        // Toggle selection
                        const checkbox = item.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                        toggleExerciseSelection(exercise.name, checkbox.checked, container);
                        e.preventDefault();
                    } else if (e.key === 'ArrowDown') {
                        // Focus next item
                        const nextItem = item.nextElementSibling;
                        if (nextItem) {
                            nextItem.focus();
                            e.preventDefault();
                        }
                    } else if (e.key === 'ArrowUp') {
                        // Focus previous item
                        const prevItem = item.previousElementSibling;
                        if (prevItem) {
                            prevItem.focus();
                            e.preventDefault();
                        } else {
                            // Focus back to search input
                            container.querySelector('#exerciseSearchInput')?.focus();
                            e.preventDefault();
                        }
                    }
                });
                
                dropdown.appendChild(item);
            });
            
            // Show dropdown
            dropdown.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error handling exercise search:', error);
        
        if (dropdown) {
            dropdown.innerHTML = `
                <div class="p-3 text-center text-red-500">
                    Error loading exercises. Please try again.
                </div>
            `;
            dropdown.classList.remove('hidden');
        }
    } finally {
        // Hide search indicator
        if (searchSpinner) searchSpinner.classList.add('hidden');
    }
}

/**
 * Toggle selection of an exercise
 * @param {string} exerciseName - Exercise name
 * @param {boolean} selected - Whether to select or deselect
 * @param {HTMLElement} container - Container element
 */
function toggleExerciseSelection(exerciseName, selected, container) {
    // Get current selection
    const currentSelection = getSelectedExercises(container);
    
    // Update selection
    let newSelection;
    if (selected) {
        // Add if not already selected
        if (!currentSelection.includes(exerciseName)) {
            newSelection = [...currentSelection, exerciseName];
        } else {
            newSelection = currentSelection;
        }
    } else {
        // Remove if selected
        newSelection = currentSelection.filter(name => name !== exerciseName);
    }
    
    // Update container dataset
    container.dataset.selectedExercises = JSON.stringify(newSelection);
    
    // Render selected exercises
    renderSelectedExercises(container);
    
    // Call onChange callback if exists
    if (typeof container._onChangeCallback === 'function') {
        container._onChangeCallback(newSelection);
    }
}

/**
 * Render selected exercises
 * @param {HTMLElement} container - Container element
 */
function renderSelectedExercises(container) {
    const selectedExercises = getSelectedExercises(container);
    const selectedList = container.querySelector('#selectedExercisesList');
    const noExercisesMessage = container.querySelector('#noExercisesMessage');
    
    if (!selectedList) return;
    
    // Clear list
    selectedList.innerHTML = '';
    
    // Show/hide message
    if (selectedExercises.length === 0) {
        if (noExercisesMessage) noExercisesMessage.classList.remove('hidden');
        return;
    } else {
        if (noExercisesMessage) noExercisesMessage.classList.add('hidden');
    }
    
    // Create a tag for each selected exercise
    selectedExercises.forEach(exerciseName => {
        const tag = document.createElement('div');
        tag.className = 'exercise-tag bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center';
        tag.innerHTML = `
            <span class="mr-1">${exerciseName}</span>
            <button type="button" class="exercise-remove-btn text-blue-600 hover:text-blue-800 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        
        // Remove button click handler
        tag.querySelector('.exercise-remove-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleExerciseSelection(exerciseName, false, container);
        });
        
        selectedList.appendChild(tag);
    });
}

/**
 * Show error in the selector
 * @param {HTMLElement} container - Container element
 */
function showSelectorError(container) {
    const selectedContainer = container.querySelector('#selectedExercisesContainer');
    if (!selectedContainer) return;
    
    selectedContainer.innerHTML = `
        <div class="text-center py-4 text-red-500">
            <p>Error loading exercises.</p>
            <button type="button" id="retrySelectorBtn" class="btn-base btn-secondary btn-sm mt-2">
                Retry
            </button>
        </div>
    `;
    
    // Add retry button handler
    container.querySelector('#retrySelectorBtn')?.addEventListener('click', async () => {
        try {
            await exerciseManager.ensureExercisesLoaded();
            renderSelector(container);
            renderSelectedExercises(container);
        } catch (error) {
            console.error('Error retrying exercise load:', error);
            showSelectorError(container);
        }
    });
}

/**
 * Show exercise info modal
 * @param {Object} exercise - Exercise data
 */
function showExerciseInfo(exercise) {
    modal.createModal('exerciseInfoModal', {
        title: exercise.name,
        content: `<div class="p-2 whitespace-pre-wrap">${exercise.description}</div>`,
        size: 'medium'
    });
    
    modal.openModal('exerciseInfoModal');
}

/**
 * Prompt for a custom exercise name
 * @param {HTMLElement} container - Container element
 */
function promptForCustomExercise(container) {
    // Create a modal for custom exercise input
    const content = `
        <div class="p-4">
            <div class="mb-4">
                <label for="customExerciseName" class="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Name
                </label>
                <input type="text" id="customExerciseName" class="input-base w-full" placeholder="Enter exercise name">
                <p id="customExerciseError" class="text-red-500 text-sm mt-1 hidden"></p>
            </div>
            <div class="flex justify-end space-x-2">
                <button type="button" class="btn-base btn-secondary" data-close-modal>Cancel</button>
                <button type="button" id="saveCustomExerciseBtn" class="btn-base btn-primary">Add Exercise</button>
            </div>
        </div>
    `;
    
    modal.createModal('customExerciseModal', {
        title: 'Add Custom Exercise',
        content,
        size: 'small',
        onOpen: () => {
            // Focus the input field
            setTimeout(() => {
                document.getElementById('customExerciseName')?.focus();
            }, 100);
            
            // Set up save button
            document.getElementById('saveCustomExerciseBtn')?.addEventListener('click', () => {
                addCustomExercise(container);
            });
            
            // Enter key handler
            document.getElementById('customExerciseName')?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomExercise(container);
                }
            });
        }
    });
    
    modal.openModal('customExerciseModal');
}

/**
 * Add a custom exercise
 * @param {HTMLElement} container - Container element
 */
function addCustomExercise(container) {
    const nameInput = document.getElementById('customExerciseName');
    const errorElement = document.getElementById('customExerciseError');
    
    if (!nameInput) return;
    
    const exerciseName = nameInput.value.trim();
    
    // Validate
    if (!exerciseName) {
        if (errorElement) {
            errorElement.textContent = 'Please enter an exercise name';
            errorElement.classList.remove('hidden');
        }
        return;
    }
    
    // Check if already selected
    const selectedExercises = getSelectedExercises(container);
    if (selectedExercises.includes(exerciseName)) {
        if (errorElement) {
            errorElement.textContent = 'This exercise is already selected';
            errorElement.classList.remove('hidden');
        }
        return;
    }
    
    // Add to selection
    toggleExerciseSelection(exerciseName, true, container);
    
    // Close modal
    modal.closeModal('customExerciseModal');
    
    // Show success message
    ui.showAlert(`Added "${exerciseName}" to the session`, 'success');
}

/**
 * Get selected exercises
 * @param {HTMLElement} container - Container element
 * @returns {Array} - Array of selected exercise names
 */
function getSelectedExercises(container) {
    try {
        return JSON.parse(container.dataset.selectedExercises || '[]');
    } catch (error) {
        console.error('Error parsing selected exercises:', error);
        return [];
    }
}

/**
 * Get the current selection
 * @param {HTMLElement} container - Container element
 * @returns {Array} - Array of selected exercise names
 */
export function getSelection(container) {
    return getSelectedExercises(container);
}

/**
 * Set the selection
 * @param {HTMLElement} container - Container element
 * @param {Array} exercises - Array of exercise names
 */
export function setSelection(container, exercises) {
    container.dataset.selectedExercises = JSON.stringify(exercises || []);
    renderSelectedExercises(container);
    
    // Call onChange callback if exists
    if (typeof container._onChangeCallback === 'function') {
        container._onChangeCallback(exercises);
    }
}

/**
 * Toggle favorite status of an exercise
 * @param {string} exerciseId - Exercise ID to toggle
 */
function toggleFavorite(exerciseId) {
    const favorites = getFavorites();
    
    if (favorites.includes(exerciseId)) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(id => id !== exerciseId);
        saveFavorites(updatedFavorites);
    } else {
        // Add to favorites
        saveFavorites([...favorites, exerciseId]);
    }
}

/**
 * Get favorites from localStorage
 * @returns {Array} - Array of favorite exercise IDs
 */
function getFavorites() {
    if (cachedFavorites !== null) {
        return cachedFavorites;
    }
    
    try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!storedFavorites) {
            return [];
        }
        
        const parsedFavorites = JSON.parse(storedFavorites);
        cachedFavorites = Array.isArray(parsedFavorites) ? parsedFavorites : [];
        return cachedFavorites;
    } catch (error) {
        console.error('Error reading favorites from localStorage:', error);
        return [];
    }
}

/**
 * Save favorites to localStorage
 * @param {Array} favorites - Array of favorite exercise IDs
 */
function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        cachedFavorites = favorites;
    } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
    }
}

// Add a global document level handler for toggle details buttons
document.addEventListener('click', function(e) {
    // Check if the clicked element is a toggle-details-btn or inside one
    const toggleBtn = e.target.closest('.toggle-details-btn');
    if (toggleBtn) {
        // Found a toggle button - prevent form submission
        e.preventDefault();
        e.stopPropagation();
        
        // Get parent and details element
        const parent = toggleBtn.closest('.exercise-list-item');
        const details = parent?.querySelector('.exercise-details');
        
        if (details) {
            // Toggle visibility
            details.classList.toggle('hidden');
            
            // Update the button icon based on visibility
            if (details.classList.contains('hidden')) {
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                `;
            } else {
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                `;
            }
        }
        
        return false;
    }
}, true); // Use capturing phase for this listener