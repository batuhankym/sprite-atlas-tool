/**
 * UI State management
 * @module ui/uiState
 */

/**
 * @typedef {'pack' | 'unpack'} AppMode
 */

/**
 * @typedef {Object} PackSettings
 * @property {number} padding - Padding between sprites (px)
 * @property {number} maxAtlasSize - Maximum atlas dimension
 * @property {boolean} powerOfTwo - Force power-of-two dimensions
 */

/**
 * @typedef {Object} UIState
 * @property {AppMode} mode - Current application mode
 * @property {import('../core/imageLoader.js').SpriteInput[]} loadedSprites - Loaded sprites for packing
 * @property {HTMLImageElement|null} atlasImage - Loaded atlas image for unpacking
 * @property {import('../core/imageLoader.js').AtlasMetadata|null} metadata - Loaded/generated metadata
 * @property {HTMLCanvasElement|null} generatedAtlas - Generated atlas canvas
 * @property {import('../core/atlasUnpacker.js').ExtractedSprite[]} extractedSprites - Extracted sprites
 * @property {PackSettings} settings - Pack mode settings
 */

/**
 * Default pack settings
 */
const DEFAULT_SETTINGS = {
    padding: 1,
    maxAtlasSize: 1024,
    powerOfTwo: false
};

/**
 * The application state object
 * @type {UIState}
 */
const state = {
    mode: 'pack',
    loadedSprites: [],
    atlasImage: null,
    metadata: null,
    generatedAtlas: null,
    extractedSprites: [],
    settings: { ...DEFAULT_SETTINGS }
};

/**
 * Gets the current application mode
 * @returns {AppMode}
 */
export function getMode() {
    return state.mode;
}

/**
 * Sets the application mode
 * @param {AppMode} mode
 */
export function setMode(mode) {
    state.mode = mode;
    // Clear mode-specific state when switching
    if (mode === 'pack') {
        state.atlasImage = null;
        state.extractedSprites = [];
    } else {
        state.loadedSprites = [];
        state.generatedAtlas = null;
    }
    state.metadata = null;
}

/**
 * Gets loaded sprites (for pack mode)
 * @returns {import('../core/imageLoader.js').SpriteInput[]}
 */
export function getLoadedSprites() {
    return state.loadedSprites;
}

/**
 * Sets loaded sprites
 * @param {import('../core/imageLoader.js').SpriteInput[]} sprites
 */
export function setLoadedSprites(sprites) {
    state.loadedSprites = sprites;
}

/**
 * Adds sprites to the loaded list
 * @param {import('../core/imageLoader.js').SpriteInput[]} sprites
 */
export function addLoadedSprites(sprites) {
    state.loadedSprites = [...state.loadedSprites, ...sprites];
}

/**
 * Clears all loaded sprites
 */
export function clearLoadedSprites() {
    state.loadedSprites = [];
}

/**
 * Gets the atlas image (for unpack mode)
 * @returns {HTMLImageElement|null}
 */
export function getAtlasImage() {
    return state.atlasImage;
}

/**
 * Sets the atlas image
 * @param {HTMLImageElement|null} image
 */
export function setAtlasImage(image) {
    state.atlasImage = image;
}

/**
 * Gets the metadata
 * @returns {import('../core/imageLoader.js').AtlasMetadata|null}
 */
export function getMetadata() {
    return state.metadata;
}

/**
 * Sets the metadata
 * @param {import('../core/imageLoader.js').AtlasMetadata|null} metadata
 */
export function setMetadata(metadata) {
    state.metadata = metadata;
}

/**
 * Gets the generated atlas canvas
 * @returns {HTMLCanvasElement|null}
 */
export function getGeneratedAtlas() {
    return state.generatedAtlas;
}

/**
 * Sets the generated atlas canvas
 * @param {HTMLCanvasElement|null} canvas
 */
export function setGeneratedAtlas(canvas) {
    state.generatedAtlas = canvas;
}

/**
 * Gets extracted sprites
 * @returns {import('../core/atlasUnpacker.js').ExtractedSprite[]}
 */
export function getExtractedSprites() {
    return state.extractedSprites;
}

/**
 * Sets extracted sprites
 * @param {import('../core/atlasUnpacker.js').ExtractedSprite[]} sprites
 */
export function setExtractedSprites(sprites) {
    state.extractedSprites = sprites;
}

/**
 * Gets current pack settings
 * @returns {PackSettings}
 */
export function getSettings() {
    return { ...state.settings };
}

/**
 * Updates pack settings
 * @param {Partial<PackSettings>} updates
 */
export function updateSettings(updates) {
    state.settings = { ...state.settings, ...updates };
}

/**
 * Resets all state to defaults
 */
export function resetState() {
    state.mode = 'pack';
    state.loadedSprites = [];
    state.atlasImage = null;
    state.metadata = null;
    state.generatedAtlas = null;
    state.extractedSprites = [];
    state.settings = { ...DEFAULT_SETTINGS };
}
