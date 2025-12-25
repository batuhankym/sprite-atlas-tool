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
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    // Delay URL revocation to allow browser to read the blob
    // Immediate revocation causes GUID-style filenames on some browsers
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
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
