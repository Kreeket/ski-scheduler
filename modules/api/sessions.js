// sessions.js - API module for session operations
import { getApiBaseUrl } from './base.js';
import * as utils from '../utils/date-utils.js';

/**
 * Fetch data with error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
async function fetchWithErrorHandling(url, options = {}) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            } catch (jsonError) {
                throw new Error(`Request failed with status ${response.status}`);
            }
        }
        
        return response.json();
    } catch (error) {
        console.error('API error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error: Check your connection and try again. Make sure your backend server is running.');
        }
        throw error;
    }
}

/**
 * Get all sessions with optional filtering
 * @param {Object} filters - Filters to apply
 * @returns {Promise<Array>} - Sessions array
 */
export async function getSessions(filters = {}) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${getApiBaseUrl()}/sessions${queryString}`;
    
    return fetchWithErrorHandling(url);
}

/**
 * Get a specific session by ID
 * @param {string} id - Session ID
 * @returns {Promise<Object>} - Session data
 */
export async function getSessionById(id) {
    if (!id) {
        console.error('getSessionById called without ID');
        throw new Error('Session ID is required');
    }
    
    const url = `${getApiBaseUrl()}/sessions/${id}`;
    return fetchWithErrorHandling(url);
}

/**
 * Create a new session
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} - Created session
 */
export async function createSession(sessionData) {
    const url = `${getApiBaseUrl()}/sessions`;
    return fetchWithErrorHandling(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
    });
}

/**
 * Update an existing session
 * @param {string} id - Session ID
 * @param {Object} sessionData - Updated session data
 * @returns {Promise<Object>} - Updated session
 */
export async function updateSession(id, sessionData) {
    if (!id) {
        console.error('updateSession called without ID');
        throw new Error('Session ID is required');
    }
    
    const url = `${getApiBaseUrl()}/sessions/${id}`;
    return fetchWithErrorHandling(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
    });
}

/**
 * Delete a session
 * @param {string} id - Session ID
 * @returns {Promise<boolean>} - Success indicator
 */
export async function deleteSession(id) {
    if (!id) {
        console.error('deleteSession called without ID');
        throw new Error('Session ID is required');
    }
    
    const url = `${getApiBaseUrl()}/sessions/${id}`;
    await fetchWithErrorHandling(url, {
        method: 'DELETE',
    });
    return true;
}

/**
 * Get sessions for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} group - Group ID
 * @returns {Promise<Array>} - Sessions array
 */
export async function getSessionsByDate(date, group = null) {
    if (!date) {
        console.error('getSessionsByDate called without date');
        throw new Error('Date is required');
    }
    
    const filters = { date };
    if (group) {
        filters.group = group;
    }
    return getSessions(filters);
}

/**
 * Get sessions for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} group - Group ID
 * @returns {Promise<Array>} - Sessions array
 */
export async function getSessionsByDateRange(startDate, endDate, group = null) {
    if (!startDate || !endDate) {
        console.error('getSessionsByDateRange called with invalid date range:', startDate, endDate);
        throw new Error('Start date and end date are required');
    }
    
    console.log(`Getting sessions from ${startDate} to ${endDate} for group ${group || 'all'}`);
    
    const filters = { startDate, endDate };
    if (group) {
        filters.group = group;
    }
    return getSessions(filters);
}

/**
 * Get upcoming sessions
 * @param {number} days - Number of days to look ahead
 * @param {string} group - Group ID
 * @returns {Promise<Array>} - Sessions array
 */
export async function getUpcomingSessions(days = 7, group = null) {
    try {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + days);
        
        const startDateFormatted = utils.formatDate(today);
        const endDateFormatted = utils.formatDate(endDate);
        
        if (!startDateFormatted || !endDateFormatted) {
            throw new Error('Failed to format dates');
        }
        
        return getSessionsByDateRange(startDateFormatted, endDateFormatted, group);
    } catch (error) {
        console.error('Error in getUpcomingSessions:', error);
        throw error;
    }
}

/**
 * Get sessions for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {string} group - Group ID
 * @returns {Promise<Array>} - Sessions array
 */
export async function getSessionsByMonth(year, month, group = null) {
    try {
        if (!year || isNaN(year) || year < 2000 || year > 3000) {
            console.error('Invalid year in getSessionsByMonth:', year);
            throw new Error('Invalid year');
        }
        
        if (!month || isNaN(month) || month < 1 || month > 12) {
            console.error('Invalid month in getSessionsByMonth:', month);
            throw new Error('Invalid month');
        }
        
        console.log(`Getting sessions for ${year}-${month} (group ${group || 'all'})`);
        
        // Create date range for the whole month with some padding
        // Get from a few days before the month starts
        const startDate = new Date(year, month - 1, -5);
        // To a few days after the month ends
        const endDate = new Date(year, month, 5);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Invalid date range in getSessionsByMonth:', startDate, endDate);
            throw new Error('Invalid date range');
        }
        
        const startDateFormatted = utils.formatDate(startDate);
        const endDateFormatted = utils.formatDate(endDate);
        
        if (!startDateFormatted || !endDateFormatted) {
            throw new Error('Failed to format dates');
        }
        
        console.log(`Date range: ${startDateFormatted} to ${endDateFormatted}`);
        
        return getSessionsByDateRange(startDateFormatted, endDateFormatted, group);
    } catch (error) {
        console.error('Error in getSessionsByMonth:', error);
        throw error;
    }
}