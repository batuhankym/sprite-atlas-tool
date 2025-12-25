/**
 * Preview canvas for displaying atlas
 * @module ui/previewCanvas
 */

/**
 * @type {HTMLCanvasElement|null}
 */
let canvasElement = null;

/**
 * @type {CanvasRenderingContext2D|null}
 */
let ctx = null;

/**
 * Initializes the preview canvas
 * @param {HTMLCanvasElement} element
 */
export function initPreviewCanvas(element) {
    canvasElement = element;
    ctx = element.getContext('2d');
    clearCanvas();
}

/**
 * Clears the preview canvas
 */
export function clearCanvas() {
    if (!canvasElement || !ctx) return;

    // Draw checkerboard pattern to indicate transparency
    const size = 16;
    const width = canvasElement.width;
    const height = canvasElement.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#e0e0e0';
    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            if ((x / size + y / size) % 2 === 0) {
                ctx.fillRect(x, y, size, size);
            }
        }
    }
}

/**
 * Renders an atlas canvas onto the preview canvas
 * Scales to fit while maintaining aspect ratio
 * 
 * @param {HTMLCanvasElement} atlasCanvas - The atlas canvas to render
 * 
 * TODO: Add hover highlighting for individual sprites
 * TODO: Add zoom/pan controls
 */
export function renderAtlas(atlasCanvas) {
    if (!canvasElement || !ctx) {
        console.warn('Preview canvas not initialized');
        return;
    }

    // Clear with checkerboard
    clearCanvas();

    const maxWidth = canvasElement.width;
    const maxHeight = canvasElement.height;
    const atlasWidth = atlasCanvas.width;
    const atlasHeight = atlasCanvas.height;

    // Calculate scale to fit
    const scale = Math.min(maxWidth / atlasWidth, maxHeight / atlasHeight, 1);
    const scaledWidth = atlasWidth * scale;
    const scaledHeight = atlasHeight * scale;

    // Center the atlas
    const offsetX = (maxWidth - scaledWidth) / 2;
    const offsetY = (maxHeight - scaledHeight) / 2;

    // Draw the atlas
    ctx.drawImage(atlasCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
}

/**
 * Renders an atlas image onto the preview canvas
 * @param {HTMLImageElement} atlasImage - The atlas image to render
 */
export function renderAtlasImage(atlasImage) {
    if (!canvasElement || !ctx) {
        console.warn('Preview canvas not initialized');
        return;
    }

    // Clear with checkerboard
    clearCanvas();

    const maxWidth = canvasElement.width;
    const maxHeight = canvasElement.height;
    const atlasWidth = atlasImage.naturalWidth;
    const atlasHeight = atlasImage.naturalHeight;

    // Calculate scale to fit
    const scale = Math.min(maxWidth / atlasWidth, maxHeight / atlasHeight, 1);
    const scaledWidth = atlasWidth * scale;
    const scaledHeight = atlasHeight * scale;

    // Center the atlas
    const offsetX = (maxWidth - scaledWidth) / 2;
    const offsetY = (maxHeight - scaledHeight) / 2;

    // Draw the atlas
    ctx.drawImage(atlasImage, offsetX, offsetY, scaledWidth, scaledHeight);
}

/**
 * Resizes the preview canvas to match container
 * @param {HTMLElement} container - The container element
 */
export function resizeToContainer(container) {
    if (!canvasElement) return;

    const rect = container.getBoundingClientRect();
    canvasElement.width = rect.width;
    canvasElement.height = rect.height;
    clearCanvas();
}
