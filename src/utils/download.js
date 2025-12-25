/**
 * Download utility functions
 * @module utils/download
 */

/**
 * Triggers a browser download for a Blob
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Desired filename
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Downloads a JavaScript object as a JSON file
 * @param {Object} data - Data to serialize as JSON
 * @param {string} filename - Desired filename (should end with .json)
 */
export function downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, filename);
}
