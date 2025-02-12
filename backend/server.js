const express = require('express');
const fs = require('fs').promises; // Use the promise-based version of fs
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all origins (for development - you might want to restrict this in production)
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Data File Paths ---
//IMPORTANT: Now the paths are relative to the backend folder
const exercisesPath = path.join(__dirname, 'exercises.json');
const schedulesPath = path.join(__dirname, 'schedules.json');
const usersPath = path.join(__dirname, 'users.json');

// --- Helper Functions ---
async function readData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { // File not found
            return {}; // Return an empty OBJECT for schedules
        }
        console.error('Error reading file:', error);
        throw error; // Re-throw other errors
    }
}

async function writeData(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8'); // Pretty-print JSON
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
}

// --- API Endpoints ---

// Get all exercises
app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await readData(exercisesPath);
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error getting exercises' });
    }
});

// Add a new exercise
app.post('/api/exercises', async (req, res) => {
    try {
        const exercises = await readData(exercisesPath);
        const newExercise = req.body;

        if (!newExercise || !newExercise.name) {
            return res.status(400).json({ message: 'Exercise name is required' });
        }

        exercises.push(newExercise);
        await writeData(exercisesPath, exercises);
        res.status(201).contentType('application/json').json(newExercise);
    } catch (error) {
        res.status(500).json({ message: 'Error adding exercise' });
    }
});

// Update an exercise
app.put('/api/exercises/:id', async (req, res) => {
    try {
        const exercises = await readData(exercisesPath);
        const exerciseId = req.params.id;
        const updatedExercise = req.body;

        if (!updatedExercise || !updatedExercise.name) {
          return res.status(400).json({ message: 'Exercise name is required' });
        }

        // Find the index of the exercise to update
        const index = exercises.findIndex(ex => ex.name === exerciseId); // Assuming 'name' is unique

        if (index === -1) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        exercises[index] = { ...exercises[index], ...updatedExercise }; // Update the exercise
        await writeData(exercisesPath, exercises);
        res.status(200).json(exercises[index]); // Return the updated exercise

    } catch (error) {
        res.status(500).json({ message: 'Error updating exercise' });
    }
});

// Delete an exercise
app.delete('/api/exercises/:id', async (req, res) => {
    try {
        let exercises = await readData(exercisesPath);
        const exerciseId = req.params.id;

        // Filter out the exercise to delete
        exercises = exercises.filter(ex => ex.name !== exerciseId); // Assuming 'name' is unique

        await writeData(exercisesPath, exercises);
        res.status(204).send(); // 204 No Content (successful deletion)

    } catch (error) {
        res.status(500).json({ message: 'Error deleting exercise' });
    }
});

// --- API Endpoints: Schedules ---

// Get a single schedule by date and group
app.get('/api/schedules/:date/:group', async (req, res) => {
    try {
        const schedules = await readData(schedulesPath);
        const { date, group } = req.params;
        const schedule = schedules[date]?.[group];

        if (!schedule) {
             return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error getting schedule' });
    }
});

// Update a schedule by date and group
app.put('/api/schedules/:date/:group', async (req, res) => {
    try {
        const schedules = await readData(schedulesPath);
        const { date, group } = req.params;
        const updatedSchedule = req.body;

      // Validate updatedSchedule to prevent errors
        if (!updatedSchedule || typeof updatedSchedule !== 'object') {
            return res.status(400).json({ message: 'Invalid schedule data' });
        }

        if (!schedules[date]) {
            schedules[date] = {};
        }
      // Ensure leaders is always an array
        if (updatedSchedule.leaders && typeof updatedSchedule.leaders === 'string') {
            updatedSchedule.leaders = updatedSchedule.leaders.split(',').map(leader => leader.trim()).filter(leader => leader !== "");
        } else if (!updatedSchedule.leaders) {
          updatedSchedule.leaders = [];
        }

        schedules[date][group] = updatedSchedule; // Directly update

        await writeData(schedulesPath, schedules);
        res.status(200).json(updatedSchedule);

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Error updating schedule' });
    }
});

// Delete a schedule by date and group
app.delete('/api/schedules/:date/:group', async (req, res) => {
    try {
        const schedules = await readData(schedulesPath);
        const { date, group } = req.params;

        if (schedules[date] && schedules[date][group]) {
            delete schedules[date][group]; // Delete the specific schedule

            // Optionally, clean up empty date entries
            if (Object.keys(schedules[date]).length === 0) {
                delete schedules[date];
            }

            await writeData(schedulesPath, schedules);
            res.status(204).send(); // 204 No Content
        } else {
            res.status(404).json({ message: 'Schedule not found' }); // Not found
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule' });
    }
});

// Get all schedules.
app.get('/api/schedules', async(req, res) => {
    try {
        const schedules = await readData(schedulesPath);
        res.status(200).json(schedules)
    } catch (error) {
        res.status(500).json({message: 'Error getting schedule'})
    }
})

// --- API Endpoints: Users ---
// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await readData(usersPath);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});