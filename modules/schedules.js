import * as api from './api.js';
import * as ui from './ui.js';
import * as exercises from './exercises.js';


export async function loadSchedule(weekNumber) {
    try {
        const schedule = await api.getSchedule(weekNumber);
        if (schedule) {
          ui.populateScheduleForm(schedule);
        } else {
          // Handle case where schedule doesn't exist (e.g., new week)
          //Clear the form, but keep the dropdowns
          ui.clearScheduleForm();
        }
    } catch (error) {
        console.error("Error loading schedule:", error);
        alert("Failed to load schedule."); // Basic error handling
    }
}

export async function saveCurrentSchedule(weekNumber) {
     const scheduleData = ui.getScheduleFormData();
    try {
        await api.updateSchedule(weekNumber, scheduleData);
        alert("Schedule saved successfully!");
         loadSchedule(weekNumber) //quick fix to repopulate dropdowns
    } catch (error) {
        console.error("Error saving schedule:", error);
        alert("Failed to save schedule.");
    }
}
  export async function deleteSchedule(weekNumber) {
      if (confirm(`Are you sure you want to delete the schedule for week ${weekNumber}?`)) {
        try {
          await api.deleteSchedule(weekNumber);
          alert("Schedule deleted successfully!");
           ui.clearScheduleForm();
        } catch (error) {
          console.error("Error deleting schedule:", error);
          alert("Failed to delete schedule.");
        }
      }
    }

 export async function addNextWeekSchedule() {
      try {
        let lastWeek = await findLastWeek(); //get the last week from api
        let nextWeek =  getNextWeek(lastWeek)
        const schedule = await api.getSchedule(nextWeek);
         if (schedule) { //if schedule already exist, don't make another
            alert('The schedule for this week does already exist')
         } else {
            await api.updateSchedule(nextWeek, {});
            alert(`Schedule added for week: ${nextWeek}`)
            ui.clearScheduleForm();
         }  
        
        }
      
    catch (error) {
        console.error("Error loading schedule:", error);
        alert("Failed to load schedule."); // Basic error handling
    }
  }    

export function getPreviousWeek(weekNumber) {
    // Simple decrement, handle wrap-around
    let prevWeek = weekNumber - 1;
    return prevWeek < 1 ? 52 : prevWeek; // Wrap to week 52
}

export function getNextWeek(weekNumber) {
    // Simple increment, handle wrap-around
    let nextWeek = weekNumber + 1;
    return nextWeek > 52 ? 1 : nextWeek; // Wrap to week 1
}
//Function to find the highest week number, we need it for the addWeek button.
export async function findLastWeek() {
  try {
    const allSchedules = await api.getSchedules();
    const weekNumbers = Object.keys(allSchedules).map(Number);
    return weekNumbers.length > 0 ? Math.max(...weekNumbers) : 0;
  } catch (error) {
    console.error('Error getting last week:', error);
    return 0; // Default to 0 if an error occurs
  }
}
export function calculateDateRange(weekNumber) {
    //  ISO week date calculation
    const year = new Date().getFullYear(); // You might want to select a year.
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dayOfWeek = simple.getDay();
    const isoWeekStart = new Date(simple);
    if (dayOfWeek <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    const isoWeekEnd = new Date(isoWeekStart);
    isoWeekEnd.setDate(isoWeekStart.getDate() + 6);

    const formatDate = (date) => { //helper to output readable dates
        const d = new Date(date);
        const month = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`
    };
    return `${formatDate(isoWeekStart)} to ${formatDate(isoWeekEnd)}`;
}