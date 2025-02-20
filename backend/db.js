// db.js (Improved readability and consistency)
const fs = require('fs').promises;
const path = require('path');

// Helper function to construct the full path to a data file
function getDataFilePath(filename) {
  return path.join(__dirname, filename); // Using 'filename' consistently
}

// Constants for default return values
const DEFAULT_SCHEDULES = {};
const DEFAULT_EXERCISES = [];

async function readData(filename) {
  try {
    const filePath = getDataFilePath(filename); // using the consistent 'filename'
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an appropriate default
    if (error.code === 'ENOENT') {
      if (filename === 'schedules.json') {
        return DEFAULT_SCHEDULES; // Use the constant
      } else if (filename === 'exercises.json' || filename === 'users.json') {
        return DEFAULT_EXERCISES; // Use the constant
      }
    }
    console.error(`Error reading ${filename}:`, error); // Log the error
    throw error; // Re-throw other errors
  }
}

async function writeData(filename, data) {
  try {
    const filePath = getDataFilePath(filename); // using the consistent 'filename'
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error); // Log the error!
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = { readData, writeData };