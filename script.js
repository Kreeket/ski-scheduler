import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import * as schedules from './modules/schedules.js';
import * as exercises from './modules/exercises.js';
import * as auth from './modules/auth.js';

// Function to calculate the current ISO week number
function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    let weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    //consider week 53
     if (weekNumber === 0) {
         const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
         weekNumber = Math.ceil((dayOfYear + 365 + prevYearStart.getDay() + 1) / 7); //consider week 53
     }

    return weekNumber;
}

let currentWeek = getCurrentWeek(); // Initialize with the current week

document.addEventListener('DOMContentLoaded', async () => {
    // --- Authentication Section ---
    document.getElementById('loginBtn').addEventListener('click', async () => {
        const password = document.getElementById('password').value;

        if (await auth.authenticateUser(null, password)) { // Pass null for username
            ui.showAppContent();
            ui.showLoadingIndicator(); // Show loader *before* fetching
             await exercises.loadExercises();
             loadAndDisplaySchedule(currentWeek);
              ui.hideLoadingIndicator();

        } else {
            alert('Invalid credentials');
        }
    });

    // --- Week Navigation ---
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeek = schedules.getPreviousWeek(currentWeek);
        loadAndDisplaySchedule(currentWeek);
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeek = schedules.getNextWeek(currentWeek);
        loadAndDisplaySchedule(currentWeek);
    });

    // --- Schedule Saving and Deleting---
    document.getElementById('saveSchedule').addEventListener('click', () => {
        schedules.saveCurrentSchedule(currentWeek);
    });

    document.getElementById('deleteSchedule').addEventListener('click', () => {
        schedules.deleteSchedule(currentWeek);
    });

      // --- Exercise Management ---
    document.getElementById('manageExercisesBtn').addEventListener('click', () => {
      exercises.showExercisesModal(); //show the modal
    });
      // --- Close Exercise Modal ---
    document.getElementById('closeExercisesModal').addEventListener('click', () => {
      ui.hideElement(document.getElementById('exercisesModal'))//close it by hiding it
    });
      // --- Close Exercise Detail Modal ---
    document.getElementById('closeExerciseDetailsModal').addEventListener('click', () => {
      ui.hideElement(document.getElementById('exerciseDetailsModal'))//close it by hiding it
    });
      // --- Save New Exercise---
    document.getElementById('saveNewExerciseButton').addEventListener('click', async () => {
      exercises.saveNewExercise();
    });
      // --- Search Function ---
    document.getElementById('exerciseSearch').addEventListener('input', () => {
      exercises.renderExerciseList();
    });
     // Load exercises and the current week's schedule initially
     await exercises.loadExercises();
     loadAndDisplaySchedule(currentWeek);

});

async function loadAndDisplaySchedule(weekNumber) {
    ui.showLoadingIndicator(); // Show loader *before* fetching
    await schedules.loadSchedule(weekNumber);
    ui.updateWeekDisplay(weekNumber, schedules.calculateDateRange(weekNumber));
    exercises.populateExerciseDropdowns();
    ui.hideLoadingIndicator(); // Hide loader after everything is done
}