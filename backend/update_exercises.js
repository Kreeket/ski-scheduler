// update_exercises.js (Run this ONCE in your backend directory)
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

async function updateExercises() {
    try {
        const exercises = await fs.readFile('exercises.json', 'utf8');
        const parsedExercises = JSON.parse(exercises);

        const updatedExercises = parsedExercises.map(exercise => {
            // Add an ID ONLY if it doesn't already exist
            if (!exercise.id) {
                return { id: uuidv4(), ...exercise };
            }
            return exercise; // Keep existing exercises as they are
        });

        await fs.writeFile('exercises.json', JSON.stringify(updatedExercises, null, 2), 'utf8');
        console.log('exercises.json updated successfully!');
    } catch (error) {
        console.error('Error updating exercises.json:', error);
    }
}

updateExercises();