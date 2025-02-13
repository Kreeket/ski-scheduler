const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- Data File Paths ---
const exercisesPath = path.join(__dirname, 'exercises.json');
const schedulesPath = path.join(__dirname, 'schedules.json');
const usersPath = path.join(__dirname, 'users.json'); // Path to users.json

// --- Helper Functions ---
async function readData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Return empty array for exercises/users, empty object for schedules
            return filePath === schedulesPath ? {} : [];
        }
        console.error('Error reading file:', error);
        throw error; // Re-throw other errors
    }
}

async function writeData(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
}

// --- API Endpoints: Exercises ---

app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await readData(exercisesPath);
        res.status(200).json(exercises); // Use 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Error getting exercises' });
    }
});

app.post('/api/exercises', async (req, res) => {
    try {
        const exercises = await readData(exercisesPath);
        const newExercise = req.body;

        if (!newExercise || !newExercise.name) {
            return res.status(400).json({ message: 'Exercise name is required' });
        }
        newExercise.description = newExercise.description || "";

        exercises.push(newExercise);
        await writeData(exercisesPath, exercises);
        res.status(201).json(newExercise); // 201 Created
    } catch (error) {
        res.status(500).json({ message: 'Error adding exercise' });
    }
});

app.put('/api/exercises/:id', async (req, res) => {
    try {
        const exercises = await readData(exercisesPath);
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
        await writeData(exercisesPath, exercises);
        res.status(200).json(exercises[index]); // 200 OK

    } catch (error) {
        res.status(500).json({ message: 'Error updating exercise' });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
        let exercises = await readData(exercisesPath);
        const exerciseId = req.params.id;
        exercises = exercises.filter(ex => ex.name !== exerciseId);
        await writeData(exercisesPath, exercises);
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exercise' });
    }
});

// --- API Endpoints: Schedules ---

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

app.delete('/api/schedules/:date/:group', async (req, res) => {
    try {
        const schedules = await readData(schedulesPath);
        const { date, group } = req.params;

        if (schedules[date] && schedules[date][group]) {
            delete schedules[date][group];
            if (Object.keys(schedules[date]).length === 0) {
                delete schedules[date];
            }
            await writeData(schedulesPath, schedules);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule' });
    }
});

// --- API Endpoints: Users ---
// Get all users
app.get('/api/users', async (req, res) => {  // Added route for /api/users
    try {
        const users = await readData(usersPath);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error getting users' });
    }
});

app.get('/api/schedules', async(req, res) => {
  try {
    const schedules = await readData(schedulesPath)
    res.status(200).json(schedules)
  } catch (error) {
    res.status(500).json({message: 'Error getting schedule'})
  }
})

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});