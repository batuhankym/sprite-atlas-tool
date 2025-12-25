/**
 * Image utility functions for canvas operations
 * @module utils/imageUtils
 */

/**
 * Creates an offscreen canvas with the specified dimensions
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

/**
 * Rounds a number up to the nearest power of two
 * @param {number} n - Input number
 * @returns {number} Nearest power of two >= n
 */
export function nextPowerOfTwo(n) {
    if (n <= 0) return 1;
    // If already a power of two, return as-is
    if ((n & (n - 1)) === 0) return n;
    
    let power = 1;
    while (power < n) {
        power *= 2;
    }
    return power;
}

/**
 * Converts a canvas to a PNG Blob
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {Promise<Blob>} PNG blob
 */
export function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to convert canvas to blob'));
            }
        }, 'image/png');
    });
}

/**
 * Loads an image from a Blob or File
 * @param {Blob|File} blob - Image blob or file
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export function loadImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}
