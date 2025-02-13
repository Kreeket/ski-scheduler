// backend/db.js
const fs = require('fs').promises;
const path = require('path');

// Helper function to construct absolute paths to data files
function dataPath(filename) {
    return path.join(__dirname, filename);
}

async function readData(filename) {
    try {
        const data = await fs.readFile(dataPath(filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Return empty array/object as appropriate.
            return (filename === 'schedules.json') ? {} : [];
        }
        throw error; // Re-throw other errors
    }
}

async function writeData(filename, data) {
    try {
        await fs.writeFile(dataPath(filename), JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        throw error; // Re-throw for handling by calling function
    }
}
// Export all helper functions.
module.exports = { readData, writeData };