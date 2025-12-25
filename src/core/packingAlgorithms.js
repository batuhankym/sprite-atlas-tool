/**
 * Packing algorithms for sprite atlas generation
 * @module core/packingAlgorithms
 */

/**
 * @typedef {import('./imageLoader.js').SpriteInput} SpriteInput
 * @typedef {import('./imageLoader.js').PackedFrame} PackedFrame
 */

/**
 * @typedef {Object} PackingOptions
 * @property {number} padding - Padding between sprites in pixels
 * @property {number} maxWidth - Maximum atlas width
 * @property {number} maxHeight - Maximum atlas height
 */

/**
 * @typedef {Object} PackingResult
 * @property {PackedFrame[]} frames - Positioned frames
 * @property {number} width - Required atlas width
 * @property {number} height - Required atlas height
 * @property {SpriteInput[]} sprites - Original sprites in packing order
 */

/**
 * Shelf packing algorithm - fills rows left-to-right, top-to-bottom
 * Simple and efficient for sprites of similar heights
 * 
 * @param {SpriteInput[]} sprites - Sprites to pack (will be sorted alphabetically)
 * @param {PackingOptions} options - Packing options
 * @returns {{ success: boolean, result?: PackingResult, error?: string }}
 * 
 * TODO: Support alternative sorting strategies (by height, by area)
 * TODO: Implement binary tree packing for better space efficiency
 * TODO: Implement maxrects algorithm for optimal packing
 */
export function shelfPack(sprites, options) {
    const { padding, maxWidth, maxHeight } = options;

    if (sprites.length === 0) {
        return {
            success: true,
            result: { frames: [], width: 0, height: 0, sprites: [] }
        };
    }

    // Sort alphabetically by name for deterministic output
    const sortedSprites = [...sprites].sort((a, b) => a.name.localeCompare(b.name));

    const frames = [];
    let currentX = padding;
    let currentY = padding;
    let rowHeight = 0;
    let atlasWidth = 0;
    let atlasHeight = 0;

    for (const sprite of sortedSprites) {
        const spriteWidth = sprite.width + padding;
        const spriteHeight = sprite.height + padding;

        // Check if sprite fits in atlas at all
        if (sprite.width + padding * 2 > maxWidth || sprite.height + padding * 2 > maxHeight) {
            return {
                success: false,
                error: `Sprite "${sprite.name}" (${sprite.width}x${sprite.height}) is too large for the atlas (max: ${maxWidth}x${maxHeight})`
            };
        }

        // Check if we need to start a new row
        if (currentX + spriteWidth > maxWidth) {
            currentX = padding;
            currentY += rowHeight;
            rowHeight = 0;
        }

        // Check if we've exceeded max height
        if (currentY + spriteHeight > maxHeight) {
            return {
                success: false,
                error: `Atlas size (${maxWidth}x${maxHeight}) is too small to fit all sprites. Try increasing the max size.`
            };
        }

        // Place the sprite
        frames.push({
            name: sprite.name,
            x: currentX,
            y: currentY,
            w: sprite.width,
            h: sprite.height
        });

        // Update tracking variables
        atlasWidth = Math.max(atlasWidth, currentX + sprite.width + padding);
        rowHeight = Math.max(rowHeight, spriteHeight);
        currentX += spriteWidth;
    }

    atlasHeight = currentY + rowHeight;

    return {
        success: true,
        result: {
            frames,
            width: atlasWidth,
            height: atlasHeight,
            sprites: sortedSprites
        }
    };
}

/**
 * Gets the list of available packing algorithms
 * @returns {{ id: string, name: string, description: string }[]}
 * 
 * TODO: Add more algorithms as they are implemented
 */
export function getAvailableAlgorithms() {
    return [
        {
            id: 'shelf',
            name: 'Shelf Packing',
            description: 'Simple row-based packing, good for sprites of similar height'
        }
        // TODO: { id: 'binary-tree', name: 'Binary Tree', description: '...' }
        // TODO: { id: 'maxrects', name: 'MaxRects', description: '...' }
    ];
}
