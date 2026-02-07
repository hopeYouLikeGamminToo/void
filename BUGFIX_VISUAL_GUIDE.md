# Scene Overlapping Bug - Visual Explanation

## Before Fix: Scenes Accumulate

```
Initial State:
┌─────────────────┐
│   Container     │
│   (empty)       │
└─────────────────┘

After showing Login scene:
┌─────────────────┐
│   Container     │
│  ┌──────────┐   │
│  │  Login   │   │
│  │  UI      │   │
│  └──────────┘   │
└─────────────────┘

After showing Menu scene (BUG - Login UI still there!):
┌─────────────────┐
│   Container     │
│  ┌──────────┐   │
│  │  Login   │   │ ← Still here!
│  │  UI      │   │
│  └──────────┘   │
│  ┌──────────┐   │
│  │  Menu    │   │ ← Added on top
│  │  UI      │   │
│  └──────────┘   │
└─────────────────┘

After showing Char Select (WORSE - 3 layers!):
┌─────────────────┐
│   Container     │
│  ┌──────────┐   │
│  │  Login   │   │ ← Layer 1
│  └──────────┘   │
│  ┌──────────┐   │
│  │  Menu    │   │ ← Layer 2
│  └──────────┘   │
│  ┌──────────┐   │
│  │  Char    │   │ ← Layer 3
│  │  Select  │   │
│  └──────────┘   │
└─────────────────┘
```

## After Fix: Clean Transitions

```
Initial State:
┌─────────────────┐
│   Container     │
│   (empty)       │
└─────────────────┘

After showing Login scene:
┌─────────────────┐
│   Container     │
│  ┌──────────┐   │
│  │  Login   │   │
│  │  UI      │   │
│  └──────────┘   │
└─────────────────┘

clearContainer() called → Remove all children:
┌─────────────────┐
│   Container     │
│   (empty)       │ ← CLEARED!
└─────────────────┘

After showing Menu scene (FIXED):
┌─────────────────┐
│   Container     │
│  ┌──────────┐   │
│  │  Menu    │   │ ← Only Menu!
│  │  UI      │   │
│  └──────────┘   │
└─────────────────┘

clearContainer() called again:
┌─────────────────┐
│   Container     │
│   (empty)       │ ← CLEARED!
└─────────────────┘

After showing Char Select (FIXED):
┌─────────────────┐
│   Container     │
│  ┌──────────┐   │
│  │  Char    │   │ ← Only Char Select!
│  │  Select  │   │
│  └──────────┘   │
└─────────────────┘
```

## Code Flow Comparison

### Before Fix
```javascript
async show(data = {}) {
    if (!this.initialized) {
        await this.init();  // Create UI once
    }
    // Just make visible - OLD UI STILL THERE!
    this.container.visible = true;
    this.isVisible = true;
}
```

**Problem**: If scene was already initialized, it just becomes visible without clearing old content.

### After Fix
```javascript
async show(data = {}) {
    if (!this.initialized) {
        await this.init();  // First time: create UI
    } else {
        this.clearContainer();  // ← NEW: Clear old UI
        await this.init();      // ← Create fresh UI
    }
    this.container.visible = true;
    this.isVisible = true;
}

clearContainer() {
    while (this.container.children.length > 0) {
        const child = this.container.children[0];
        this.container.removeChild(child);
    }
    this.initialized = false;  // Force re-init
}
```

**Solution**: Clear all children and reinitialize before showing again.

---

# Character Sprite Bug - Visual Explanation

## Before Fix: Empty Sprites

```
Character Select Screen:
┌────────────────────────────────────────────┐
│  SELECT YOUR CHARACTER                     │
│                                            │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐
│  │   ?   │  │   ?   │  │   ?   │  │   ?   │ ← Placeholders!
│  │       │  │       │  │       │  │       │
│  │KRAKEN │  │GLONKY │  │SPACEM │  │ VOID  │
│  └───────┘  └───────┘  └───────┘  └───────┘
│                                            │
└────────────────────────────────────────────┘
```

### Problem Code
```javascript
const preview = new Sprite();  // ← No texture!
preview.width = 120;
preview.height = 120;
```

This creates an empty sprite with no texture to display.

## After Fix: Real Character Sprites

```
Character Select Screen:
┌────────────────────────────────────────────┐
│  SELECT YOUR CHARACTER                     │
│                                            │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐
│  │ 🦑    │  │ 👾    │  │ 🚀    │  │ ⚫    │ ← Real sprites!
│  │       │  │       │  │       │  │       │
│  │KRAKEN │  │GLONKY │  │SPACEM │  │ VOID  │
│  └───────┘  └───────┘  └───────┘  └───────┘
│                                            │
└────────────────────────────────────────────┘
```

### Solution Code
```javascript
// Access loaded resources
const resources = this.app.loader.resources;

if (resources[charName] && resources[charName].textures) {
    const textures = resources[charName].textures;
    const textureKeys = Object.keys(textures);
    
    // Use first texture as preview
    const preview = new Sprite(textures[textureKeys[0]]);
    
    // Scale to fit box
    const scale = Math.min(100 / preview.width, 100 / preview.height);
    preview.scale.set(scale);
    
    // Position and add
    preview.anchor.set(0.5);
    preview.x = boxWidth / 2;
    preview.y = boxHeight / 2 - 10;
    box.addChild(preview);
}
```

## Resource Loading Structure

```
app.loader.resources = {
    'kraken': {
        textures: {
            '0': Texture { ... },  ← We use this!
            '1': Texture { ... },
            '2': Texture { ... },
            ...
        },
        data: { ... }
    },
    'glonky': {
        textures: { ... }
    },
    'spaceman': {
        textures: { ... }
    },
    'void': {
        textures: { ... }
    }
}
```

## Key Insights

### Scene Overlapping Fix
**Key Change**: Add cleanup before re-initialization
**Impact**: Clean UI transitions, no visual artifacts
**Performance**: Slight overhead on scene transitions (negligible)

### Character Sprite Fix
**Key Change**: Properly access loaded texture data
**Impact**: Players see actual character previews
**Performance**: No change (textures already loaded)

## Testing the Fixes

### Scene Clearing Test
1. Navigate: Login → Menu → Char Select
2. Press ESC: Char Select → Menu
3. Navigate again: Menu → Char Select
4. **Check**: CharacterSelectScreen should log "Initializing..." twice
5. **Verify**: No duplicate UI elements

### Sprite Display Test
1. Navigate to Character Select
2. Open DevTools Console
3. **Check for**: `[CharacterSelectScreen] Loaded sprite for kraken`
4. **Check for**: `[CharacterSelectScreen] Loaded sprite for glonky`
5. **Check for**: `[CharacterSelectScreen] Loaded sprite for spaceman`
6. **Check for**: `[CharacterSelectScreen] Loaded sprite for void`
7. **Verify**: Visual sprites in all 4 boxes

## Architecture Improvements

These fixes improve the Scene Manager architecture:

```
Before:
Scene → init() once → keep visible/hidden → accumulate UI

After:
Scene → init() → clear on re-show → init() again → clean UI
        ↑                              ↑
    First time                    Every subsequent time
```

This ensures:
- ✅ No memory leaks from accumulated DOM nodes
- ✅ Clean slate for each scene transition
- ✅ Predictable initialization behavior
- ✅ Proper resource management
