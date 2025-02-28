// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { readData, writeData } = require('./db.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://exquisite-naiad-d9a129.netlify.app',
     process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        console.log("Request Origin:", origin);
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    }
}));

app.use(express.json());

// --- API Endpoints ---

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

// --- Legacy Schedules (kept for backward compatibility) ---
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

// --- New Sessions API ---
app.get('/api/sessions', async (req, res) => {
    try {
        let sessions = await readData('sessions.json');
        if (!Array.isArray(sessions)) {
            sessions = []; // Ensure sessions is an array
        }
        
        // Filter sessions based on query parameters
        if (Object.keys(req.query).length > 0) {
            sessions = filterSessions(sessions, req.query);
        }
        
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
});

app.get('/api/sessions/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const sessions = await readData('sessions.json');
        
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        res.json(session);
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(500).json({ message: 'Error fetching session' });
    }
});

app.post('/api/sessions', async (req, res) => {
    try {
        let sessions = await readData('sessions.json');
        if (!Array.isArray(sessions)) {
            sessions = []; // Ensure sessions is an array
        }
        
        // Create new session with UUID
        const newSession = {
            ...req.body,
            id: uuidv4()
        };
        
        // Validate session data
        if (!newSession.date || !newSession.group) {
            return res.status(400).json({ message: 'Session date and group are required.' });
        }
        
        sessions.push(newSession);
        await writeData('sessions.json', sessions);
        
        res.status(201).json(newSession);
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: 'Error creating session' });
    }
});

app.put('/api/sessions/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const updatedData = req.body;
        
        let sessions = await readData('sessions.json');
        if (!Array.isArray(sessions)) {
            sessions = []; // Ensure sessions is an array
        }
        
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex === -1) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        // Maintain the original ID
        const updatedSession = {
            ...updatedData,
            id: sessionId
        };
        
        sessions[sessionIndex] = updatedSession;
        await writeData('sessions.json', sessions);
        
        res.json(updatedSession);
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ message: 'Error updating session' });
    }
});

app.delete('/api/sessions/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        let sessions = await readData('sessions.json');
        
        if (!Array.isArray(sessions)) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex === -1) {
            return res.status(404).json({ message: 'Session not found' });
        }
        
        sessions.splice(sessionIndex, 1);
        await writeData('sessions.json', sessions);
        
        res.status(200).json({ message: 'Session deleted' });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: 'Error deleting session' });
    }
});

// Filter sessions based on query parameters
function filterSessions(sessions, query) {
    return sessions.filter(session => {
        let match = true;
        
        // Filter by group
        if (query.group && session.group !== query.group) {
            match = false;
        }
        
        // Filter by date range
        if (query.startDate && query.endDate) {
            const sessionDate = new Date(session.date);
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);
            
            // Set time to midnight to compare dates only
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            if (sessionDate < startDate || sessionDate > endDate) {
                match = false;
            }
        } else if (query.date) {
            // Filter by exact date
            if (session.date !== query.date) {
                match = false;
            }
        }
        
        return match;
    });
}

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