/**
 * Image loading utilities for the atlas tool
 * @module core/imageLoader
 */

import { loadImageFromBlob } from '../utils/imageUtils.js';

/**
 * @typedef {Object} SpriteInput
 * @property {string} name - Sprite name (filename without extension)
 * @property {HTMLImageElement} image - Loaded image element
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 */

/**
 * @typedef {Object} PackedFrame
 * @property {string} name - Sprite name
 * @property {number} x - X position in atlas
 * @property {number} y - Y position in atlas
 * @property {number} w - Width in pixels
 * @property {number} h - Height in pixels
 */

/**
 * @typedef {Object} AtlasMetadata
 * @property {PackedFrame[]} frames - Array of packed frame definitions
 * @property {Object} meta - Metadata about the atlas
 * @property {string} meta.app - Application name
 * @property {string} meta.version - Format version
 * @property {Object} meta.size - Atlas dimensions
 * @property {number} meta.size.w - Atlas width
 * @property {number} meta.size.h - Atlas height
 */

/**
 * Loads multiple images from a FileList
 * @param {FileList|File[]} fileList - Files to load
 * @returns {Promise<SpriteInput[]>} Array of loaded sprite inputs
 */
export async function loadImagesFromFiles(fileList) {
    const files = Array.from(fileList);
    const sprites = [];

    for (const file of files) {
        // Skip non-image files
        if (!file.type.startsWith('image/')) {
            console.warn(`Skipping non-image file: ${file.name}`);
            continue;
        }

        try {
            const image = await loadImageFromBlob(file);
            const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

            sprites.push({
                name,
                image,
                width: image.naturalWidth,
                height: image.naturalHeight
            });
        } catch (error) {
            console.error(`Failed to load image: ${file.name}`, error);
            throw new Error(`Failed to load image: ${file.name}`);
        }
    }

    return sprites;
}

/**
 * Validates the atlas metadata format
 * @param {any} metadata - Metadata to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return { valid: false, error: 'Metadata must be an object' };
    }

    if (!Array.isArray(metadata.frames)) {
        return { valid: false, error: 'Metadata must have a "frames" array' };
    }

    if (!metadata.meta || typeof metadata.meta !== 'object') {
        return { valid: false, error: 'Metadata must have a "meta" object' };
    }

    for (let i = 0; i < metadata.frames.length; i++) {
        const frame = metadata.frames[i];
        if (typeof frame.name !== 'string') {
            return { valid: false, error: `Frame ${i} missing "name"` };
        }
        if (typeof frame.x !== 'number' || typeof frame.y !== 'number') {
            return { valid: false, error: `Frame "${frame.name}" missing position (x, y)` };
        }
        if (typeof frame.w !== 'number' || typeof frame.h !== 'number') {
            return { valid: false, error: `Frame "${frame.name}" missing dimensions (w, h)` };
        }
    }

    return { valid: true };
}

/**
 * Parses JSON metadata from a File
 * @param {File} file - JSON file to parse
 * @returns {Promise<AtlasMetadata>} Parsed metadata
 */
export async function loadMetadataFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const metadata = JSON.parse(e.target.result);
                const validation = validateMetadata(metadata);

                if (!validation.valid) {
                    reject(new Error(`Invalid metadata: ${validation.error}`));
                    return;
                }

                resolve(metadata);
            } catch (error) {
                reject(new Error('Failed to parse JSON metadata'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read metadata file'));
        };

        reader.readAsText(file);
    });
}
