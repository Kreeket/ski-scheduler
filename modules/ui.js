// ui.js
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
            renderExercise(exerciseName); // Simplified call
        });
    }

    hideAddScheduleButton();
}

// --- MODIFIED renderExercise (Uses Chips) ---
export function renderExercise(exerciseName) {
    const dynamicExercisesContainer = document.getElementById('dynamicExercises');

    const exerciseDiv = document.createElement('div');
    exerciseDiv.classList.add('exercise-chip', 'flex', 'items-center', 'space-x-2', 'bg-blue-100', 'text-blue-800', 'rounded-full', 'px-3', 'py-1', 'mb-2'); // Added classes

    const exerciseNameSpan = document.createElement('span');
    exerciseNameSpan.textContent = exerciseName;
    exerciseNameSpan.classList.add('flex-grow', 'text-sm');  // Added text-sm

    const detailsButton = document.createElement('button');
    detailsButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>`; // Added icon
    detailsButton.type = 'button';
    detailsButton.classList.add('btn-chip', 'text-blue-800', 'hover:text-blue-600'); // Added classes for styling
    detailsButton.dataset.exerciseName = exerciseName;
      detailsButton.addEventListener('click', (event) => {
        const name = event.currentTarget.dataset.exerciseName; // Use currentTarget
        const exercise = getExerciseByName(name);
        if (exercise) {
            showExerciseDetails(exercise);
        }
    });

    const removeButton = document.createElement('button');
    removeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>`; // Added icon
    removeButton.type = 'button';
    removeButton.classList.add('btn-chip', 'text-red-600', 'hover:text-red-800');  // Added classes
    removeButton.addEventListener('click', () => {
        exerciseDiv.remove();
    });

    exerciseDiv.appendChild(exerciseNameSpan);
    exerciseDiv.appendChild(detailsButton);
    exerciseDiv.appendChild(removeButton);
    dynamicExercisesContainer.appendChild(exerciseDiv);
}
// --- getScheduleFormData ---
export function getScheduleFormData() {
    const dynamicExerciseElements = document.querySelectorAll('#dynamicExercises .exercise-chip span'); // Select the span inside .exercise-chip
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
    document.getElementById('loadingIndicatorWrapper').classList.remove('hidden');
}

export function hideLoadingIndicator() {
    document.getElementById('loadingIndicatorWrapper').classList.add('hidden');
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

export function showAlert(message, iconType = 'error') {
    Swal.fire({
        icon: iconType,
        title: 'Alert',
        text: message,
    });
}

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
      // --- Add Close Button Logic ---
    const closeButton = document.querySelector('#exerciseDetailsModal .modal-close-btn');
    if (closeButton) {
        closeButton.onclick = () => hideElement(document.getElementById('exerciseDetailsModal'));
    }
    showElement(document.getElementById('exerciseDetailsModal'));
}