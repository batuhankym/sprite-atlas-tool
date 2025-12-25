/**
 * Atlas packing - combines sprites into a single texture atlas
 * @module core/atlasPacker
 */

import { createCanvas, nextPowerOfTwo } from '../utils/imageUtils.js';
import { shelfPack } from './packingAlgorithms.js';

/**
 * @typedef {import('./imageLoader.js').SpriteInput} SpriteInput
 * @typedef {import('./imageLoader.js').AtlasMetadata} AtlasMetadata
 */

/**
 * @typedef {Object} PackerOptions
 * @property {number} padding - Padding between sprites (default: 1)
 * @property {number} maxAtlasSize - Maximum atlas dimension (default: 2048)
 * @property {boolean} powerOfTwo - Force dimensions to power of two (default: false)
 */

/**
 * @typedef {Object} PackerResult
 * @property {HTMLCanvasElement} canvas - The generated atlas canvas
 * @property {AtlasMetadata} metadata - The atlas metadata
 */

const DEFAULT_OPTIONS = {
    padding: 1,
    maxAtlasSize: 2048,
    powerOfTwo: false
};

/**
 * Packs multiple sprites into a single texture atlas
 * 
 * @param {SpriteInput[]} sprites - Sprites to pack
 * @param {Partial<PackerOptions>} [options={}] - Packing options
 * @returns {{ success: boolean, result?: PackerResult, error?: string }}
 * 
 * TODO: Support sprite grouping/tagging for animations
 * TODO: Support multiple packing algorithms via options
 */
export function packAtlas(sprites, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validate inputs
    if (!sprites || sprites.length === 0) {
        return {
            success: false,
            error: 'No sprites provided. Please add at least one image.'
        };
    }

    // Validate atlas size
    if (opts.maxAtlasSize < 32) {
        return {
            success: false,
            error: 'Maximum atlas size must be at least 32 pixels.'
        };
    }

    // Run the packing algorithm
    const packResult = shelfPack(sprites, {
        padding: opts.padding,
        maxWidth: opts.maxAtlasSize,
        maxHeight: opts.maxAtlasSize
    });

    if (!packResult.success) {
        return {
            success: false,
            error: packResult.error
        };
    }

    const { frames, width, height, sprites: sortedSprites } = packResult.result;

    // Calculate final dimensions
    let finalWidth = width;
    let finalHeight = height;

    if (opts.powerOfTwo) {
        finalWidth = nextPowerOfTwo(width);
        finalHeight = nextPowerOfTwo(height);
    }

    // Create the atlas canvas
    const { canvas, ctx } = createCanvas(finalWidth, finalHeight);

    // Draw all sprites onto the atlas
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const sprite = sortedSprites[i];
        ctx.drawImage(sprite.image, frame.x, frame.y);
    }

    // Build metadata
    const metadata = {
        frames,
        meta: {
            app: 'SpriteAtlasTool',
            version: '1.0',
            size: {
                w: finalWidth,
                h: finalHeight
            }
        }
    };

    return {
        success: true,
        result: {
            canvas,
            metadata
        }
    };
}
