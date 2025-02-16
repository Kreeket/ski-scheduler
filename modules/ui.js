// ui.js
import { getExerciseByName } from './exercises.js'; // Import

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
            renderExercise(exerciseName); // Render read-only
        });
    }

    hideAddScheduleButton();
    // No exercises.populateExerciseDropdowns() call here!
}

export function renderExercise(exerciseName) {
    const dynamicExercisesContainer = document.getElementById('dynamicExercises');

    const exerciseDiv = document.createElement('div');
    exerciseDiv.classList.add('schedule-item', 'flex', 'items-center', 'space-x-2');

    // Display the exercise name as text
    const exerciseNameSpan = document.createElement('span');
    exerciseNameSpan.textContent = exerciseName;
    exerciseNameSpan.classList.add('flex-grow'); // Make text take up available space

    const detailsButton = document.createElement('button');
    detailsButton.textContent = 'Details';
    detailsButton.type = 'button';
    detailsButton.classList.add('btn-base', 'btn-secondary', 'text-xs');
    // Store exercise name on the details button for lookup
    detailsButton.dataset.exerciseName = exerciseName;
     detailsButton.addEventListener('click', (event) => {
        const name = event.target.dataset.exerciseName;
        const exercise = getExerciseByName(name); // Use the helper function
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
    });

    exerciseDiv.appendChild(exerciseNameSpan); // Add the exercise name
    exerciseDiv.appendChild(detailsButton);
    exerciseDiv.appendChild(removeButton);
    dynamicExercisesContainer.appendChild(exerciseDiv);
}

export function getScheduleFormData() {
    const dynamicExerciseElements = document.querySelectorAll('#dynamicExercises .schedule-item span'); // Get SPAN elements
    const exercises = [];

    dynamicExerciseElements.forEach(span => {
        exercises.push(span.textContent); // Get text content (exercise name)
    });

    return {
        exercises: exercises,
        leaders: document.getElementById('leaders').value
    };
}

export function clearScheduleForm() {
   document.getElementById('leaders').value = '';
   document.getElementById('dynamicExercises').innerHTML = ''; // Clear
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

export function showAlert(message) {
    alert(message);
}

export async function showConfirm(message) {
    return confirm(message);
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