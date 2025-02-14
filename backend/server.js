const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { readData, writeData } = require('./db.js');

const app = express();
const port = 3000;

// Enable CORS for all origins (for development - be more restrictive in production)
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// --- API Endpoints ---

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await readData('users.json');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Exercises
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
      res.json(exercises[exerciseIndex]); //return updated
    } catch (error) {
      console.error(error); // Log the actual error
      res.status(500).json({ message: 'Error updating exercise' });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
      const exerciseName = req.params.id; //id
      const exercises = await readData('exercises.json');
      const exerciseIndex = exercises.findIndex(ex => ex.name === exerciseName);

      if (exerciseIndex === -1) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      exercises.splice(exerciseIndex, 1);
      await writeData('exercises.json', exercises);
      res.status(200).json({ message: 'Exercise deleted' });
    } catch (error) {
       console.error(error); // Log the actual error
      res.status(500).json({ message: 'Error deleting exercise' });
    }
});

// Schedules
app.get('/api/schedules/:week', async (req, res) => {
    try {
        const weekNumber = parseInt(req.params.week);
        const schedules = await readData('schedules.json');
        if (schedules[weekNumber]) {
            res.json(schedules[weekNumber]);
        } else {
            res.status(404).json({ message: 'Schedule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule' });
    }
});

app.put('/api/schedules/:week', async (req, res) => {
    try {
        const weekNumber = parseInt(req.params.week);
        const schedules = await readData('schedules.json');
        schedules[weekNumber] = req.body;
        await writeData('schedules.json', schedules);
        res.json(schedules[weekNumber]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating schedule' });
    }
});

app.delete('/api/schedules/:week', async (req, res) => {
    try {
        const weekNumber = parseInt(req.params.week);
        const schedules = await readData('schedules.json');
        if (schedules[weekNumber]) {
          delete schedules[weekNumber];
          await writeData('schedules.json', schedules);
          res.status(200).json({ message: 'Schedule deleted' });
        }else {
          res.status(404).json({ message: 'Schedule not found' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule' });
    }
});
//get all schedules
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await readData('schedules.json');
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});