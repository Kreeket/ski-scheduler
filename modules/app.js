// app.js - Main application module
import * as auth from './api/auth.js';
import * as calendar from './components/calendar.js';
import * as sessionList from './components/session-list.js';
import * as exerciseManager from './components/exercise-manager.js';
import * as ui from './ui/common.js';
import * as publicSessions from './components/public-sessions.js';

// State
let selectedGroup = null;
let calendarInitialized = false;

/**
 * Initialize the application
 */
export async function init() {
    console.log('Initializing app module...');
    
    try {
        // First, ensure all DOM elements exist before attaching events
        ensureElementsExist();
        
        // Load public sessions for non-logged in users
        await publicSessions.initPublicSessions();
        
        // Set up login functionality
        setupLoginForm();
        
        // Set up group buttons
        setupGroupButtons();
        
        // Set up logout buttons
        setupLogoutButtons();
        
        // Set up exercise manager button (if it exists)
        const manageExercisesBtn = document.getElementById('manageExercisesBtn');
        if (manageExercisesBtn) {
            manageExercisesBtn.addEventListener('click', () => {
                exerciseManager.showExercisesModal();
            });
        }
        
        // Ensure exercise modals are hidden on page load
        const exercisesModal = document.getElementById('exercisesModal');
        if (exercisesModal) {
            ui.hideElement(exercisesModal);
        }
        
        // Load exercises in the background
        exerciseManager.loadExercises().catch(error => {
            console.warn('Non-critical error loading exercises:', error);
        });
        
        // Check if user is already authenticated
        if (auth.isAuthenticated()) {
            console.log('User is already authenticated, showing group selection');
            ui.hideElement(document.getElementById('authSection'));
            ui.showElement(document.getElementById('groupSelection'));
        } else {
            console.log('User is not authenticated, showing login form');
            // Make sure auth section is visible and group selection is hidden
            ui.showElement(document.getElementById('authSection'));
            ui.hideElement(document.getElementById('groupSelection'));
            ui.hideElement(document.getElementById('appContent'));
        }
        
        // Setup modal close handlers
        setupModalCloseHandlers();
        
        console.log('App initialization complete');
    } catch (error) {
        console.error('Error in app initialization:', error);
        throw error; // Re-throw for the main script to handle
    }
}

/**
 * Set up logout buttons
 */
function setupLogoutButtons() {
    // Logout button on group selection screen
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Logout button in the app header
    const appLogoutBtn = document.getElementById('appLogoutBtn');
    if (appLogoutBtn) {
        appLogoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Handle logout action
 */
function handleLogout() {
    // Show confirmation
    ui.showConfirm('Are you sure you want to log out?').then((confirmed) => {
        if (confirmed) {
            // Clear authentication
            auth.logout();
            
            // Clean up calendar if needed
            if (calendarInitialized) {
                calendar.destroy();
                calendarInitialized = false;
            }
            
            // Reset group selection
            selectedGroup = null;
            
            // Show login screen
            ui.hideElement(document.getElementById('groupSelection'));
            ui.hideElement(document.getElementById('appContent'));
            ui.showElement(document.getElementById('authSection'));
            
            // Show success message
            ui.showAlert('You have been logged out.', 'success');
        }
    });
}

/**
 * Check if critical DOM elements exist
 */
function ensureElementsExist() {
    const criticalElements = [
        'password', 'loginBtn', 'authSection', 'groupSelection', 
        'appContent', 'loadingIndicatorWrapper'
    ];
    
    const missingElements = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        throw new Error(`Missing critical DOM elements: ${missingElements.join(', ')}`);
    }
}

/**
 * Set up login form and handler
 */
function setupLoginForm() {
    // Auto-focus on password field
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.focus();
    }

    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Allow login with Enter key
    if (passwordField) {
        passwordField.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

/**
 * Handle login attempt
 */
async function handleLogin() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) {
        console.error('Password input element not found');
        return;
    }
    
    const password = passwordInput.value;
    
    if (!password.trim()) {
        ui.showAlert('Please enter a password', 'warning');
        return;
    }
    
    try {
        ui.setButtonLoading('loginBtn', true);
        
        const success = await auth.authenticateUser(password);
        
        if (success) {
            console.log('Authentication successful');
            // Store authentication status
            auth.setAuthenticated(true);
            
            // Show group selection
            ui.hideElement(document.getElementById('authSection'));
            ui.showElement(document.getElementById('groupSelection'));
            
            // Clear password field
            passwordInput.value = '';
        } else {
            ui.showAlert('Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        ui.showAlert(error.message, 'error');
    } finally {
        ui.setButtonLoading('loginBtn', false);
    }
}

/**
 * Set up group selection buttons
 */
function setupGroupButtons() {
    // Group selection buttons
    const group1Btn = document.getElementById('group1Btn');
    const group2Btn = document.getElementById('group2Btn');
    const group3Btn = document.getElementById('group3Btn');
    
    if (group1Btn) group1Btn.addEventListener('click', () => selectGroup('group1'));
    if (group2Btn) group2Btn.addEventListener('click', () => selectGroup('group2'));
    if (group3Btn) group3Btn.addEventListener('click', () => selectGroup('group3'));

    // Change group button
    const changeGroupBtn = document.getElementById('changeGroupBtn');
    if (changeGroupBtn) {
        changeGroupBtn.addEventListener('click', () => {
            ui.showElement(document.getElementById('groupSelection'));
            ui.hideElement(document.getElementById('appContent'));
            selectedGroup = null;
            
            // Clean up calendar resources when changing groups
            if (calendarInitialized) {
                calendar.destroy();
                calendarInitialized = false;
            }
        });
    }
}

/**
 * Select a group and initialize main app
 * @param {string} group - Group ID
 */
function selectGroup(group) {
    console.log(`Selecting group: ${group}`);
    selectedGroup = group;
    ui.hideElement(document.getElementById('groupSelection'));
    ui.showElement(document.getElementById('appContent'));
    ui.showLoadingIndicator();
    
    // Update visual indicator for selected group
    updateGroupButtonStyles(group);
    
    // Update group name in header
    const currentGroupDisplay = document.getElementById('currentGroupDisplay');
    if (currentGroupDisplay) {
        currentGroupDisplay.textContent = group.replace('group', 'Group ');
    }
    
    try {
        // Initialize components in the correct order:
        
        // 1. First initialize session list with the group
        sessionList.initSessionList('sessionsContainer', group, handleSessionChanged);
        
        // 2. Then initialize calendar and connect it to the session list via callback
        calendar.initCalendar('calendar', group, handleDateSelected);
        calendarInitialized = true;
        
        // Initialize new session button
        const newSessionBtn = document.getElementById('newSessionBtn');
        if (newSessionBtn) {
            newSessionBtn.addEventListener('click', () => {
                sessionList.createNewSession(new Date());
            });
        }
    } catch (error) {
        console.error('Error initializing app components:', error);
        ui.showAlert('Error initializing application. Please try refreshing the page.', 'error');
    } finally {
        ui.hideLoadingIndicator();
    }
}

/**
 * Handle date selection in calendar
 * @param {string} dateStr - Selected date string
 * @param {Array} sessions - Sessions for the selected date
 */
function handleDateSelected(dateStr, sessions) {
    // Only update the session list, don't reload the calendar
    sessionList.showSessionsForDate(dateStr, sessions);
}

/**
 * Handle session changes (create/update/delete)
 * This is called after session operations to ensure the calendar reflects changes
 */
function handleSessionChanged() {
    // Just refresh the calendar when sessions are modified
    // It will keep the currently selected date
    if (calendarInitialized) {
        calendar.refresh();
    }
}

/**
 * Update the visual styles of group buttons
 * @param {string} selectedGroup - ID of the selected group
 */
function updateGroupButtonStyles(selectedGroup) {
    const groupButtons = document.querySelectorAll('.group-button');
    groupButtons.forEach(button => {
        const isSelected = button.id === `${selectedGroup}Btn`;
        button.classList.toggle('bg-accent', isSelected);
        button.classList.toggle('bg-primary', !isSelected);
    });
}

/**
 * Set up modal close handlers
 */
function setupModalCloseHandlers() {
    // Close buttons for modals
    const closeExercisesModal = document.getElementById('closeExercisesModal');
    if (closeExercisesModal) {
        closeExercisesModal.addEventListener('click', () => {
            ui.hideElement(document.getElementById('exercisesModal'));
        });
    }
    
    // Modal close buttons with class
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        const modal = btn.closest('.modal-container');
        if (modal) {
            btn.addEventListener('click', () => {
                ui.hideElement(modal);
            });
        }
    });
    
    // Exercise details modal close button (might be created dynamically)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'closeExerciseDetailsModal') {
            ui.hideElement(document.getElementById('exerciseDetailsModal'));
        }
    });
    
    // Handle clicks outside modals
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-container')) {
            ui.hideElement(event.target);
        }
    });
}