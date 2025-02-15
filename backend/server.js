require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const { readData, writeData } = require('./db.js');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000; // Use PORT from environment, or 3000

// Enable CORS for all origins (for development - be more restrictive in production)
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// --- API Endpoints ---

// Exercises (No changes here)
app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await readData('exercises.json');
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exercises' });
    }
});

app.post('/api/exercises', async (req, res) => {
    try {
        const exercises = await readData('exercises.json');
        const newExercise = {
            name: req.body.name,
            description: req.body.description,
        };
        exercises.push(newExercise);
        await writeData('exercises.json', exercises);
        res.status(201).json(newExercise); // 201 Created
    } catch (error) {
        res.status(500).json({ message: 'Error creating exercise' });
    }
});

app.put('/api/exercises/:id', async (req, res) => {
    try {
      const exerciseName = req.params.id;
      const exercises = await readData('exercises.json');
      const exerciseIndex = exercises.findIndex(ex => ex.name === exerciseName);

      if (exerciseIndex === -1) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      exercises[exerciseIndex] = {
        name: req.body.name,
        description: req.body.description
      };

      await writeData('exercises.json', exercises);
      res.json(exercises[exerciseIndex]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating exercise' });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
      const exerciseName = req.params.id;
      const exercises = await readData('exercises.json');
      const exerciseIndex = exercises.findIndex(ex => ex.name === exerciseName);

      if (exerciseIndex === -1) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      exercises.splice(exerciseIndex, 1);
      await writeData('exercises.json', exercises);
      res.status(200).json({ message: 'Exercise deleted' });
    } catch (error) {
       console.error(error);
      res.status(500).json({ message: 'Error deleting exercise' });
    }
});

// --- Schedules --- (Modified Routes)
app.get('/api/schedules/:group/:yearWeek', async (req, res) => {
    try {
        const { group, yearWeek } = req.params;
        const schedules = await readData('schedules.json');
        if (schedules[group] && schedules[group][yearWeek]) {
            res.json(schedules[group][yearWeek]);
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule' });
    }
});

app.put('/api/schedules/:group/:yearWeek', async (req, res) => {
    try {
        const { group, yearWeek } = req.params;
        const schedules = await readData('schedules.json');
		//Initialize group if not existing
        if (!schedules[group]) {
            schedules[group] = {};
        }
        schedules[group][yearWeek] = req.body;
        await writeData('schedules.json', schedules);
        res.json(schedules[group][yearWeek]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating schedule' });
    }
});


app.delete('/api/schedules/:group/:yearWeek', async (req, res) => {
    try {
        const { group, yearWeek } = req.params;
        const schedules = await readData('schedules.json');
        if (schedules[group] && schedules[group][yearWeek]) {
            delete schedules[group][yearWeek];
            await writeData('schedules.json', schedules);
            res.status(200).json({ message: 'Schedule deleted' });
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule' });
    }
});


// Login Route (using environment variable)
app.post('/api/login', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    try {
        const isMatch = await bcrypt.compare(password, process.env.HASHED_PASSWORD); // Use process.env
        if (isMatch) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});