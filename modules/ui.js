// ui.js
// NO import statement for SweetAlert2 needed when using the UMD build and <script> tag

import { getExerciseByName } from './exercises.js';

export function updateWeekDisplay(weekNumber, dateRange) {
    document.getElementById('currentWeekDisplay').textContent = `v${weekNumber} (${dateRange.formatted})`;
}

export function populateScheduleForm(schedule) {
    const leadersInput = document.getElementById('leaders');
    leadersInput.value = schedule.leaders || '';

    const dynamicExercisesContainer = document.getElementById('dynamicExercises');
    dynamicExercisesContainer.innerHTML = '';

    if (schedule.exercises && Array.isArray(schedule.exercises)) {
        schedule.exercises.forEach(exerciseName => {
            const selectId = `dynamicSelect-${Date.now()}`;
            renderExercise(exerciseName, selectId);
        });
    }

    hideAddScheduleButton();
}

export function renderExercise(exerciseName, selectId) {
    const dynamicExercisesContainer = document.getElementById('dynamicExercises');

    const exerciseDiv = document.createElement('div');
    exerciseDiv.classList.add('schedule-item', 'flex', 'items-center', 'space-x-2');

    const exerciseNameSpan = document.createElement('span');
    exerciseNameSpan.textContent = exerciseName;
    exerciseNameSpan.classList.add('flex-grow');

    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'Details';
    detailsButton.type = 'button';
    detailsButton.classList.add('btn-base', 'btn-secondary', 'text-xs');
    detailsButton.dataset.exerciseName = exerciseName;
     detailsButton.addEventListener('click', (event) => {
        const name = event.target.dataset.exerciseName;
        const exercise = getExerciseByName(name);
        if (exercise) {
            showExerciseDetails(exercise);
        }
    });


    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.type = 'button';
    removeButton.classList.add('btn-base', 'btn-danger', 'text-xs');
    removeButton.addEventListener('click', () => {
        exerciseDiv.remove();
        exercises.populateAddExerciseDropdown(); //Update exercises
    });

    exerciseDiv.appendChild(exerciseNameSpan);
    exerciseDiv.appendChild(detailsButton);
    exerciseDiv.appendChild(removeButton);
    dynamicExercisesContainer.appendChild(exerciseDiv);
}

export function getScheduleFormData() {
    const dynamicExerciseElements = document.querySelectorAll('#dynamicExercises .schedule-item span');
    const exercises = [];

    dynamicExerciseElements.forEach(span => {
        exercises.push(span.textContent);
    });

    return {
        exercises: exercises,
        leaders: document.getElementById('leaders').value
    };
}

export function clearScheduleForm() {
   document.getElementById('leaders').value = '';
   document.getElementById('dynamicExercises').innerHTML = '';
   showAddScheduleButton();
}

export function showAppContent() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('appContent').classList.remove('hidden');
}

export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

export function showLoadingIndicator() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('scheduleContainer').classList.add('hidden');
    hideAddScheduleButton();
}

export function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').classList.add('hidden');
}

export function showAddScheduleButton() {
    document.getElementById('addScheduleForCurrentWeek').classList.remove('hidden');
    document.getElementById('scheduleContainer').classList.add('hidden');
}

export function hideAddScheduleButton() {
    document.getElementById('addScheduleForCurrentWeek').classList.add('hidden');
    document.getElementById('scheduleContainer').classList.remove('hidden');
}

export function showGroupSelection() {
    document.getElementById('groupSelection').classList.remove('hidden');
}

export function hideGroupSelection() {
    document.getElementById('groupSelection').classList.add('hidden');
}

// --- Use Swal directly (no import) ---
export function showAlert(message, iconType = 'error') {
    Swal.fire({
        icon: iconType,
        title: 'Alert',
        text: message,
    });
}

// --- Use Swal directly (no import) ---
export async function showConfirm(message) {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Confirm',
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    });
    return result.isConfirmed;
}

export function showExerciseDetails(exercise) {
    if (!exercise) {
        console.error("showExerciseDetails called with null or undefined exercise");
        return;
    }
    document.getElementById('exerciseDetailsName').textContent = exercise.name;
    document.getElementById('exerciseDetailsDescription').innerHTML = `<p class="whitespace-pre-wrap">${exercise.description}</p>`;
    showElement(document.getElementById('exerciseDetailsModal'));
}