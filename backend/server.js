// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // We need CORS for Render
const { readData, writeData } = require('./db.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// --- CORS Configuration (Corrected for Render) ---
// Use an array, and make sure process.env.FRONTEND_URL is *actually* set on Render.
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
     process.env.FRONTEND_URL // This MUST be set in Render's environment variables
];

//Debugging
console.log("Allowed Origins:", allowedOrigins); // LOG THE ALLOWED ORIGINS

app.use(cors({
    origin: function (origin, callback) {
        console.log("Request Origin:", origin); // Log the requesting origin
        if (!origin) return callback(null, true); // Allow requests with no origin (like some server-side requests)

        if (allowedOrigins.includes(origin)) { // Use includes() for cleaner checking
            callback(null, true);
        } else {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    }
}));

app.use(express.json());

// --- API Endpoints --- (Rest of your API endpoints are fine)

// Exercises
app.get('/api/exercises', async (req, res) => {
    try {
      const exercises = await readData('exercises.json');
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: 'Error fetching exercises' });
    }
  });
  
  app.post('/api/exercises', async (req, res) => {
      try {
        const exercises = await readData('exercises.json');
        const { name, description } = req.body;
  
        if (!name || !description) {
          return res.status(400).json({ message: 'Exercise name and description are required.' });
        }
  
        const newExercise = { id: uuidv4(), name, description };
        exercises.push(newExercise);
        await writeData('exercises.json', exercises);
        res.status(201).json(newExercise);
      } catch (error) {
        console.error("Error creating exercise:", error);
        res.status(500).json({ message: 'Error creating exercise' });
      }
    });
  
  app.put('/api/exercises/:id', async (req, res) => {
      try {
        const exerciseId = req.params.id;
        const { name, description } = req.body;
  
        if (!name || !description) {
          return res.status(400).json({ message: 'Exercise name and description are required.' });
        }
  
        const exercises = await readData('exercises.json');
        const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
  
        if (exerciseIndex === -1) {
          return res.status(404).json({ message: 'Exercise not found' });
        }
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], name, description };
          await writeData('exercises.json', exercises);
        res.json(exercises[exerciseIndex]);
      } catch (error) {
        console.error("Error updating exercise:", error);
        res.status(500).json({ message: 'Error updating exercise' });
      }
    });
  
  app.delete('/api/exercises/:id', async (req, res) => {
      try {
        const exerciseId = req.params.id;
        const exercises = await readData('exercises.json');
        const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
  
        if (exerciseIndex === -1) {
          return res.status(404).json({ message: 'Exercise not found' });
        }
  
        exercises.splice(exerciseIndex, 1);
        await writeData('exercises.json', exercises);
        res.status(200).json({ message: 'Exercise deleted' });
      } catch (error) {
        console.error("Error deleting exercise:", error);
        res.status(500).json({ message: 'Error deleting exercise' });
      }
    });
  
  // --- Schedules ---
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
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: 'Error fetching schedule' });
      }
    });
  
  app.put('/api/schedules/:group/:yearWeek', async (req, res) => {
      try {
        const { group, yearWeek } = req.params;
        const schedules = await readData('schedules.json');
        if (!schedules[group]) {
          schedules[group] = {};
        }
        schedules[group][yearWeek] = req.body;
        await writeData('schedules.json', schedules);
        res.json(schedules[group][yearWeek]);
      } catch (error) {
        console.error("Error updating schedule:", error);
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
        console.error("Error deleting schedule:", error);
        res.status(500).json({ message: 'Error deleting schedule' });
      }
    });
  
  // Login Route
  app.post('/api/login', async (req, res) => {
      const { password } = req.body;
      if (!password) {
          return res.status(400).json({ success: false, message: 'Password is required.' });
      }
  
      try {
          const isMatch = await bcrypt.compare(password, process.env.HASHED_PASSWORD);
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