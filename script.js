// script.js
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import * as schedules from './modules/schedules.js';
import * as exercises from './modules/exercises.js';
import * as auth from './modules/auth.js';

// Function to calculate the current ISO week number AND year
function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    let weekNumber = Math.ceil((dayOfYear + startOfYear.getDay()) / 7); // Removed + 1
    let year = now.getFullYear();

// Handle week 53 (it can belong to the previous year)
    if (weekNumber === 0) {
      weekNumber = 52;
      year = now.getFullYear() - 1;
    }

    if (weekNumber === 53) {
        const firstDayOfNextYear = new Date(year + 1, 0, 1);
        if (now >= new Date(firstDayOfNextYear - 3 * 24 * 60 * 60 * 1000)) {
            weekNumber = 1;
            year++;
        }
    }

    return `${year}-${weekNumber}`; // Return in "YYYY-WW" format
}

let currentWeek = getCurrentWeek(); // Initialize with the current week
let selectedGroup = null; // Global variable to store the selected group

document.addEventListener('DOMContentLoaded', async () => {
    // --- Authentication Section ---
    document.getElementById('loginBtn').addEventListener('click', async () => {
        const password = document.getElementById('password').value;

        try {
            if (await auth.authenticateUser(null, password)) { // Pass null for username
                ui.showGroupSelection(); // Show group selection
                document.getElementById('authSection').classList.add('hidden');
            } else {
                ui.showAlert('Invalid credentials'); // Use UI module
            }
        } catch (error) {
            ui.showAlert(error.message); // Display the error message from auth.js
        }
    });

    // --- Group Selection ---
    document.getElementById('group1Btn').addEventListener('click', () => selectGroup('group1'));
    document.getElementById('group2Btn').addEventListener('click', () => selectGroup('group2'));
    document.getElementById('group3Btn').addEventListener('click', () => selectGroup('group3'));

    // --- Week Navigation ---
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeek = schedules.getPreviousWeek(currentWeek);
        loadAndDisplaySchedule(); // No group passed - it's already set
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeek = schedules.getNextWeek(currentWeek);
        loadAndDisplaySchedule(); // No group passed
    });

    // --- Schedule Saving and Deleting---
    document.getElementById('saveSchedule').addEventListener('click', () => {
        schedules.saveCurrentSchedule(selectedGroup, currentWeek); // Pass group
    });

    document.getElementById('deleteSchedule').addEventListener('click', () => {
        schedules.deleteSchedule(selectedGroup, currentWeek); // Pass group
    });

    // --- Add Schedule Button ---
    document.getElementById('addScheduleBtn').addEventListener('click', () => {
        addScheduleForCurrentWeek(selectedGroup, currentWeek); //Pass group
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
     // --- Close Edit Exercise Modal ---
     document.getElementById('closeEditExerciseModal').addEventListener('click', () => {
        ui.hideElement(document.getElementById('editExerciseModal'))//close it by hiding it
    });

    // --- Save New Exercise---
    document.getElementById('saveNewExerciseButton').addEventListener('click', async () => {
        exercises.saveNewExercise();
    });

    // --- Search Function ---
    document.getElementById('exerciseSearch').addEventListener('input', exercises.renderExerciseList);

    // --- Change Group Button ---
    document.getElementById('changeGroupBtn').addEventListener('click', () => {
        ui.showGroupSelection();        // Show group selection
        ui.hideElement('appContent'); // Hide app content
        selectedGroup = null;          // Reset selected group
        currentWeek = getCurrentWeek();
    });

    // --- Current Week Button ---
    document.getElementById('currentWeekBtn').addEventListener('click', () => {
        currentWeek = getCurrentWeek(); // Reset to current week
        loadAndDisplaySchedule();         // Reload schedule
    });
});

// --- Helper function to select a group ---
async function selectGroup(group) {
    selectedGroup = group;
    ui.hideGroupSelection();
    ui.showAppContent();
    ui.showLoadingIndicator();
    await exercises.loadExercises(); // Load exercises (they are shared)
    loadAndDisplaySchedule(); // Load schedule for the group and week
    ui.hideLoadingIndicator();

     //Click outside Modal
    document.getElementById('exercisesModal').addEventListener('click', handleModalClickOutside);
    document.getElementById('exerciseDetailsModal').addEventListener('click', handleModalClickOutside);
    document.getElementById('editExerciseModal').addEventListener('click', handleModalClickOutside);

}

// Function handles clicking outside modals to close.
function handleModalClickOutside(event) {
 if (event.target.id === 'exercisesModal') {
        ui.hideElement(document.getElementById('exercisesModal'));
    } else if (event.target.id === 'exerciseDetailsModal') {
        ui.hideElement(document.getElementById('exerciseDetailsModal'));
    }
    else if (event.target.id === 'editExerciseModal') {
        ui.hideElement(document.getElementById('editExerciseModal'));
    }
}

async function loadAndDisplaySchedule() {
    if (!selectedGroup) return; // Don't load if no group
    ui.showLoadingIndicator();
    await schedules.loadSchedule(selectedGroup, currentWeek);
    ui.updateWeekDisplay(currentWeek.split('-')[1], schedules.calculateDateRange(currentWeek));
    exercises.populateExerciseDropdowns();
    ui.hideLoadingIndicator();
}

async function addScheduleForCurrentWeek(group, yearWeek) {
    await schedules.createEmptySchedule(group, yearWeek)
}