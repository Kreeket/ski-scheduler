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
    let weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
    let year = now.getFullYear();

    // Handle week 53 (it can belong to the previous year)
    if (weekNumber === 0) {
        const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
        weekNumber = Math.ceil((dayOfYear + 365 + prevYearStart.getDay() + 1) / 7);
        year = now.getFullYear() -1;
    }
     // Handle week 53 (it can belong to the next year)
     if(weekNumber === 53){
        const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
        if(now >= nextYearStart){
            weekNumber = 1;
            year = now.getFullYear() + 1;
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

        if (await auth.authenticateUser(null, password)) { // Pass null for username
            ui.showGroupSelection(); // Show group selection after login
            document.getElementById('authSection').classList.add('hidden'); // Hide login
        } else {
            alert('Invalid credentials');
        }
    });

    // --- Group Selection ---
    document.getElementById('group1Btn').addEventListener('click', () => selectGroup('group1'));
    document.getElementById('group2Btn').addEventListener('click', () => selectGroup('group2'));
    document.getElementById('group3Btn').addEventListener('click', () => selectGroup('group3'));

    // --- Week Navigation ---
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeek = schedules.getPreviousWeek(currentWeek);
        loadAndDisplaySchedule(); // No group passed here - it's already set
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeek = schedules.getNextWeek(currentWeek);
        loadAndDisplaySchedule(); // No group passed here
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
      // --- Save New Exercise---
    document.getElementById('saveNewExerciseButton').addEventListener('click', async () => {
      exercises.saveNewExercise();
    });
      // --- Search Function ---
    document.getElementById('exerciseSearch').addEventListener('input', () => {
      exercises.renderExerciseList();
    });
    // --- Change Group Button ---
    document.getElementById('changeGroupBtn').addEventListener('click', () => {
        ui.showGroupSelection();      // Show group selection
        ui.hideElement('appContent'); // Hide app content
        selectedGroup = null;          // Reset selected group
        currentWeek = getCurrentWeek();
    });

    // --- Current Week Button ---
    document.getElementById('currentWeekBtn').addEventListener('click', () => {
        currentWeek = getCurrentWeek(); // Reset to current week
        loadAndDisplaySchedule();       // Reload schedule
    });
     // Load exercises and the current week's schedule initially
     //await exercises.loadExercises(); Removed
     //loadAndDisplaySchedule(currentWeek); Removed

});

// --- Helper function to select a group ---
async function selectGroup(group) {
    selectedGroup = group;
    ui.hideGroupSelection();
    ui.showAppContent();
    ui.showLoadingIndicator();
    await exercises.loadExercises(); // Load exercises (they are shared)
    loadAndDisplaySchedule(); // Load schedule for the selected group and current week
    ui.hideLoadingIndicator();

    // --- Add click-outside-to-close functionality HERE ---
    document.getElementById('exercisesModal').addEventListener('click', (event) => {
        if (event.target.id === 'exercisesModal') {
            ui.hideElement(document.getElementById('exercisesModal'));
        }
    });

    document.getElementById('exerciseDetailsModal').addEventListener('click', (event) => {
        if (event.target.id === 'exerciseDetailsModal') {
            ui.hideElement(document.getElementById('exerciseDetailsModal'));
        }
    });
}

async function loadAndDisplaySchedule() {
    if (!selectedGroup) return; // Don't load if no group is selected
    ui.showLoadingIndicator();
    await schedules.loadSchedule(selectedGroup, currentWeek); // Pass group to loadSchedule
    ui.updateWeekDisplay(currentWeek.split('-')[1], schedules.calculateDateRange(currentWeek));  // Pass week number
    exercises.populateExerciseDropdowns();
    ui.hideLoadingIndicator();
}
//Add schedule function
async function addScheduleForCurrentWeek(group, yearWeek){
    await schedules.createEmptySchedule(group, yearWeek)
}