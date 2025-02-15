// schedules.js
import * as api from './api.js';
import * as ui from './ui.js';

export async function loadSchedule(group, yearWeek) {
    try {
        const schedule = await api.getSchedule(group, yearWeek);
        if (schedule) {
            ui.populateScheduleForm(schedule);
        } else {
            ui.clearScheduleForm(); // This will now also show the button
        }
    } catch (error) {
        console.error("Error loading schedule:", error);
        ui.showAlert("Failed to load schedule. Please try again."); // UI module
    }
}

export async function saveCurrentSchedule(group, yearWeek) {
    const scheduleData = ui.getScheduleFormData();
    try {
        await api.updateSchedule(group, yearWeek, scheduleData);
        ui.showAlert("Schedule saved successfully!"); // UI module
        loadSchedule(group, yearWeek); // Re-load, pass group
    } catch (error) {
        console.error("Error saving schedule:", error);
        ui.showAlert("Failed to save schedule. Please try again."); // UI module
    }
}

export async function deleteSchedule(group, yearWeek) {
    const confirmDelete = await ui.showConfirm(`Are you sure you want to delete the schedule for week ${yearWeek}? This action cannot be undone.`); // UI module
    if (confirmDelete) {
        try {
            await api.deleteSchedule(group, yearWeek);
            ui.showAlert("Schedule deleted successfully!"); // UI module
            ui.clearScheduleForm();
        } catch (error) {
            console.error("Error deleting schedule:", error);
            ui.showAlert("Failed to delete schedule. Please try again."); // UI module
        }
    }
}

// Helper function to get year and week
function getYearWeek(year, week) {
    return {
        year: year,
        week: week,
        yearWeek: `${year}-${week}`
    }
}

export function getPreviousWeek(currentYearWeek) {
    let [year, week] = currentYearWeek.split('-').map(Number);

    week--;
    if (week < 1) {
        year--;
        week = 52; // Jump to week 52 of the *previous* year
    }
    return getYearWeek(year, week).yearWeek;
}

export function getNextWeek(currentYearWeek) {
    let [year, week] = currentYearWeek.split('-').map(Number);

    week++;
    if (week > 52) {
        year++;
        week = 1;
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

export async function createEmptySchedule(group, yearWeek){
    try {
        await api.updateSchedule(group, yearWeek, {});
        ui.showAlert(`Schedule added for week: ${yearWeek}`); // UI module
        loadSchedule(group, yearWeek);
    }
    catch (error) {
        console.error("Error creating empty schedule:", error); // More specific error message
        ui.showAlert("Failed to create empty schedule. Please try again."); // UI module
    }
}