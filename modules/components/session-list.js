// session-list.js - Manages displaying sessions in a list view
import * as utils from '../utils/date-utils.js';
import * as sessionsApi from '../api/sessions.js';
import * as calendar from './calendar.js';
import * as ui from '../ui/common.js';
import * as sessionForm from './session-form.js';

let selectedGroup = null;
let expandedSessionId = null;
let onSessionChangedCallback = null;
let isUpdating = false;
let currentSelectedDate = null; // Track the currently selected date

/**
 * Initialize the session list component
 * @param {string} containerId - ID of the container element
 * @param {string} group - Selected group
 * @param {Function} onSessionChanged - Callback when a session is created/updated/deleted
 */
export function initSessionList(containerId, group, onSessionChanged) {
    console.log(`Initializing session list with container ID: ${containerId}, group: ${group}`);
    selectedGroup = group;
    onSessionChangedCallback = onSessionChanged;
    
    // Clear any expanded session ID
    expandedSessionId = null;
}

/**
 * Show sessions for a specific date
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {Array} sessions - Array of session objects for this date
 */
export function showSessionsForDate(dateStr, sessions = []) {
    // Store the current date for future reference
    currentSelectedDate = dateStr;
    
    // Prevent concurrent updates that could cause DOM conflicts
    if (isUpdating) {
        console.log('Already updating session list, deferring update');
        setTimeout(() => showSessionsForDate(dateStr, sessions), 100);
        return;
    }
    
    try {
        isUpdating = true;
        console.log(`Showing sessions for date: ${dateStr}`, sessions);
        
        const sessionsList = document.getElementById('sessionsContainer');
        if (!sessionsList) {
            console.error('Sessions container not found');
            return;
        }
        
        // Clear current sessions
        sessionsList.innerHTML = '';
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            console.error(`Invalid date: ${dateStr}`);
            sessionsList.innerHTML = '<div class="text-gray-500 italic">Invalid date format</div>';
            return;
        }
        
        // Format date for display (e.g., "Wednesday, Feb 26")
        const formattedDate = utils.formatDateForDisplay(date);
        
        // Date header
        const header = document.createElement('div');
        header.className = 'text-lg font-semibold mb-3';
        header.textContent = formattedDate;
        header.dataset.fullDate = dateStr; // Store the full date string in a data attribute
        sessionsList.appendChild(header);
        
        // Add new session button for this date
        const addButton = document.createElement('button');
        addButton.className = 'btn-base btn-secondary mb-4 text-sm';
        addButton.textContent = '+ Add Session on this date';
        addButton.addEventListener('click', () => {
            createNewSession(date);
        });
        sessionsList.appendChild(addButton);
        
        // If no sessions for this date
        if (!sessions || sessions.length === 0) {
            const noSessions = document.createElement('div');
            noSessions.className = 'text-gray-500 italic';
            noSessions.textContent = 'No sessions scheduled for this date';
            sessionsList.appendChild(noSessions);
            return;
        }
        
        // Sort sessions by start time
        const sortedSessions = [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        // Create session cards
        sortedSessions.forEach(session => {
            const sessionCard = createSessionCard(session);
            sessionsList.appendChild(sessionCard);
        });
        
        // Scroll to sessions list (using smooth scroll)
        sessionsList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error showing sessions for date:', error);
    } finally {
        isUpdating = false;
    }
}

/**
 * Show upcoming sessions in the list
 * @param {Array} sessions - Array of session objects
 */
export function showUpcomingSessions(sessions = []) {
    // Prevent concurrent updates
    if (isUpdating) {
        console.log('Already updating session list, deferring update');
        setTimeout(() => showUpcomingSessions(sessions), 100);
        return;
    }
    
    try {
        isUpdating = true;
        
        const sessionsContainer = document.getElementById('sessionsContainer');
        if (!sessionsContainer) {
            console.error('Sessions container not found');
            return;
        }
        
        sessionsContainer.innerHTML = '';
        
        if (sessions.length === 0) {
            sessionsContainer.innerHTML = '<div class="text-gray-500 italic">No upcoming sessions scheduled</div>';
            return;
        }
        
        // Get today's date
        const today = new Date();
        const todayStr = utils.formatDate(today);
        
        // Filter for upcoming sessions (today and later)
        const upcomingSessions = sessions.filter(session => session.date >= todayStr);
        
        // Sort by date and time
        upcomingSessions.sort((a, b) => {
            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }
            return a.startTime.localeCompare(b.startTime);
        });
        
        // Take only the next 5 sessions
        const nextSessions = upcomingSessions.slice(0, 5);
        
        // Group sessions by date
        const sessionsByDate = {};
        nextSessions.forEach(session => {
            if (!sessionsByDate[session.date]) {
                sessionsByDate[session.date] = [];
            }
            sessionsByDate[session.date].push(session);
        });
        
        // Create headers and cards for each date
        Object.keys(sessionsByDate).sort().forEach(date => {
            const dateObj = new Date(date);
            const dateHeader = document.createElement('div');
            dateHeader.className = 'text-lg font-semibold mb-2 mt-4';
            dateHeader.textContent = utils.formatDateForDisplay(dateObj);
            dateHeader.dataset.fullDate = date; // Store the full date
            sessionsContainer.appendChild(dateHeader);
            
            // Add sessions for this date
            sessionsByDate[date].forEach(session => {
                const sessionCard = createSessionCard(session);
                sessionsContainer.appendChild(sessionCard);
            });
        });
    } catch (error) {
        console.error('Error showing upcoming sessions:', error);
    } finally {
        isUpdating = false;
    }
}

/**
 * Create a new session
 * @param {Date} date - Date for the new session
 */
export function createNewSession(date) {
    const formattedDate = utils.formatDate(date);
    
    // Create empty session template
    const newSession = {
        id: null,
        group: selectedGroup,
        title: "",
        date: formattedDate,
        startTime: utils.formatTime(new Date()),
        endTime: utils.formatTime(new Date(new Date().getTime() + 60 * 60 * 1000)), // 1 hour later
        location: "",
        exercises: [],
        leaders: "",
        notes: ""
    };
    
    // Use the session form component
    sessionForm.showSessionForm('Create New Session', newSession, async (sessionData) => {
        try {
            ui.showLoadingIndicator();
            const result = await sessionsApi.createSession(sessionData);
            
            if (result) {
                // Notify that a session has been changed, which will refresh the calendar
                if (typeof onSessionChangedCallback === 'function') {
                    onSessionChangedCallback();
                } else {
                    // If callback is not working, refresh calendar directly
                    calendar.refresh();
                }
                
                // Reload sessions for this date
                const sessions = await sessionsApi.getSessionsByDate(formattedDate, selectedGroup);
                
                // Also update current selected date to match the new session
                currentSelectedDate = formattedDate;
                
                showSessionsForDate(formattedDate, sessions);
                
                ui.showAlert("Session created successfully!", "success");
            }
        } catch (error) {
            console.error("Error creating session:", error);
            ui.showAlert("Failed to create session: " + error.message, "error");
        } finally {
            ui.hideLoadingIndicator();
        }
    });
}

/**
 * Edit an existing session
 * @param {string} sessionId - ID of the session to edit
 */
export async function editSession(sessionId) {
    try {
        ui.showLoadingIndicator();
        const session = await sessionsApi.getSessionById(sessionId);
        
        if (!session) {
            ui.showAlert('Failed to load session data', 'error');
            return;
        }
        
        // Store the current date for later reference
        const originalDate = session.date;
        
        // Use the session form component
        sessionForm.showSessionForm('Edit Session', session, async (sessionData) => {
            try {
                ui.showLoadingIndicator();
                const result = await sessionsApi.updateSession(sessionId, sessionData);
                
                if (result) {
                    // Refresh calendar data first
                    calendar.refresh();
                    
                    // Then notify about the change
                    if (typeof onSessionChangedCallback === 'function') {
                        onSessionChangedCallback();
                    }
                    
                    // Check if the date was changed
                    if (originalDate !== sessionData.date) {
                        // If the date changed, we need to update the current selected date
                        currentSelectedDate = sessionData.date;
                        calendar.selectDate(sessionData.date);
                        
                        // Use latest data from calendar
                        const cachedSessions = calendar.getSessionsForDate(sessionData.date);
                        showSessionsForDate(sessionData.date, cachedSessions);
                    } else {
                        // Use latest data from calendar for the original date
                        const cachedSessions = calendar.getSessionsForDate(originalDate);
                        showSessionsForDate(originalDate, cachedSessions);
                    }
                    
                    ui.showAlert("Session updated successfully!", "success");
                }
            } catch (error) {
                console.error("Error updating session:", error);
                ui.showAlert("Failed to update session: " + error.message, "error");
            } finally {
                ui.hideLoadingIndicator();
            }
        });
    } catch (error) {
        console.error("Error loading session for edit:", error);
        ui.showAlert("Failed to load session: " + error.message, "error");
    } finally {
        ui.hideLoadingIndicator();
    }
}

/**
 * Delete a session
 * @param {string} sessionId - ID of the session to delete
 */
export async function deleteSession(sessionId) {
    try {
        ui.showLoadingIndicator();
        const session = await sessionsApi.getSessionById(sessionId);
        if (!session) {
            ui.showAlert("Session not found", "error");
            return;
        }
        
        const sessionDate = session.date;
        
        const confirmDelete = await ui.showConfirm('Are you sure you want to delete this session?');
        if (confirmDelete) {
            try {
                const success = await sessionsApi.deleteSession(sessionId);
                
                if (success) {
                    // Reset expanded session ID if it was the deleted one
                    if (expandedSessionId === sessionId) {
                        expandedSessionId = null;
                    }
                    
                    // Refresh calendar data
                    calendar.refresh();
                    
                    // Notify that a session has been changed
                    if (typeof onSessionChangedCallback === 'function') {
                        onSessionChangedCallback();
                    }
                    
                    // Get updated sessions from the cache
                    const cachedSessions = calendar.getSessionsForDate(sessionDate);
                    showSessionsForDate(sessionDate, cachedSessions);
                    
                    ui.showAlert("Session deleted successfully!", "success");
                }
            } catch (error) {
                console.error("Error deleting session:", error);
                ui.showAlert("Failed to delete session: " + error.message, "error");
            }
        }
    } catch (error) {
        console.error("Error loading session for delete:", error);
        ui.showAlert("Failed to load session: " + error.message, "error");
    } finally {
        ui.hideLoadingIndicator();
    }
}

/**
 * Create a session card for display
 * @param {Object} session - Session data
 * @returns {HTMLElement} - Session card element
 */
function createSessionCard(session) {
    const isExpanded = session.id === expandedSessionId;
    
    const card = document.createElement('div');
    card.className = 'session-card mb-3';
    card.dataset.sessionId = session.id;
    card.dataset.sessionDate = session.date; // Store the session date
    
    let cardContent = `
        <div class="cursor-pointer" data-session-id="${session.id}">
            <div class="flex justify-between items-center">
                <div class="font-semibold">${session.title || 'Untitled Session'}</div>
                <div class="text-sm text-gray-600">${utils.formatTimeForDisplay(session.startTime)} - ${utils.formatTimeForDisplay(session.endTime)}</div>
            </div>
            ${session.location ? `<div class="text-sm text-gray-600 mt-1">📍 ${session.location}</div>` : ''}
    `;
    
    if (isExpanded) {
        cardContent += `
            <div class="mt-3 pt-2 border-t">
                ${session.leaders ? `<div class="text-sm mt-2"><span class="font-semibold">Leaders:</span> ${session.leaders}</div>` : ''}
        `;
        
        // Exercise section
        if (session.exercises && session.exercises.length > 0) {
            cardContent += `
                <div class="mt-3">
                    <div class="font-semibold text-sm mb-1">Exercises:</div>
                    <div class="flex flex-wrap gap-1 mt-1">
            `;
            
            session.exercises.forEach(exerciseName => {
                cardContent += `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${exerciseName}</span>`;
            });
            
            cardContent += `
                    </div>
                </div>
            `;
        }
        
        if (session.notes) {
            cardContent += `
                <div class="mt-3">
                    <div class="font-semibold text-sm">Notes:</div>
                    <div class="text-sm text-gray-600 mt-1">${session.notes}</div>
                </div>
            `;
        }
        
        // Action buttons
        cardContent += `
            <div class="flex justify-end mt-3 pt-2 border-t space-x-2">
                <button class="edit-session-btn btn-base btn-secondary text-xs py-1 px-2">Edit</button>
                <button class="delete-session-btn btn-base btn-danger text-xs py-1 px-2">Delete</button>
            </div>
        `;
    }
    
    cardContent += `</div>`;
    card.innerHTML = cardContent;
    
    // Add click event to toggle expansion
    card.querySelector(`[data-session-id="${session.id}"]`).addEventListener('click', (e) => {
        // Only toggle if not clicking on a button
        if (!e.target.closest('button')) {
            toggleSessionExpansion(session.id, session.date);
        }
    });
    
    // Add event listeners for buttons if expanded
    if (isExpanded) {
        card.querySelector('.edit-session-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            editSession(session.id);
        });
        
        card.querySelector('.delete-session-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSession(session.id);
        });
    }
    
    return card;
}

/**
 * Toggle session card expansion
 * @param {string} sessionId - ID of the session to toggle
 * @param {string} sessionDate - Date of the session (YYYY-MM-DD)
 */
function toggleSessionExpansion(sessionId, sessionDate) {
    console.log(`Toggling session expansion: ${sessionId}`);
    
    // If already expanded, collapse it, otherwise expand it
    if (expandedSessionId === sessionId) {
        expandedSessionId = null;
    } else {
        expandedSessionId = sessionId;
    }
    
    // Use the stored current date to maintain context
    const dateToUse = currentSelectedDate || sessionDate;
    
    if (dateToUse) {
        console.log(`Using date for refresh: ${dateToUse}`);
        
        // Get sessions directly from the calendar cache
        const cachedSessions = calendar.getSessionsForDate(dateToUse);
        
        // Use cached data but honor our expanded/collapsed state
        showSessionsForDate(dateToUse, cachedSessions);
    } else {
        console.error("Could not determine date for session refresh");
    }
}