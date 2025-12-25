/**
 * Atlas unpacking - extracts individual sprites from an atlas
 * @module core/atlasUnpacker
 */

import { createCanvas, canvasToBlob } from '../utils/imageUtils.js';

/**
 * @typedef {import('./imageLoader.js').AtlasMetadata} AtlasMetadata
 * @typedef {import('./imageLoader.js').PackedFrame} PackedFrame
 */

/**
 * @typedef {Object} ExtractedSprite
 * @property {string} name - Sprite name
 * @property {HTMLCanvasElement} canvas - Canvas containing the sprite
 * @property {Blob} blob - PNG blob of the sprite
 * @property {number} width - Sprite width
 * @property {number} height - Sprite height
 */

/**
 * Extracts all sprites from an atlas image using metadata
 * 
 * @param {HTMLImageElement} atlasImage - The atlas image
 * @param {AtlasMetadata} metadata - The atlas metadata
 * @returns {Promise<{ success: boolean, result?: ExtractedSprite[], error?: string }>}
 * 
 * TODO: Support progress callback for large atlases
 * TODO: Support extracting only specific sprites by name
 */
export async function unpackAtlas(atlasImage, metadata) {
    // Validate inputs
    if (!atlasImage) {
        return {
            success: false,
            error: 'No atlas image provided.'
        };
    }

    if (!metadata || !metadata.frames) {
        return {
            success: false,
            error: 'Invalid metadata: missing frames array.'
        };
    }

    if (metadata.frames.length === 0) {
        return {
            success: false,
            error: 'Metadata contains no frames to extract.'
        };
    }

    const atlasWidth = atlasImage.naturalWidth;
    const atlasHeight = atlasImage.naturalHeight;
    const extractedSprites = [];

    // Validate frame bounds against atlas dimensions
    for (const frame of metadata.frames) {
        if (frame.x < 0 || frame.y < 0) {
            return {
                success: false,
                error: `Frame "${frame.name}" has negative position (${frame.x}, ${frame.y}).`
            };
        }
        if (frame.x + frame.w > atlasWidth || frame.y + frame.h > atlasHeight) {
            return {
                success: false,
                error: `Frame "${frame.name}" extends beyond atlas bounds. Frame: (${frame.x}, ${frame.y}, ${frame.w}x${frame.h}), Atlas: ${atlasWidth}x${atlasHeight}`
            };
        }
    }

    // Extract each sprite
    for (const frame of metadata.frames) {
        try {
            const { canvas, ctx } = createCanvas(frame.w, frame.h);

            // Draw the sprite region from the atlas
            ctx.drawImage(
                atlasImage,
                frame.x, frame.y, frame.w, frame.h,  // Source rectangle
                0, 0, frame.w, frame.h                // Destination rectangle
            );

            const blob = await canvasToBlob(canvas);

            extractedSprites.push({
                name: frame.name,
                canvas,
                blob,
                width: frame.w,
                height: frame.h
            });
        } catch (error) {
            return {
                success: false,
                error: `Failed to extract sprite "${frame.name}": ${error.message}`
            };
        }
    }

    return {
        success: true,
        result: extractedSprites
    };
}
