# Sprite Atlas Tool Documentation

A fully client-side web tool for packing sprites into texture atlases and unpacking atlases back into individual sprites.

## Folder Structure

```
atlas-packer/
├── index.html              # Main HTML entry point
├── styles/
│   └── main.css            # All CSS styles
├── src/
│   ├── main.js             # Application entry point
│   ├── core/               # Pure logic (no DOM access)
│   │   ├── imageLoader.js      # Load images, validate metadata
│   │   ├── packingAlgorithms.js # Shelf packing algorithm
│   │   ├── atlasPacker.js      # Sprites → Atlas conversion
│   │   └── atlasUnpacker.js    # Atlas → Sprites extraction
│   ├── ui/                 # DOM interaction & UI components
│   │   ├── uiState.js          # Application state management
│   │   ├── fileInput.js        # File selection & drag/drop
│   │   ├── previewCanvas.js    # Canvas preview rendering
│   │   ├── logPanel.js         # Log message display
│   │   └── uiController.js     # Event handling & coordination
│   └── utils/              # Reusable helper functions
│       ├── imageUtils.js       # Canvas creation, power-of-two
│       └── download.js         # Blob/JSON download helpers
└── docs/
    └── SPRITE_ATLAS_TOOL.md    # This documentation
```

### Module Responsibilities

| Directory | Purpose |
|-----------|---------|
| `core/`   | Pure business logic functions. No DOM access. Can be unit tested independently. |
| `ui/`     | DOM manipulation, event handlers, UI rendering. |
| `utils/`  | Generic helper functions used across modules. |

---

## JSON Metadata Format

All PACK outputs and UNPACK inputs use this structured format:

```json
{
  "frames": [
    { "name": "idle_1", "x": 0, "y": 0, "w": 32, "h": 32 },
    { "name": "idle_2", "x": 32, "y": 0, "w": 32, "h": 32 },
    { "name": "run_1", "x": 64, "y": 0, "w": 32, "h": 32 }
  ],
  "meta": {
    "app": "SpriteAtlasTool",
    "version": "1.0",
    "size": { "w": 128, "h": 64 }
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `frames` | Array | List of sprite frame definitions |
| `frames[].name` | String | Sprite name (original filename without extension) |
| `frames[].x` | Number | X position in atlas (pixels) |
| `frames[].y` | Number | Y position in atlas (pixels) |
| `frames[].w` | Number | Sprite width (pixels) |
| `frames[].h` | Number | Sprite height (pixels) |
| `meta.app` | String | Application identifier |
| `meta.version` | String | Format version |
| `meta.size.w` | Number | Atlas width (pixels) |
| `meta.size.h` | Number | Atlas height (pixels) |

---

## PACK Mode Workflow

**Goal**: Combine multiple sprite images into a single texture atlas.

### Steps

1. **Select Mode**: Click "PACK" button (default mode)
2. **Load Sprites**: 
   - Drag PNG/JPEG/GIF/WebP files onto the drop zone, OR
   - Click the drop zone to open file picker
3. **Configure Settings**:
   - **Padding**: Space between sprites (0-32 px)
   - **Max Atlas Size**: 256 / 512 / 1024 / 2048 / 4096
   - **Power of Two**: Force dimensions to nearest power of two
4. **Generate**: Click "Generate Atlas"
5. **Preview**: View the packed atlas in the preview canvas
6. **Download**:
   - Click "Download PNG" for the atlas image
   - Click "Download JSON" for the metadata file

### Deterministic Ordering

Sprites are **sorted alphabetically by filename** before packing. This ensures:
- Same input files → identical atlas layout
- Predictable, reproducible builds
- Easier version control

---

## UNPACK Mode Workflow

**Goal**: Extract individual sprites from an existing atlas.

### Steps

1. **Select Mode**: Click "UNPACK" button
2. **Load Files**:
   - Drag/select the atlas PNG image
   - Drag/select the JSON metadata file
3. **Extract**: Click "Extract Sprites"
4. **Download**: Click "Download All Sprites" to save all extracted images

### Requirements

- The JSON must match the format produced by PACK mode
- Frame coordinates must be within atlas bounds
- Both files must be loaded before extraction

---

## How to Use

### Quick Start

1. Open `index.html` in a modern browser (Chrome, Firefox, Edge)
2. For local development, use a local server:
   ```bash
   npx serve .
   ```
   Then open `http://localhost:3000`

### Creating an Atlas

1. Prepare your sprite images (PNG recommended)
2. Open the tool, ensure PACK mode is selected
3. Drag all sprites onto the drop zone
4. Adjust settings if needed
5. Click "Generate Atlas"
6. Download the PNG and JSON files

### Splitting an Atlas

1. Obtain an atlas PNG and its JSON metadata
2. Open the tool, switch to UNPACK mode
3. Load both files (can drag together or separately)
4. Click "Extract Sprites"
5. Download the extracted sprites

---

## Adding New Packing Algorithms

To add a new packing algorithm:

### 1. Create the Algorithm

Edit `src/core/packingAlgorithms.js`:

```javascript
/**
 * Binary tree packing algorithm
 * @param {SpriteInput[]} sprites
 * @param {PackingOptions} options
 * @returns {{ success: boolean, result?: PackingResult, error?: string }}
 */
export function binaryTreePack(sprites, options) {
    // Sort sprites (largest first works well for binary tree)
    const sorted = [...sprites].sort((a, b) => 
        (b.width * b.height) - (a.width * a.height)
    );
    
    // Implement bin packing logic...
    
    return {
        success: true,
        result: { frames, width, height, sprites: sorted }
    };
}
```

### 2. Register the Algorithm

Update `getAvailableAlgorithms()`:

```javascript
export function getAvailableAlgorithms() {
    return [
        { id: 'shelf', name: 'Shelf Packing', description: '...' },
        { id: 'binary-tree', name: 'Binary Tree', description: '...' }
    ];
}
```

### 3. Add UI Selection (Optional)

Add a dropdown in `index.html` and wire it up in `uiController.js` to select between algorithms.

### 4. Update atlasPacker.js

Modify `packAtlas()` to accept an algorithm option:

```javascript
import { shelfPack, binaryTreePack } from './packingAlgorithms.js';

const algorithms = {
    'shelf': shelfPack,
    'binary-tree': binaryTreePack
};

export function packAtlas(sprites, options = {}) {
    const algorithm = algorithms[options.algorithm || 'shelf'];
    const packResult = algorithm(sprites, { ... });
    // ...
}
```

---

## Error Handling

All errors are displayed in the log panel with appropriate severity:

| Level | Color | Usage |
|-------|-------|-------|
| Info | Blue | Success messages, status updates |
| Warning | Yellow | Non-critical issues |
| Error | Red | Failed operations, validation errors |

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No sprites loaded" | Generate clicked with no files | Add sprite images first |
| "Atlas size too small" | Sprites don't fit | Increase max atlas size |
| "Sprite too large" | Single sprite exceeds max | Use larger max size or smaller sprite |
| "Invalid metadata" | Malformed JSON | Check JSON format matches spec |
| "Frame extends beyond bounds" | JSON doesn't match image | Ensure correct JSON for atlas |

---

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

Requires:
- ES Modules support
- Canvas API
- File API
- Blob API
