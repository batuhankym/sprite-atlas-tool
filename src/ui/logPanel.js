/**
 * Log panel UI component for displaying messages
 * @module ui/logPanel
 */

/**
 * @typedef {'info' | 'warning' | 'error'} LogLevel
 */

/**
 * @type {HTMLElement|null}
 */
let logPanelElement = null;

/**
 * Maximum number of log entries to keep
 */
const MAX_LOG_ENTRIES = 100;

/**
 * Initializes the log panel
 * @param {HTMLElement} element - The log panel container element
 */
export function initLogPanel(element) {
    logPanelElement = element;
    logPanelElement.innerHTML = '';
}

/**
 * Logs a message to the panel
 * @param {string} message - Message to display
 * @param {LogLevel} [level='info'] - Message level
 */
export function log(message, level = 'info') {
    if (!logPanelElement) {
        console.warn('Log panel not initialized');
        console.log(`[${level.toUpperCase()}] ${message}`);
        return;
    }

    const entry = document.createElement('div');
    entry.className = `log-entry log-${level}`;

    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-message">${escapeHtml(message)}</span>`;

    logPanelElement.appendChild(entry);

    // Trim old entries
    while (logPanelElement.children.length > MAX_LOG_ENTRIES) {
        logPanelElement.removeChild(logPanelElement.firstChild);
    }

    // Auto-scroll to bottom
    logPanelElement.scrollTop = logPanelElement.scrollHeight;

    // Also log to console for debugging
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
}

/**
 * Logs an info message
 * @param {string} message
 */
export function logInfo(message) {
    log(message, 'info');
}

/**
 * Logs a warning message
 * @param {string} message
 */
export function logWarning(message) {
    log(message, 'warning');
}

/**
 * Logs an error message
 * @param {string} message
 */
export function logError(message) {
    log(message, 'error');
}

/**
 * Clears all log entries
 */
export function clearLog() {
    if (logPanelElement) {
        logPanelElement.innerHTML = '';
    }
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
