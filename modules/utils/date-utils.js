// date-utils.js - Date formatting and manipulation utilities

/**
 * Format date as YYYY-MM-DD (for API and input fields)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    if (!date) {
        console.error('formatDate received null/undefined date');
        return '';
    }
    
    let d;
    try {
        d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) {
            console.error('Invalid date in formatDate:', date);
            return '';
        }
        
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch (error) {
        console.error('Error in formatDate:', error, date);
        return '';
    }
}

/**
 * Format date for API requests
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string (YYYY-MM-DD)
 */
export function formatDateForApi(date) {
    try {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date in formatDateForApi:', date);
            return '';
        }
        
        // Safe way to format dates
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error in formatDateForApi:', error, date);
        return '';
    }
}

/**
 * Format date as a user-friendly string (e.g., "Monday, Feb 24")
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDateForDisplay(date) {
    if (!date) return '';
    
    try {
        const d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) {
            console.error('Invalid date in formatDateForDisplay:', date);
            return '';
        }
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
    } catch (error) {
        console.error('Error in formatDateForDisplay:', error, date);
        return '';
    }
}

/**
 * Format time as HH:MM (for input fields)
 * @param {Date|string} date - Date object or time string
 * @returns {string} - Formatted time string
 */
export function formatTime(date) {
    if (!date) return '';
    
    try {
        let hours, minutes;
        
        if (date instanceof Date) {
            if (isNaN(date.getTime())) {
                console.error('Invalid date in formatTime:', date);
                return '';
            }
            hours = date.getHours();
            minutes = date.getMinutes();
        } else if (typeof date === 'string' && date.includes(':')) {
            // Handle time string like "14:30"
            const parts = date.split(':');
            hours = parseInt(parts[0]);
            minutes = parseInt(parts[1]);
            
            if (isNaN(hours) || isNaN(minutes)) {
                console.error('Invalid time string in formatTime:', date);
                return '';
            }
        } else {
            console.error('Unsupported time format in formatTime:', date);
            return '';
        }
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch (error) {
        console.error('Error in formatTime:', error, date);
        return '';
    }
}

/**
 * Format time for display (e.g., "2:30 PM")
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {string} - Formatted time string
 */
export function formatTimeForDisplay(timeStr) {
    if (!timeStr) return '';
    
    try {
        let [hours, minutes] = timeStr.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) {
            console.error('Invalid time string in formatTimeForDisplay:', timeStr);
            return '';
        }
        
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
    } catch (error) {
        console.error('Error in formatTimeForDisplay:', error, timeStr);
        return '';
    }
}

/**
 * Get month name (e.g., "February")
 * @param {number} month - Month number (1-12)
 * @returns {string} - Month name
 */
export function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Adjust for 0-based or 1-based month
    try {
        const index = month > 0 && month <= 12 ? month - 1 : month;
        
        if (index < 0 || index >= 12) {
            console.error('Invalid month index in getMonthName:', month);
            return '';
        }
        
        return months[index] || '';
    } catch (error) {
        console.error('Error in getMonthName:', error, month);
        return '';
    }
}

/**
 * Format duration from start and end times
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {string} - Formatted duration
 */
export function formatDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';
    
    try {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
            console.error('Invalid time values in formatDuration:', startTime, endTime);
            return '';
        }
        
        let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        // Handle end time on next day
        if (duration < 0) {
            duration += 24 * 60;
        }
        
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        
        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}m`;
        }
    } catch (error) {
        console.error('Error in formatDuration:', error, startTime, endTime);
        return '';
    }
}

/**
 * Get the first day of the week containing the given date
 * @param {Date} date - Date within the week
 * @param {number} startDay - Starting day of week (0 = Sunday, 1 = Monday)
 * @returns {Date} - First day of the week
 */
export function getStartOfWeek(date, startDay = 0) {
    try {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date in getStartOfWeek:', date);
            return new Date(); // Return today as fallback
        }
        
        const result = new Date(date);
        const day = result.getDay();
        const diff = day >= startDay ? day - startDay : 7 + day - startDay;
        result.setDate(result.getDate() - diff);
        result.setHours(0, 0, 0, 0);
        return result;
    } catch (error) {
        console.error('Error in getStartOfWeek:', error, date);
        return new Date(); // Return today as fallback
    }
}

/**
 * Get the last day of the week containing the given date
 * @param {Date} date - Date within the week
 * @param {number} startDay - Starting day of week (0 = Sunday, 1 = Monday)
 * @returns {Date} - Last day of the week
 */
export function getEndOfWeek(date, startDay = 0) {
    try {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date in getEndOfWeek:', date);
            return new Date(); // Return today as fallback
        }
        
        const result = getStartOfWeek(date, startDay);
        result.setDate(result.getDate() + 6);
        result.setHours(23, 59, 59, 999);
        return result;
    } catch (error) {
        console.error('Error in getEndOfWeek:', error, date);
        return new Date(); // Return today as fallback
    }
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
    try {
        const today = new Date();
        const d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) {
            console.error('Invalid date in isToday:', date);
            return false;
        }
        
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    } catch (error) {
        console.error('Error in isToday:', error, date);
        return false;
    }
}

/**
 * Get the current date-time as an ISO string without milliseconds
 * @returns {string} - Current date-time string
 */
export function getNow() {
    try {
        return new Date().toISOString().split('.')[0];
    } catch (error) {
        console.error('Error in getNow:', error);
        return '';
    }
}