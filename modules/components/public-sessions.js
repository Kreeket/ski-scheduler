// public-sessions.js - Component for displaying public sessions
import * as sessionsApi from '../api/sessions.js';
import * as utils from '../utils/date-utils.js';

/**
 * Initialize public sessions display
 */
export async function initPublicSessions() {
    const publicWeekSummary = document.getElementById('publicWeekSummary');
    if (!publicWeekSummary) return;
    
    try {
        // Get date range for this week
        const today = new Date();
        const startOfWeek = utils.getStartOfWeek(today);
        const endOfWeek = utils.getEndOfWeek(today);
        
        // Format dates for API call
        const startDate = utils.formatDate(startOfWeek);
        const endDate = utils.formatDate(endOfWeek);
        
        // Fetch sessions for this date range (all groups)
        const sessions = await sessionsApi.getSessionsByDateRange(startDate, endDate);
        
        // Display the sessions
        renderPublicSessions(sessions, publicWeekSummary);
    } catch (error) {
        console.error('Failed to load public sessions:', error);
        publicWeekSummary.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                Unable to load sessions at this time.
            </div>
        `;
    }
}

/**
 * Render sessions in the public view
 * @param {Array} sessions - Array of session objects
 * @param {HTMLElement} container - Container element
 */
function renderPublicSessions(sessions, container) {
    if (!sessions || sessions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                No sessions scheduled for this week.
            </div>
        `;
        return;
    }
    
    // Group sessions by date
    const sessionsByDate = groupByDate(sessions);
    
    // Sort dates chronologically
    const sortedDates = Object.keys(sessionsByDate).sort();
    
    let html = '';
    
    // Render each date group
    sortedDates.forEach(date => {
        const sessionsOnDate = sessionsByDate[date];
        const dateObj = new Date(date);
        const formattedDate = utils.formatDateForDisplay(dateObj);
        
        html += `
            <div class="mb-4">
                <h4 class="font-medium text-primary-dark">${formattedDate}</h4>
                <div class="space-y-2 mt-2">
        `;
        
        // Sort sessions by start time
        sessionsOnDate.sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        // Render each session
        sessionsOnDate.forEach(session => {
            const groupName = session.group.replace('group', 'Group ');
            
            html += `
                <div class="bg-white rounded-lg p-3 shadow-sm border-l-4 border-primary">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-medium">${session.title || 'Training Session'}</div>
                            <div class="text-sm text-gray-600">${groupName} • ${utils.formatTimeForDisplay(session.startTime)}</div>
                        </div>
                        <div class="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            ${utils.formatDuration(session.startTime, session.endTime)}
                        </div>
                    </div>
                    ${session.location ? `<div class="text-sm mt-1">📍 ${session.location}</div>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Group sessions by date
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Object with dates as keys and arrays of sessions as values
 */
function groupByDate(sessions) {
    const result = {};
    
    sessions.forEach(session => {
        if (!result[session.date]) {
            result[session.date] = [];
        }
        result[session.date].push(session);
    });
    
    return result;
}