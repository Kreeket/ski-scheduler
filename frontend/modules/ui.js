// frontend/modules/ui.js

// Helper Function: Show Element
export function showElement(element) {
    element.classList.remove('hidden');
}

// Helper Function: Hide Element
export function hideElement(element) {
    element.classList.add('hidden');
}


// Helper Function: Set value of input
export function setInputValue(elementId, value) {
    const element = document.getElementById(elementId);
     if (element) {
        element.value = value;
    } else {
        console.warn(`Element not found: ${elementId}`); //Warn if element is not found
    }
}

// Helper Function: Get value of input
export function getInputValue(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        return element.value;
    } else {
        console.warn(`Element not found: ${elementId}`); //Warn if element is not found
        return null; // Or return an empty string, depending on your needs
    }
}

// Helper Function: Set textContent of a element
export function setElementText(elementId, text){
    const element = document.getElementById(elementId)
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element not found: ${elementId}`); //Warn if element is not found
    }
}

// Helper Function: Get textContent of a element.
export function getElementText(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    return element.textContent;
  } else {
    console.warn(`Element not found: ${elementId}`);
    return null; // Or return an empty string
  }
}

// --- Modal Functions ---

export function openExerciseModal() {
    updateExerciseDropdown(); // Populate the dropdown with exercises, from exercise module
    showElement(document.getElementById('add-exercise-modal')); // Show the modal
}

export function closeExerciseModal() {
    hideElement(document.getElementById('add-exercise-modal')); // Hide the modal
}