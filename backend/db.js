const fs = require('fs').promises;
const path = require('path');

// Helper function to construct the full path to a data file
function getDataFilePath(filename) {
    return path.join(__dirname, filename);
}

async function readData(filename) {
    try {
        const filePath = getDataFilePath(filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, return an appropriate default
        if (error.code === 'ENOENT') {
            if (filename === 'schedules.json') {
                return {}; // Return an empty object for schedules
            } else if (filename === 'exercises.json' || filename === 'users.json') {
                return []; // Return an empty array for exercises and users
            }
        }
        throw error; // Re-throw other errors
    }
}
async function writeData(filename, data) {
    const filePath = getDataFilePath(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };