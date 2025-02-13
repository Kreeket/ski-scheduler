// backend/exercises.js
const { readData, writeData } = require('./db'); // Import db functions


async function getAllExercises(req, res) {
    try {
        const exercises = await readData('exercises.json');
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error getting exercises' });
    }
}

async function createExercise(req, res) {
    try {
        const exercises = await readData('exercises.json');
        const newExercise = req.body;

        if (!newExercise || !newExercise.name) {
            return res.status(400).json({ message: 'Exercise name is required' });
        }
        newExercise.description = newExercise.description || "";

        exercises.push(newExercise);
        await writeData('exercises.json', exercises);
        res.status(201).json(newExercise);
    } catch (error) {
        res.status(500).json({ message: 'Error adding exercise' });
    }
}

async function updateExercise(req, res) {
    try {
        const exercises = await readData('exercises.json');
        const exerciseId = req.params.id;
        const updatedExercise = req.body;

        if (!updatedExercise || !updatedExercise.name) {
          return res.status(400).json({ message: 'Exercise name is required' });
        }
        updatedExercise.description = updatedExercise.description || "";

        const index = exercises.findIndex(ex => ex.name === exerciseId);
        if (index === -1) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        exercises[index] = { ...exercises[index], ...updatedExercise };
        await writeData('exercises.json', exercises);
        res.status(200).json(exercises[index]);

    } catch (error) {
        res.status(500).json({ message: 'Error updating exercise' });
    }
}


async function deleteExercise(req, res) {
    try {
        let exercises = await readData('exercises.json');
        const exerciseId = req.params.id;
        exercises = exercises.filter(ex => ex.name !== exerciseId);
        await writeData('exercises.json', exercises);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exercise' });
    }
}


module.exports = {
  getAllExercises,
  createExercise,
  updateExercise,
  deleteExercise
};