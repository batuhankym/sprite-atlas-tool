/**
 * Main UI controller - handles events and coordinates UI updates
 * @module ui/uiController
 */

import * as state from './uiState.js';
import { initFileInput, updateSpriteList, updateUnpackFileList } from './fileInput.js';
import { initPreviewCanvas, renderAtlas, renderAtlasImage, clearCanvas } from './previewCanvas.js';
import { initLogPanel, logInfo, logWarning, logError, clearLog } from './logPanel.js';
import { packAtlas } from '../core/atlasPacker.js';
import { unpackAtlas } from '../core/atlasUnpacker.js';
import { canvasToBlob } from '../utils/imageUtils.js';
import { downloadBlob, downloadJSON } from '../utils/download.js';

/**
 * DOM element references
 */
let elements = {
    modePackBtn: null,
    modeUnpackBtn: null,
    dropZone: null,
    fileInput: null,
    fileList: null,
    settingsPanel: null,
    paddingInput: null,
    maxSizeSelect: null,
    powerOfTwoCheckbox: null,
    generateBtn: null,
    downloadAtlasBtn: null,
    downloadJsonBtn: null,
    downloadAllSpritesBtn: null,
    previewCanvas: null,
    logPanel: null,
    clearFilesBtn: null
};

/**
 * Initializes the entire UI
 */
export function initUI() {
    // Get DOM elements
    elements.modePackBtn = document.getElementById('mode-pack');
    elements.modeUnpackBtn = document.getElementById('mode-unpack');
    elements.dropZone = document.getElementById('drop-zone');
    elements.fileInput = document.getElementById('file-input');
    elements.fileList = document.getElementById('file-list');
    elements.settingsPanel = document.getElementById('settings-panel');
    elements.paddingInput = document.getElementById('padding-input');
    elements.maxSizeSelect = document.getElementById('max-size-select');
    elements.powerOfTwoCheckbox = document.getElementById('power-of-two');
    elements.generateBtn = document.getElementById('generate-btn');
    elements.downloadAtlasBtn = document.getElementById('download-atlas-btn');
    elements.downloadJsonBtn = document.getElementById('download-json-btn');
    elements.downloadAllSpritesBtn = document.getElementById('download-all-sprites-btn');
    elements.previewCanvas = document.getElementById('preview-canvas');
    elements.logPanel = document.getElementById('log-panel');
    elements.clearFilesBtn = document.getElementById('clear-files-btn');

    // Initialize components
    initLogPanel(elements.logPanel);
    initPreviewCanvas(elements.previewCanvas);

    // Initialize file input
    initFileInput({
        dropZone: elements.dropZone,
        fileInput: elements.fileInput,
        fileList: elements.fileList,
        onSpritesLoaded: handleSpritesLoaded,
        onAtlasLoaded: handleAtlasLoaded,
        onMetadataLoaded: handleMetadataLoaded,
        onError: (msg) => logError(msg),
        getMode: () => state.getMode()
    });

    // Mode switching
    elements.modePackBtn.addEventListener('click', () => switchMode('pack'));
    elements.modeUnpackBtn.addEventListener('click', () => switchMode('unpack'));

    // Settings changes
    elements.paddingInput.addEventListener('change', updateSettingsFromUI);
    elements.maxSizeSelect.addEventListener('change', updateSettingsFromUI);
    elements.powerOfTwoCheckbox.addEventListener('change', updateSettingsFromUI);

    // Action buttons
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.downloadAtlasBtn.addEventListener('click', handleDownloadAtlas);
    elements.downloadJsonBtn.addEventListener('click', handleDownloadJson);
    elements.downloadAllSpritesBtn.addEventListener('click', handleDownloadAllSprites);
    elements.clearFilesBtn.addEventListener('click', handleClearFiles);

    // Initialize settings from defaults
    syncSettingsToUI();

    // Initial UI state
    updateUIForMode();

    logInfo('Sprite Atlas Tool initialized. Ready to pack or unpack sprites.');
}

/**
 * Switches between pack and unpack modes
 * @param {'pack' | 'unpack'} mode
 */
function switchMode(mode) {
    if (state.getMode() === mode) return;

    state.setMode(mode);
    updateUIForMode();
    clearCanvas();
    updateFileListDisplay();

    logInfo(`Switched to ${mode.toUpperCase()} mode.`);
}

/**
 * Updates UI visibility based on current mode
 */
function updateUIForMode() {
    const mode = state.getMode();
    const isPack = mode === 'pack';

    // Update mode buttons
    elements.modePackBtn.classList.toggle('active', isPack);
    elements.modeUnpackBtn.classList.toggle('active', !isPack);

    // Show/hide settings panel (only for pack mode)
    elements.settingsPanel.style.display = isPack ? 'block' : 'none';

    // Update generate button text
    elements.generateBtn.textContent = isPack ? 'Generate Atlas' : 'Extract Sprites';

    // Show/hide download buttons
    elements.downloadAtlasBtn.style.display = isPack ? 'inline-block' : 'none';
    elements.downloadJsonBtn.style.display = isPack ? 'inline-block' : 'none';
    elements.downloadAllSpritesBtn.style.display = isPack ? 'none' : 'inline-block';

    // Update drop zone text
    const dropZoneText = elements.dropZone.querySelector('.drop-zone-text');
    if (dropZoneText) {
        dropZoneText.textContent = isPack
            ? 'Drop sprite images here or click to select'
            : 'Drop atlas image and JSON here or click to select';
    }
}

/**
 * Updates settings state from UI inputs
 */
function updateSettingsFromUI() {
    state.updateSettings({
        padding: parseInt(elements.paddingInput.value, 10) || 0,
        maxAtlasSize: parseInt(elements.maxSizeSelect.value, 10) || 1024,
        powerOfTwo: elements.powerOfTwoCheckbox.checked
    });
}

/**
 * Syncs UI inputs to match state
 */
function syncSettingsToUI() {
    const settings = state.getSettings();
    elements.paddingInput.value = settings.padding;
    elements.maxSizeSelect.value = settings.maxAtlasSize;
    elements.powerOfTwoCheckbox.checked = settings.powerOfTwo;
}

/**
 * Handler for loaded sprites (pack mode)
 * @param {import('../core/imageLoader.js').SpriteInput[]} sprites
 */
function handleSpritesLoaded(sprites) {
    state.addLoadedSprites(sprites);
    updateFileListDisplay();
    logInfo(`Loaded ${sprites.length} sprite(s). Total: ${state.getLoadedSprites().length}`);
}

/**
 * Handler for loaded atlas image (unpack mode)
 * @param {HTMLImageElement} image
 */
function handleAtlasLoaded(image) {
    state.setAtlasImage(image);
    updateFileListDisplay();
    renderAtlasImage(image);
    logInfo(`Atlas image loaded: ${image.naturalWidth}×${image.naturalHeight}`);
}

/**
 * Handler for loaded metadata (unpack mode)
 * @param {import('../core/imageLoader.js').AtlasMetadata} metadata
 */
function handleMetadataLoaded(metadata) {
    state.setMetadata(metadata);
    updateFileListDisplay();
    logInfo(`Metadata loaded: ${metadata.frames.length} frame(s)`);
}

/**
 * Updates the file list display based on mode
 */
function updateFileListDisplay() {
    const mode = state.getMode();

    if (mode === 'pack') {
        updateSpriteList(elements.fileList, state.getLoadedSprites());
    } else {
        updateUnpackFileList(elements.fileList, state.getAtlasImage(), state.getMetadata());
    }
}

/**
 * Handles the generate/extract button click
 */
async function handleGenerate() {
    const mode = state.getMode();

    if (mode === 'pack') {
        await generateAtlas();
    } else {
        await extractSprites();
    }
}

/**
 * Generates the atlas (pack mode)
 */
async function generateAtlas() {
    const sprites = state.getLoadedSprites();

    if (sprites.length === 0) {
        logError('No sprites loaded. Please add at least one image before generating.');
        return;
    }

    logInfo('Generating atlas...');

    const settings = state.getSettings();
    const result = packAtlas(sprites, settings);

    if (!result.success) {
        logError(result.error);
        return;
    }

    state.setGeneratedAtlas(result.result.canvas);
    state.setMetadata(result.result.metadata);

    renderAtlas(result.result.canvas);

    logInfo(`Atlas generated! Size: ${result.result.canvas.width}×${result.result.canvas.height}, Sprites: ${result.result.metadata.frames.length}`);
}

/**
 * Extracts sprites from atlas (unpack mode)
 */
async function extractSprites() {
    const atlasImage = state.getAtlasImage();
    const metadata = state.getMetadata();

    if (!atlasImage) {
        logError('No atlas image loaded. Please select an atlas PNG.');
        return;
    }

    if (!metadata) {
        logError('No metadata loaded. Please select a JSON metadata file.');
        return;
    }

    logInfo('Extracting sprites...');

    const result = await unpackAtlas(atlasImage, metadata);

    if (!result.success) {
        logError(result.error);
        return;
    }

    state.setExtractedSprites(result.result);

    logInfo(`Extracted ${result.result.length} sprite(s). Click "Download All Sprites" to save.`);
}

/**
 * Downloads the generated atlas as PNG
 */
async function handleDownloadAtlas() {
    const atlas = state.getGeneratedAtlas();

    if (!atlas) {
        logError('No atlas generated. Please generate an atlas first.');
        return;
    }

    try {
        const blob = await canvasToBlob(atlas);
        downloadBlob(blob, 'atlas.png');
        logInfo('Atlas PNG downloaded.');
    } catch (error) {
        logError('Failed to download atlas: ' + error.message);
    }
}

/**
 * Downloads the metadata as JSON
 */
function handleDownloadJson() {
    const metadata = state.getMetadata();

    if (!metadata) {
        logError('No metadata available. Please generate an atlas first.');
        return;
    }

    downloadJSON(metadata, 'atlas.json');
    logInfo('Metadata JSON downloaded.');
}

/**
 * Downloads all extracted sprites
 * TODO: Implement ZIP download for better UX
 */
async function handleDownloadAllSprites() {
    const sprites = state.getExtractedSprites();

    if (sprites.length === 0) {
        logError('No sprites extracted. Please extract sprites first.');
        return;
    }

    logInfo(`Downloading ${sprites.length} sprite(s)...`);

    // Download each sprite individually
    // TODO: Use JSZip for bundled download
    for (const sprite of sprites) {
        downloadBlob(sprite.blob, `${sprite.name}.png`);
    }

    logInfo('All sprites downloaded.');
}

/**
 * Clears all loaded files
 */
function handleClearFiles() {
    const mode = state.getMode();

    if (mode === 'pack') {
        state.clearLoadedSprites();
        state.setGeneratedAtlas(null);
        state.setMetadata(null);
    } else {
        state.setAtlasImage(null);
        state.setMetadata(null);
        state.setExtractedSprites([]);
    }

    updateFileListDisplay();
    clearCanvas();
    logInfo('Files cleared.');
}
