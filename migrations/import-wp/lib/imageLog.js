const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'failed_images_log.json');

/**
 * Logs failed image uploads to a file.
 * @param {Object} failedEntry - The failed image data.
 */
function logFailedImage(failedEntry) {
    let logs = [];

    // Load existing logs if the file exists
    if (fs.existsSync(LOG_FILE)) {
        const existingData = fs.readFileSync(LOG_FILE, 'utf-8');
        logs = existingData ? JSON.parse(existingData) : [];
    }

    logs.push(failedEntry);

    // Write updated logs to the file
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    console.log(`📄 Logged failed image: ${failedEntry.imageUrl}`);
}

module.exports = { logFailedImage };
