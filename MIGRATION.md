# Migration Guide - v1.0 to v2.0

## Major Changes

### UI Flow Overhaul
The game now has a complete, professional UI flow instead of bypassing directly to the game:

**Old (v1.0)**:
- `BYPASS_LOGIN = true` flag
- Jumped directly to game screen
- No menu system
- No matchmaking flow

**New (v2.0)**:
- Complete scene management system
- Splash → Login → Menu → Character Select → Matchmaking → Game
- Proper back button navigation
- Guest login option

### Breaking Changes

#### 1. BYPASS_LOGIN Removed
**Before:**
```javascript
const BYPASS_LOGIN = true; // in app.mjs
```

**Now:**
- No bypass flag
- Must go through login (or use Guest button)
- Proper authentication flow

#### 2. Scene Management
**Before:**
- Direct manipulation of container visibility
- `splash.visible = true/false`
- Ticker functions for each scene

**Now:**
- SceneManager handles all transitions
- `sceneManager.showScene('sceneName', data)`
- BaseScene class for consistent interface
- Automatic lifecycle management

#### 3. Game Initialization
**Before:**
```javascript
if (BYPASS_LOGIN) {
    game.visible = true;
    connect();
    login.submit(BYPASS_LOGIN);
    app.ticker.add(gameLoop);
}
```

**Now:**
```javascript
// Automatic through scene flow
sceneManager.showScene('splash') 
  → auto-transitions to login 
  → user logs in 
  → menu 
  → character select 
  → matchmaking 
  → game starts
```

## New Features

### Scene Manager
Central controller for all UI screens:

```javascript
import { SceneManager, BaseScene } from './sceneManager.mjs';

const manager = new SceneManager(app);
manager.registerScene('myScene', sceneInstance);
manager.showScene('myScene', { data: 'here' });
manager.goBack(); // Back button support
```

### New Scenes
All in `/game/scripts/scenes/`:
- `splashScreen.mjs` - Intro animation
- `loginScreen.mjs` - Authentication
- `mainMenu.mjs` - Hub with Quick Play/Settings/Credits
- `characterSelectScreen.mjs` - Character picker with stats
- `matchmakingScreen.mjs` - Lobby with ready system
- `gameScreen.mjs` - Wrapper for combat

### Navigation Stack
Back button support throughout:
```javascript
// User path is tracked
Menu → CharSelect → Matchmaking
         ↑←ESC←_________|
```

### Guest Login
Quick access without credentials:
- Auto-generates random username (e.g., "SwiftTiger420")
- No password required
- Immediately joins game

## Migration Steps

### For Developers

1. **Update imports in app.mjs:**
```javascript
// Add these imports
import { SceneManager } from './sceneManager.mjs';
import { SplashScreen } from './scenes/splashScreen.mjs';
import { LoginScreen } from './scenes/loginScreen.mjs';
// ... etc
```

2. **Remove BYPASS_LOGIN code:**
```javascript
// Delete this:
const BYPASS_LOGIN = true;
if (BYPASS_LOGIN) { ... }
```

3. **Initialize SceneManager:**
```javascript
sceneManager = new SceneManager(app);
sceneManager.registerScene('splash', new SplashScreen(app, splash));
// Register all scenes...
sceneManager.showScene('splash');
```

4. **Update custom scenes:**
```javascript
// Extend BaseScene
import { BaseScene } from '../sceneManager.mjs';

export class MyScene extends BaseScene {
    async init() { /* setup UI */ }
    onShow(data) { /* animate in */ }
    onHide() { /* animate out */ }
    cleanup() { /* destroy resources */ }
}
```

### For Players

**Old Workflow:**
1. Open `http://localhost:8080`
2. Game starts immediately
3. Can't customize or select character

**New Workflow:**
1. Open `http://localhost:8080`
2. See splash screen (2.5s)
3. Login screen appears
   - Enter username/password OR
   - Click "Play as Guest"
4. Main menu appears
   - Click "Quick Play"
5. Character select
   - Choose fighter with A/D keys
   - Press ENTER to confirm
6. Matchmaking lobby
   - Wait for opponent
   - Click "Ready" when prepared
   - Countdown starts when both ready
7. Game begins!

## Performance Improvements

### New Performance Module
`/game/scripts/performance.mjs`:

```javascript
import { 
    SpritePool,        // Reuse sprites
    TextureCache,      // Cache textures
    ViewportCuller,    // Only render visible
    PerformanceMonitor // Track FPS
} from './performance.mjs';
```

### Optimizations Applied
- Sprite pooling for VFX
- Texture caching
- Viewport culling
- Reduced draw calls
- Lazy asset loading

## Testing the New Flow

### Basic Test
```bash
# Terminal 1
cd game
node server.js

# Terminal 2
npx http-server -p 8080

# Browser
http://localhost:8080
```

Expected behavior:
1. ✅ Splash screen appears (2.5s)
2. ✅ Login screen with Guest button
3. ✅ Main menu with Quick Play
4. ✅ Character select with 4 characters
5. ✅ Matchmaking lobby
6. ✅ Game starts after countdown

### 2-Player Test
1. Open two browser tabs
2. Both login (or guest)
3. Both navigate to matchmaking
4. Both click "Ready"
5. Game should start simultaneously

## Troubleshooting

### "Stuck on splash screen"
- Check browser console for errors
- Ensure all scene files loaded correctly
- Verify PixiJS initialized

### "Login button doesn't work"
- Check if signaling server is running (`node server.js`)
- Verify WebSocket connection in Network tab
- Try Guest login instead

### "Can't find matchmaking lobby"
- Ensure you selected a character first
- Check scene manager console logs
- Verify scene registration in app.mjs

### "Game doesn't start after Ready"
- Both players must click Ready
- Check if playerList is populating
- Verify WebRTC connection

## Rollback (If Needed)

To temporarily revert to v1.0 behavior:

```javascript
// In app.mjs, replace setup() with:
function setup() {
    // ... container setup ...
    
    // Quick bypass for testing
    game.visible = true;
    connect();
    const fakeLogin = { info: ['TestPlayer'] };
    login.info = fakeLogin.info;
    app.ticker.add(gameLoop);
}
```

⚠️ **Not recommended** - defeats the purpose of the refactor

## Support

For issues or questions:
- Check CHANGELOG.md for detailed changes
- Review scene manager documentation
- Test with browser dev tools open
- Verify all dependencies installed

## What's Next (v2.1)

Planned improvements:
- Enhanced transitions/animations
- Settings screen implementation
- Gamepad support in menus
- Character preview animations
- Custom lobby names
- Persistent user accounts
