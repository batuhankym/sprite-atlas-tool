/**
 * File input handling with drag & drop support
 * @module ui/fileInput
 */

import { loadImagesFromFiles, loadMetadataFromFile } from '../core/imageLoader.js';
import { loadImageFromBlob } from '../utils/imageUtils.js';

/**
 * @typedef {Object} FileInputConfig
 * @property {HTMLElement} dropZone - The drag & drop zone element
 * @property {HTMLInputElement} fileInput - The file input element
 * @property {HTMLElement} fileList - Element to display loaded files
 * @property {function(import('../core/imageLoader.js').SpriteInput[]): void} onSpritesLoaded - Callback for loaded sprites
 * @property {function(HTMLImageElement): void} onAtlasLoaded - Callback for loaded atlas image
 * @property {function(import('../core/imageLoader.js').AtlasMetadata): void} onMetadataLoaded - Callback for loaded metadata
 * @property {function(string): void} onError - Error callback
 * @property {function(): string} getMode - Function to get current mode
 */

/**
 * Initializes file input handlers
 * @param {FileInputConfig} config
 */
export function initFileInput(config) {
    const { dropZone, fileInput, onError, getMode } = config;

    // Drag & drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        await handleFiles(files, config);
    });

    // Click to open file dialog
    dropZone.addEventListener('click', () => {
        // Update file input accept based on mode
        const mode = getMode();
        if (mode === 'pack') {
            fileInput.accept = 'image/png,image/jpeg,image/gif,image/webp';
            fileInput.multiple = true;
        } else {
            fileInput.accept = 'image/png,application/json,.json';
            fileInput.multiple = true;
        }
        fileInput.click();
    });

    // File input change handler
    fileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            await handleFiles(files, config);
        }
        // Reset input so same file can be selected again
        fileInput.value = '';
    });
}

/**
 * Handles uploaded files based on current mode
 * @param {FileList} files
 * @param {FileInputConfig} config
 */
async function handleFiles(files, config) {
    const { onSpritesLoaded, onAtlasLoaded, onMetadataLoaded, onError, getMode } = config;
    const mode = getMode();

    if (mode === 'pack') {
        await handlePackModeFiles(files, onSpritesLoaded, onError);
    } else {
        await handleUnpackModeFiles(files, onAtlasLoaded, onMetadataLoaded, onError);
    }
}

/**
 * Handles files for pack mode (multiple sprite images)
 * @param {FileList} files
 * @param {function} onSpritesLoaded
 * @param {function} onError
 */
async function handlePackModeFiles(files, onSpritesLoaded, onError) {
    try {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            onError('No valid image files found. Please select PNG, JPEG, GIF, or WebP files.');
            return;
        }

        const sprites = await loadImagesFromFiles(imageFiles);
        onSpritesLoaded(sprites);
    } catch (error) {
        onError(error.message || 'Failed to load images');
    }
}

/**
 * Handles files for unpack mode (atlas image + JSON metadata)
 * @param {FileList} files
 * @param {function} onAtlasLoaded
 * @param {function} onMetadataLoaded
 * @param {function} onError
 */
async function handleUnpackModeFiles(files, onAtlasLoaded, onMetadataLoaded, onError) {
    const fileArray = Array.from(files);

    // Find image and JSON files
    const imageFile = fileArray.find(f => f.type.startsWith('image/'));
    const jsonFile = fileArray.find(f => f.name.endsWith('.json') || f.type === 'application/json');

    try {
        if (imageFile) {
            const image = await loadImageFromBlob(imageFile);
            onAtlasLoaded(image);
        }

        if (jsonFile) {
            const metadata = await loadMetadataFromFile(jsonFile);
            onMetadataLoaded(metadata);
        }

        if (!imageFile && !jsonFile) {
            onError('Please select an atlas image (PNG) and/or metadata JSON file.');
        }
    } catch (error) {
        onError(error.message || 'Failed to load files');
    }
}

/**
 * Updates the file list display
 * @param {HTMLElement} fileListElement
 * @param {import('../core/imageLoader.js').SpriteInput[]} sprites
 */
export function updateSpriteList(fileListElement, sprites) {
    fileListElement.innerHTML = '';

    if (sprites.length === 0) {
        fileListElement.innerHTML = '<div class="file-list-empty">No files loaded</div>';
        return;
    }

    // Sort alphabetically for display consistency
    const sorted = [...sprites].sort((a, b) => a.name.localeCompare(b.name));

    for (const sprite of sorted) {
        const item = document.createElement('div');
        item.className = 'file-list-item';
        item.innerHTML = `
            <span class="file-name">${escapeHtml(sprite.name)}</span>
            <span class="file-size">${sprite.width}×${sprite.height}</span>
        `;
        fileListElement.appendChild(item);
    }
}

/**
 * Updates the unpack mode file status display
 * @param {HTMLElement} fileListElement
 * @param {HTMLImageElement|null} atlasImage
 * @param {import('../core/imageLoader.js').AtlasMetadata|null} metadata
 */
export function updateUnpackFileList(fileListElement, atlasImage, metadata) {
    fileListElement.innerHTML = '';

    // Atlas image status
    const atlasItem = document.createElement('div');
    atlasItem.className = 'file-list-item';
    if (atlasImage) {
        atlasItem.innerHTML = `
            <span class="file-name">Atlas Image</span>
            <span class="file-status loaded">${atlasImage.naturalWidth}×${atlasImage.naturalHeight}</span>
        `;
    } else {
        atlasItem.innerHTML = `
            <span class="file-name">Atlas Image</span>
            <span class="file-status pending">Not loaded</span>
        `;
    }
    fileListElement.appendChild(atlasItem);

    // Metadata status
    const metaItem = document.createElement('div');
    metaItem.className = 'file-list-item';
    if (metadata) {
        metaItem.innerHTML = `
            <span class="file-name">Metadata JSON</span>
            <span class="file-status loaded">${metadata.frames.length} frames</span>
        `;
    } else {
        metaItem.innerHTML = `
            <span class="file-name">Metadata JSON</span>
            <span class="file-status pending">Not loaded</span>
        `;
    }
    fileListElement.appendChild(metaItem);
}

/**
 * Escapes HTML special characters
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
