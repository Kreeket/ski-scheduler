// exercises.js - API module for exercise operations
import { getApiBaseUrl, fetchWithErrorHandling, createRequestOptions } from './base.js';

/**
 * Get all exercises
 * @returns {Promise<Array>} - Exercises array
 */
export async function getExercises() {
    const url = `${getApiBaseUrl()}/exercises`;
    return fetchWithErrorHandling(url);
}

/**
 * Get a specific exercise by ID
 * @param {string} id - Exercise ID
 * @returns {Promise<Object>} - Exercise data
 */
export async function getExerciseById(id) {
    const url = `${getApiBaseUrl()}/exercises/${id}`;
    return fetchWithErrorHandling(url);
}

/**
 * Create a new exercise
 * @param {Object} exerciseData - Exercise data (name, description)
 * @returns {Promise<Object>} - Created exercise
 */
export async function createExercise(exerciseData) {
    const url = `${getApiBaseUrl()}/exercises`;
    const options = createRequestOptions('POST', exerciseData);
    return fetchWithErrorHandling(url, options);
}

/**
 * Update an existing exercise
 * @param {string} id - Exercise ID
 * @param {Object} exerciseData - Updated exercise data
 * @returns {Promise<Object>} - Updated exercise
 */
export async function updateExercise(id, exerciseData) {
    const url = `${getApiBaseUrl()}/exercises/${id}`;
    const options = createRequestOptions('PUT', exerciseData);
    return fetchWithErrorHandling(url, options);
}

/**
 * Delete an exercise
 * @param {string} id - Exercise ID
 * @returns {Promise<boolean>} - Success indicator
 */
export async function deleteExercise(id) {
    const url = `${getApiBaseUrl()}/exercises/${id}`;
    const options = createRequestOptions('DELETE');
    await fetchWithErrorHandling(url, options);
    return true;
}