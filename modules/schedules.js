import * as api from './api.js';
import * as ui from './ui.js';

export async function loadSchedule(group, yearWeek) { // Added group parameter
    try {
        const schedule = await api.getSchedule(group, yearWeek); // Pass group to API
        if (schedule) {
            ui.populateScheduleForm(schedule);
        } else {
            ui.clearScheduleForm(); // This will now also show the button
        }
    } catch (error) {
        console.error("Error loading schedule:", error);
        alert("Failed to load schedule.");
    }
}

export async function saveCurrentSchedule(group, yearWeek) { // Added group parameter
    const scheduleData = ui.getScheduleFormData();
    try {
        await api.updateSchedule(group, yearWeek, scheduleData); // Pass group to API
        alert("Schedule saved successfully!");
        loadSchedule(group, yearWeek); // Re-load to update dropdowns, pass group
    } catch (error) {
        console.error("Error saving schedule:", error);
        alert("Failed to save schedule.");
    }
}

export async function deleteSchedule(group, yearWeek) { // Added group parameter
    if (confirm(`Are you sure you want to delete the schedule for week ${yearWeek}? This action cannot be undone.`)) {
        try {
            await api.deleteSchedule(group, yearWeek); // Pass group to API
            alert("Schedule deleted successfully!");
            ui.clearScheduleForm();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            alert("Failed to delete schedule.");
        }
    }
}

// Helper function to get year and week as an object
function getYearWeek(year, week) {
    return {
        year: year,
        week: week,
        yearWeek: `${year}-${week}`
    }
}

export function getPreviousWeek(currentYearWeek) {
    let [year, week] = currentYearWeek.split('-').map(Number); // Destructure and convert to numbers

    week--;
    if (week < 1) {
        year--;
        week = 52; // Jump to week 52 of the *previous* year
    }
    return getYearWeek(year, week).yearWeek; // Return in new format
}

export function getNextWeek(currentYearWeek) {
    let [year, week] = currentYearWeek.split('-').map(Number);

    week++;
    if (week > 52) {
        year++;
        week = 1; // Jump to week 1 of the *next* year
    }
    return getYearWeek(year, week).yearWeek;
}

export function calculateDateRange(yearWeek) {
    let [year, week] = yearWeek.split('-').map(Number);
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const isoWeekStart = new Date(simple);
    if (dayOfWeek <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    const isoWeekEnd = new Date(isoWeekStart);
    isoWeekEnd.setDate(isoWeekStart.getDate() + 6);

    const formatDatePart = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const start = formatDatePart(isoWeekStart);
    const end = formatDatePart(isoWeekEnd);

    return {
        start: isoWeekStart,
        end: isoWeekEnd,
        formatted: `${start} - ${end} ${year}`
    };
}

// Added Create Empty schedule Function
export async function createEmptySchedule(group, yearWeek){ //Added group
    try {
        await api.updateSchedule(group, yearWeek, {}); //Added group
        alert(`Schedule added for week: ${yearWeek}`)
        loadSchedule(group, yearWeek); //Added group
        }

    catch (error) {
        console.error("Error loading schedule:", error);
        alert("Failed to load schedule."); // Basic error handling
    }
}