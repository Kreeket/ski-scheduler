// calendar.js - Simplified calendar view using Flatpickr
import * as utils from '../utils/date-utils.js';
import * as sessionsApi from '../api/sessions.js';
import { showLoadingIndicator, hideLoadingIndicator, handleError } from '../ui/common.js';

let flatpickrInstance = null;
let selectedGroup = null;
let currentSessions = [];
let sessionsByDate = {};
let dateSelectedCallback = null;
let isLoadingMonth = false;
let lastSelectedDate = null;

// Keep track of indicator rendering state
let indicatorsNeedUpdate = true;
let indicatorUpdateTimer = null;

/**
 * Initialize calendar component with Flatpickr
 * @param {string} containerId - ID of the container element
 * @param {string} group - Selected group
 * @param {Function} onDateSelected - Callback when date is selected
 */
export function initCalendar(containerId, group, onDateSelected) {
    console.log(`Initializing calendar with container ID: ${containerId}, group: ${group}`);
    
    // Store the callback function
    dateSelectedCallback = onDateSelected;
    selectedGroup = group;
    
    // Make sure the calendar container exists
    const calendarContainer = document.getElementById(containerId);
    if (!calendarContainer) {
        console.error(`Calendar container #${containerId} not found`);
        return;
    }
    
    // Initialize Flatpickr
    initFlatpickr(calendarContainer);
    
    // Initial load of sessions for current month
    setTimeout(() => {
        loadCurrentMonthSessions();
    }, 100);
}

/**
 * Initialize Flatpickr instance
 */
function initFlatpickr(container) {
    // Destroy existing instance if it exists
    if (flatpickrInstance) {
        flatpickrInstance.destroy();
    }
    
    try {
        // Initialize Flatpickr with configuration
        flatpickrInstance = flatpickr(container, {
            inline: true,
            mode: 'single',
            dateFormat: 'Y-m-d',
            defaultDate: new Date(),
            locale: { firstDayOfWeek: 1 }, // Start week on Monday
            
            // Add a today button when calendar is ready
            onReady: function(selectedDates, dateStr, instance) {
                console.log("Flatpickr is ready");
                addTodayButton(instance);
            },
            
            // Handle month change
            onMonthChange: function() {
                console.log("Month changed, reloading sessions");
                loadCurrentMonthSessions();
            },
            
            // Handle date selection - use our custom handler
            onChange: handleDateSelection,
            
            // After calendar DOM is updated
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                // Mark that indicators need updating
                indicatorsNeedUpdate = true;
                
                // Schedule update after all days are created
                if (indicatorUpdateTimer) {
                    clearTimeout(indicatorUpdateTimer);
                }
                indicatorUpdateTimer = setTimeout(forceUpdateCalendarIndicators, 10);
            }
        });
        
        console.log("Flatpickr initialized successfully");
        
        // Add observer for any changes to the calendar
        addCalendarObserver();
    } catch (error) {
        console.error("Error initializing flatpickr:", error);
        throw error;
    }
}

/**
 * Add a MutationObserver to watch for calendar changes
 */
function addCalendarObserver() {
    if (!flatpickrInstance || !flatpickrInstance.calendarContainer) return;
    
    try {
        const observer = new MutationObserver(function(mutations) {
            // Only update indicators when needed
            if (indicatorsNeedUpdate) {
                // Delay indicator update to ensure DOM is stable
                if (indicatorUpdateTimer) {
                    clearTimeout(indicatorUpdateTimer);
                }
                indicatorUpdateTimer = setTimeout(forceUpdateCalendarIndicators, 10);
            }
        });
        
        // Start observing the calendar
        observer.observe(flatpickrInstance.calendarContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
        
        console.log("Calendar observer added");
    } catch (error) {
        console.error("Error adding calendar observer:", error);
    }
}

/**
 * Handle date selection in calendar
 * @param {Date[]} selectedDates - Selected dates from flatpickr
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 */
function handleDateSelection(selectedDates, dateStr) {
    if (selectedDates.length > 0) {
        const selectedDate = selectedDates[0];
        const formattedDate = utils.formatDate(selectedDate);
        lastSelectedDate = formattedDate;
        
        console.log(`Date selected: ${formattedDate}`);
        
        // Get sessions for this date from our cached data
        const sessionsForDate = sessionsByDate[formattedDate] || [];
        console.log(`Found ${sessionsForDate.length} sessions for ${formattedDate}`);
        
        // Call the callback function if provided
        if (typeof dateSelectedCallback === 'function') {
            dateSelectedCallback(formattedDate, sessionsForDate);
        }
        
        // Force redraw the indicators
        forceUpdateCalendarIndicators();
    }
}

/**
 * Add a "Today" button to the Flatpickr calendar
 */
function addTodayButton(instance) {
    try {
        if (!instance || !instance.calendarContainer) {
            console.error("Flatpickr instance or calendarContainer is null");
            return;
        }
        
        // Create today button
        const todayBtn = document.createElement('button');
        todayBtn.textContent = 'Today';
        todayBtn.className = 'flatpickr-today-button';
        todayBtn.addEventListener('click', () => {
            const today = new Date();
            flatpickrInstance.setDate(today);
            
            // Force trigger onChange to update session list
            const formattedDate = utils.formatDate(today);
            const sessionsForToday = sessionsByDate[formattedDate] || [];
            
            if (typeof dateSelectedCallback === 'function') {
                dateSelectedCallback(formattedDate, sessionsForToday);
            }
        });
        
        // Add button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-center pt-2 pb-1';
        buttonContainer.appendChild(todayBtn);
        
        // Add button container after calendar
        instance.calendarContainer.appendChild(buttonContainer);
        
        console.log("Today button added to calendar");
    } catch (error) {
        console.error("Error adding today button:", error);
    }
}

/**
 * Load sessions for the current month and surrounding dates
 */
export async function loadCurrentMonthSessions() {
    if (!flatpickrInstance) {
        console.error("Cannot load sessions - flatpickrInstance is null");
        return;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoadingMonth) {
        console.log("Already loading month data, skipping this request");
        return;
    }
    
    try {
        isLoadingMonth = true;
        showLoadingIndicator();
        
        // Get current month and year from Flatpickr
        const currentMonth = flatpickrInstance.currentMonth;
        const currentYear = flatpickrInstance.currentYear;
        
        if (currentMonth === undefined || currentYear === undefined) {
            console.error("Invalid month/year from flatpickr:", currentMonth, currentYear);
            return;
        }
        
        console.log(`Loading sessions for ${currentYear}-${currentMonth + 1}`);
        
        // Get the month name for better logging
        const monthName = utils.getMonthName(currentMonth + 1);
        console.log(`Loading sessions for ${monthName} ${currentYear}`);
        
        // Create date range for an extended period (±30 days from first of month)
        // This ensures we have good coverage for calendar indicators
        const baseDate = new Date(currentYear, currentMonth, 15); // Middle of current month
        
        const startDate = new Date(baseDate);
        startDate.setDate(startDate.getDate() - 30); // 30 days before
        
        const endDate = new Date(baseDate);
        endDate.setDate(endDate.getDate() + 30); // 30 days after
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error("Invalid date range:", startDate, endDate);
            throw new Error("Invalid date range for session loading");
        }
        
        // Format dates for API
        const startDateString = utils.formatDate(startDate);
        const endDateString = utils.formatDate(endDate);
        
        console.log(`Extended date range: ${startDateString} to ${endDateString}`);
        
        // Load sessions for this extended range
        const newSessions = await sessionsApi.getSessionsByDateRange(
            startDateString, 
            endDateString, 
            selectedGroup
        );
        
        console.log(`Loaded ${newSessions.length} sessions`);
        
        // Update our local cache
        currentSessions = newSessions;
        
        // Organize sessions by date
        // IMPORTANT: Create a new object instead of clearing the existing one
        // This prevents issues with losing references
        const newSessionsByDate = {};
        currentSessions.forEach(session => {
            if (!newSessionsByDate[session.date]) {
                newSessionsByDate[session.date] = [];
            }
            newSessionsByDate[session.date].push(session);
        });
        
        // Update the cache with the new data
        sessionsByDate = newSessionsByDate;
        
        // Force update the calendar indicators
        indicatorsNeedUpdate = true;
        forceUpdateCalendarIndicators();
        
        // Update current selected date view if needed
        if (lastSelectedDate && typeof dateSelectedCallback === 'function') {
            const currentSessions = sessionsByDate[lastSelectedDate] || [];
            console.log(`Updating view for last selected date: ${lastSelectedDate}`);
            dateSelectedCallback(lastSelectedDate, currentSessions);
        }
    } catch (error) {
        console.error("Error loading month sessions:", error);
        handleError(error, "Failed to load calendar data");
    } finally {
        isLoadingMonth = false;
        hideLoadingIndicator();
    }
}

/**
 * Force update the calendar indicators
 * This will add the indicators to days with sessions
 */
function forceUpdateCalendarIndicators() {
    // If not needed, skip
    if (!indicatorsNeedUpdate || !flatpickrInstance) return;
    
    try {
        console.log("Force updating calendar indicators...");
        
        // Debug: Log the dates that have sessions
        const sessionDates = Object.keys(sessionsByDate);
        console.log("Dates with sessions:", sessionDates.join(", "));
        
        // Get the current month and year
        const currentMonth = flatpickrInstance.currentMonth;
        const currentYear = flatpickrInstance.currentYear;
        
        // Clear any existing indicators
        const allDayElements = flatpickrInstance.calendarContainer.querySelectorAll('.flatpickr-day');
        allDayElements.forEach(dayEl => {
            dayEl.classList.remove('has-session');
            const existingIndicator = dayEl.querySelector('.session-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
        });
        
        // If no sessions, we're done
        if (sessionDates.length === 0) {
            indicatorsNeedUpdate = false;
            return;
        }
        
        // Add indicators to days with sessions
        allDayElements.forEach(dayEl => {
            // Skip disabled days
            if (dayEl.classList.contains('flatpickr-disabled') || 
                dayEl.classList.contains('notAllowed')) {
                return;
            }
            
            // Skip days from previous/next month 
            if (dayEl.classList.contains('prevMonthDay') || 
                dayEl.classList.contains('nextMonthDay')) {
                return;
            }
            
            // Get the day number (1-31)
            const dayNumber = parseInt(dayEl.textContent.trim());
            if (isNaN(dayNumber)) return;
            
            // Create a date object for this day
            const date = new Date(currentYear, currentMonth, dayNumber);
            const dateStr = utils.formatDate(date);
            
            // Check if this date has sessions
            if (sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0) {
                // Add indicator class
                dayEl.classList.add('has-session');
                
                // Create session count indicator
                const sessionCount = sessionsByDate[dateStr].length;
                const indicator = document.createElement('span');
                indicator.className = 'session-indicator';
                indicator.textContent = sessionCount;
                dayEl.appendChild(indicator);
                
                // Store the date for reference
                dayEl.dataset.fullDate = dateStr;
            }
        });
        
        console.log("Calendar indicators updated");
        indicatorsNeedUpdate = false;
    } catch (error) {
        console.error("Error updating calendar indicators:", error);
    }
}

/**
 * Select a specific date in the calendar
 * @param {Date|string} date - Date to select
 */
export function selectDate(date) {
    if (flatpickrInstance) {
        flatpickrInstance.setDate(date);
        
        // Force update indicators
        forceUpdateCalendarIndicators();
    }
}

/**
 * Refresh the calendar view
 */
export function refresh() {
    // Just mark indicators as needing update and schedule a redraw
    indicatorsNeedUpdate = true;
    
    // Cancel any pending timer
    if (indicatorUpdateTimer) {
        clearTimeout(indicatorUpdateTimer);
    }
    
    // Check if we need to reload data
    if (Object.keys(sessionsByDate).length === 0 || isLoadingMonth) {
        // If no data or already loading, reload everything
        loadCurrentMonthSessions();
    } else {
        // Otherwise just update indicators
        indicatorUpdateTimer = setTimeout(forceUpdateCalendarIndicators, 10);
    }
}

/**
 * Get the sessions for a specific date
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {Array} - Array of sessions for this date
 */
export function getSessionsForDate(dateStr) {
    return sessionsByDate[dateStr] || [];
}

/**
 * Get all sessions in the calendar cache
 * @returns {Object} - Sessions by date
 */
export function getAllSessions() {
    return { ...sessionsByDate };
}

/**
 * Clean up calendar resources
 */
export function destroy() {
    // Cancel any pending updates
    if (indicatorUpdateTimer) {
        clearTimeout(indicatorUpdateTimer);
        indicatorUpdateTimer = null;
    }
    
    if (flatpickrInstance) {
        flatpickrInstance.destroy();
        flatpickrInstance = null;
    }
}