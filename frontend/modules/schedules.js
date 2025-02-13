// frontend/modules/schedules.js

import * as api from './api.js';

let schedules = {}; // Keep schedules data local to this module

// Load all schedules (for initialization)
export async function loadSchedules() {
    try {
        schedules = await api.getSchedules();
        if (!schedules) {
            schedules = {}; // Ensure it's an object
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        alert('Error loading schedules. Please try again later.');
    }
}

// Load a single schedule for a specific date and group
export async function loadSchedule(groupId, date) {
    try {
        const scheduleData = await api.getSchedule(date, groupId);
        // Update UI directly (no need for a separate schedules array in this module)
        document.getElementById('warm-up').textContent = scheduleData['warm-up'] || '';
        document.getElementById('exercise-1').textContent = scheduleData['exercise-1'] || '';
        document.getElementById('exercise-2').textContent = scheduleData['exercise-2'] || '';
        document.getElementById('exercise-3').textContent = scheduleData['exercise-3'] || '';
        document.getElementById('main-activity').textContent = scheduleData['main-activity'] || '';
        document.getElementById('cool-down').textContent = scheduleData['cool-down'] || '';
        document.getElementById('leaders').value = (scheduleData.leaders || []).join(', '); // Use value
    } catch (error) {
//We are catching all errors inside of api.js, even 404.
        console.error('Error loading schedule:', error);
        //alert('Error loading schedule. Please try again later.'); //Already handeled
    }
}

// Save (update) a schedule
export async function saveSchedule(date, group, scheduleData) {
    try {
        // Ensure 'leaders' is an array of strings:
        if (typeof scheduleData.leaders === 'string') {
            scheduleData.leaders = scheduleData.leaders.split(',').map(s => s.trim()).filter(s => s !== "");
        }
        console.log("saveSchedule - Before fetch:", date, group, scheduleData);
        const response = await api.updateSchedule(date, group, scheduleData);
        console.log("saveSchedule - After fetch:", response); // Keep this for now
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Error saving schedule. Please try again later.');
    }
}

// Delete a schedule
export async function deleteSchedule(date, group) {
    try{
        await api.deleteSchedule(date, group);
      //After deleting, clear the UI for that schedule
        loadSchedule(group, date); // Reload to clear
    } catch (error){
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule. Please try again later.');
    }

}