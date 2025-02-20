// script.js
import * as api from './modules/api.js';
import * as ui from './modules/ui.js';
import * as schedules from './modules/schedules.js';
import * as exercises from './modules/exercises.js';
import * as auth from './modules/auth.js';

function getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    let weekNumber = Math.ceil((dayOfYear + startOfYear.getDay()) / 7);
    let year = now.getFullYear();

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
    return `${year}-${weekNumber}`;
}

let currentWeek = getCurrentWeek();
let selectedGroup = null;

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('loginBtn').addEventListener('click', async () => {
        const password = document.getElementById('password').value;
        try {
            if (await auth.authenticateUser(null, password)) {
                ui.showGroupSelection();
                document.getElementById('authSection').classList.add('hidden');
            } else {
                ui.showAlert('Invalid credentials', 'error'); // ERROR icon
            }
        } catch (error) {
            ui.showAlert(error.message, 'error'); // ERROR icon - show specific error
        }
    });

    document.getElementById('group1Btn').addEventListener('click', () => selectGroup('group1'));
    document.getElementById('group2Btn').addEventListener('click', () => selectGroup('group2'));
    document.getElementById('group3Btn').addEventListener('click', () => selectGroup('group3'));

    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeek = schedules.getPreviousWeek(currentWeek);
        loadAndDisplaySchedule();
    });

    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeek = schedules.getNextWeek(currentWeek);
        loadAndDisplaySchedule();
    });

    document.getElementById('saveSchedule').addEventListener('click', () => {
        schedules.saveCurrentSchedule(selectedGroup, currentWeek);
    });

    document.getElementById('deleteSchedule').addEventListener('click', () => {
        schedules.deleteSchedule(selectedGroup, currentWeek);
    });

    document.getElementById('addScheduleBtn').addEventListener('click', () => {
        addScheduleForCurrentWeek(selectedGroup, currentWeek);
    });

    document.getElementById('manageExercisesBtn').addEventListener('click', () => {
        exercises.showExercisesModal();
    });

     // --- Close Exercise Modals ---
    document.getElementById('closeExercisesModal').addEventListener('click', () => {
        ui.hideElement(document.getElementById('exercisesModal'))
    });
    document.getElementById('closeExerciseDetailsModal').addEventListener('click', () => {
        ui.hideElement(document.getElementById('exerciseDetailsModal'))
    });
     document.getElementById('closeEditExerciseModal').addEventListener('click', () => {
        ui.hideElement(document.getElementById('editExerciseModal'))
    });

    document.getElementById('saveNewExerciseButton').addEventListener('click', async () => {
        exercises.saveNewExercise();
    });

    document.getElementById('exerciseSearch').addEventListener('input', exercises.renderExerciseList);

    document.getElementById('changeGroupBtn').addEventListener('click', () => {
        ui.showGroupSelection();
        ui.hideElement(document.getElementById('appContent'));
        selectedGroup = null;
        currentWeek = getCurrentWeek();
    });

    document.getElementById('currentWeekBtn').addEventListener('click', () => {
        currentWeek = getCurrentWeek();
        loadAndDisplaySchedule();
    });

    document.getElementById('addExerciseBtn').addEventListener('click', () => {
      const selectedExercise = document.getElementById('addExerciseSelect').value;
      if (selectedExercise) {
          ui.renderExercise(selectedExercise);
          document.getElementById('addExerciseSelect').value = ""; //Reset value
      } else {
          ui.showAlert('Please select an exercise to add.', 'warning'); // Warning
      }
    });
});

async function selectGroup(group) {
    selectedGroup = group;
    ui.hideGroupSelection();
    ui.showAppContent();
    ui.showLoadingIndicator();
    await exercises.loadExercises();
    await loadAndDisplaySchedule();
    ui.hideLoadingIndicator();

    document.getElementById('exercisesModal').addEventListener('click', handleModalClickOutside);
    document.getElementById('exerciseDetailsModal').addEventListener('click', handleModalClickOutside);
    document.getElementById('editExerciseModal').addEventListener('click', handleModalClickOutside);

}

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
    if (!selectedGroup) return;
    ui.showLoadingIndicator();

    try {
        await schedules.loadSchedule(selectedGroup, currentWeek);
        ui.updateWeekDisplay(currentWeek.split('-')[1], schedules.calculateDateRange(currentWeek));
        exercises.populateAddExerciseDropdown();

    } catch (error) {
        ui.showAlert('Failed to load schedule. Please select a group and week.', 'error'); // Error
        console.error("Error in loadAndDisplaySchedule:", error);
        ui.hideLoadingIndicator();
        exercises.populateAddExerciseDropdown();
        return;
    }

    ui.hideLoadingIndicator();
}

async function addScheduleForCurrentWeek(group, yearWeek) {
    await schedules.createEmptySchedule(group, yearWeek)
}