# Bug Fix Testing Guide

## Issues Fixed

### 1. Scene Overlapping Bug
**Problem**: UI elements from previous scenes were not cleared, causing them to draw on top of each other.

**Root Cause**: The `BaseScene.show()` method would set `container.visible = true` without clearing previous children when a scene was re-shown.

**Fix**: Added `clearContainer()` method that:
- Removes all children from the container
- Resets the `initialized` flag
- Forces re-initialization on next show

**Testing Steps**:
1. Navigate from Login → Main Menu
2. Go to Character Select
3. Press ESC to go back to Main Menu
4. Go to Character Select again
5. **Verify**: No duplicate UI elements, clean scene each time

### 2. Missing Character Sprites
**Problem**: Character selection boxes showed "?" placeholder instead of actual character sprites.

**Root Cause**: The code created an empty `Sprite()` without providing a texture.

**Fix**: Properly access loaded character assets:
```javascript
const resources = this.app.loader.resources;
if (resources[charName] && resources[charName].textures) {
    const textures = resources[charName].textures;
    const textureKeys = Object.keys(textures);
    const preview = new Sprite(textures[textureKeys[0]]);
    // Scale and position...
}
```

**Testing Steps**:
1. Navigate to Character Select screen
2. **Verify**: Each of the 4 character boxes shows the actual character sprite
3. Characters should be: Kraken, Glonky, Spaceman, Void
4. Sprites should be scaled to fit nicely in the boxes

## Manual Testing Checklist

### Setup
```bash
# Terminal 1
cd game
node server.js

# Terminal 2  
npx http-server -p 8080

# Browser
http://localhost:8080
```

### Test Scenarios

#### Scenario 1: Scene Clearing
- [ ] Start game, wait for splash (2.5s)
- [ ] Login as guest
- [ ] Click Quick Play
- [ ] View Character Select
- [ ] Press ESC to go back to menu
- [ ] Click Quick Play again
- [ ] **Expected**: Character Select is clean, no duplicate elements
- [ ] **Expected**: No overlapping text or boxes

#### Scenario 2: Character Sprites
- [ ] Navigate to Character Select
- [ ] **Expected**: All 4 character boxes show actual sprites (not "?")
- [ ] **Expected**: Sprites are visible and properly scaled
- [ ] **Expected**: Character names appear below sprites
- [ ] Navigate selection with A/D keys
- [ ] **Expected**: Green highlight moves correctly

#### Scenario 3: Multiple Transitions
- [ ] Go through: Login → Menu → Char Select → Menu → Char Select → Menu
- [ ] **Expected**: Each transition is clean
- [ ] **Expected**: No UI elements accumulating
- [ ] **Expected**: No console errors

#### Scenario 4: Memory Leaks
- [ ] Navigate through all scenes multiple times
- [ ] Open browser DevTools → Performance
- [ ] Check memory usage
- [ ] **Expected**: Memory stays stable (no continuous growth)
- [ ] **Expected**: Ticker functions properly cleaned up

## Known Limitations

### Playwright Testing
The automated tests using Playwright are limited because:
- CDN resources (Matter.js, keystrokes.js) are blocked by browser security
- PixiJS canvas content not accessible through DOM snapshots
- Manual testing in real browser is required for full verification

### Workarounds for Full Testing
1. Use a real browser (Chrome, Firefox, Safari)
2. Open DevTools console to see initialization logs
3. Look for:
   - `[CharacterSelectScreen] Loaded sprite for <character>`
   - `[BaseScene] Showing` messages
   - No error messages about undefined textures

## Expected Console Output

### Successful Character Loading
```
[App] Scene management initialized. Starting with splash screen.
[SplashScreen] Initializing...
[SplashScreen] Showing
[LoginScreen] Initializing...
[LoginScreen] Showing
[MainMenu] Initializing...
[MainMenu] Showing
[CharacterSelectScreen] Initializing...
[CharacterSelectScreen] Loaded sprite for kraken
[CharacterSelectScreen] Loaded sprite for glonky
[CharacterSelectScreen] Loaded sprite for spaceman
[CharacterSelectScreen] Loaded sprite for void
[CharacterSelectScreen] Showing
```

### Scene Clearing
When navigating back and forth:
```
[CharacterSelectScreen] Hiding
[MainMenu] Showing
[CharacterSelectScreen] Initializing...  ← Re-initialized (container was cleared)
[CharacterSelectScreen] Loaded sprite for kraken
[CharacterSelectScreen] Loaded sprite for glonky
[CharacterSelectScreen] Loaded sprite for spaceman
[CharacterSelectScreen] Loaded sprite for void
[CharacterSelectScreen] Showing
```

## Debugging Tips

### If Sprites Still Show "?"
1. Open DevTools Console
2. Check for warnings: `Could not load sprite for <character>`
3. Verify assets loaded: `console.log(app.loader.resources)`
4. Check if textures exist: `console.log(app.loader.resources.kraken)`

### If Scenes Still Overlap
1. Check if `clearContainer()` is being called
2. Add breakpoint in `BaseScene.show()`
3. Verify `initialized` flag is reset
4. Check container.children.length before/after clear

### If Memory Keeps Growing
1. Open DevTools → Performance → Memory
2. Take heap snapshot
3. Look for detached DOM nodes
4. Verify ticker functions are removed
5. Check event listeners are cleaned up

## Performance Verification

After fixes, the game should:
- ✅ Maintain 60 FPS throughout scene transitions
- ✅ Memory usage stable (no continuous growth)
- ✅ No "Ticker already added" warnings
- ✅ Smooth animations and transitions
- ✅ Proper resource cleanup

## Success Criteria

The bugs are fixed when:
1. ✅ No UI elements overlap when navigating scenes
2. ✅ Character sprites are visible in selection boxes
3. ✅ Scene transitions are clean and smooth
4. ✅ Memory usage is stable
5. ✅ Console shows no errors or warnings
6. ✅ All 4 characters display their sprites correctly

## Additional Notes

### Character Asset Structure
Each character has:
- JSON spritesheet definition (`kraken.json`)
- PNG texture atlas (`kraken.png`)
- Multiple animation frames
- We use the first available texture for preview

### Scene Manager Architecture
```
SceneManager
  ↓
BaseScene (provides clearContainer)
  ↓
CharacterSelectScreen (uses clearContainer + loads sprites)
```

The fix ensures each scene starts fresh without accumulating old UI elements.
