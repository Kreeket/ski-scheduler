// frontend/modules/ui.js

// Helper Function: Show Element
export function showElement(element) {
    element.classList.remove('hidden');
}

// Helper Function: Hide Element
export function hideElement(element) {
    element.classList.add('hidden');
}

// You can add more UI-related helper functions here as needed, e.g.,
//
// export function setInputValue(elementId, value) {
//   document.getElementById(elementId).value = value;
// }
//
// export function getInputValue(elementId) {
//   return document.getElementById(elementId).value;
// }
//
// export function setElementText(elementId, text) {
//  document.getElementById(elementId).textContent = text;
// }