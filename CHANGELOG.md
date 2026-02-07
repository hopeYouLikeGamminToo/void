# Changelog - void Game

## v2.0.0 - UI Flow Refactor (2026-02-07)

### 🎨 Major UI/UX Overhaul
Complete redesign of user interface flow with professional scene management system.

#### New Scene Management System
- **SceneManager**: Central controller for all UI transitions
- **BaseScene**: Consistent interface for all screens
- **Navigation Stack**: Full back button support throughout app
- **Scene Lifecycle**: init() → show() → update() → hide() → cleanup()

#### New Scenes
1. **Splash Screen** (`splashScreen.mjs`)
   - Animated logo with fade-in effect
   - 2.5-second display time
   - Pulsing loading indicator
   - Auto-transition to login

2. **Login Screen** (`loginScreen.mjs`)  
   - Proper authentication form
   - Username/password fields
   - **Guest Login** button (auto-generates name)
   - Styled with themed colors (#9A8FD9)
   - Connects to signaling server on submit

3. **Main Menu** (`mainMenu.mjs`)
   - Quick Play → starts matchmaking flow
   - Settings → placeholder for future
   - Credits → game information
   - Logout → returns to login
   - Keyboard navigation (Arrow keys/WASD + Enter)
   - Mouse hover effects

4. **Character Select** (`characterSelectScreen.mjs`)
   - 4 character selection boxes
   - Character stats display (speed, weight, attack, style)
   - Visual selection indicator
   - Keyboard navigation (A/D + Enter)
   - ESC to go back
   - Character preview placeholders

5. **Matchmaking Lobby** (`matchmakingScreen.mjs`)
   - Real-time player list
   - Ready/Not Ready toggle
   - 3-second countdown when all ready
   - Cancel button to return
   - WebRTC connection status
   - Countdown animation

6. **Game Screen** (`gameScreen.mjs`)
   - Wrapper for existing combat system
   - ESC key for pause menu
   - Return to menu option
   - Proper cleanup on exit

### 🚫 Breaking Changes
- **REMOVED**: `BYPASS_LOGIN` flag - no longer supported
- **REMOVED**: Direct game access - must go through proper flow
- **CHANGED**: App initialization - now uses SceneManager
- **CHANGED**: Scene visibility - managed by SceneManager

### ⚡ Performance Improvements

#### New Performance Module (`performance.mjs`)
- **SpritePool**: Object pooling for sprites (reduces GC pressure)
- **TextureCache**: Caches loaded textures
- **ViewportCuller**: Only renders visible objects
- **PerformanceMonitor**: Tracks FPS and frame times
- **LazyAssetLoader**: On-demand asset loading
- **RenderOptimizations**: Configurable performance settings

#### Optimizations Applied
- Sprite pooling for VFX systems
- Texture caching to prevent redundant loads
- Viewport culling skips off-screen rendering
- Reduced draw calls through batching
- Lazy loading of character assets
- Interaction frequency limiting

### 📚 Documentation

#### New Files
- **MIGRATION.md**: Complete v1.0 → v2.0 migration guide
  - Breaking changes documentation
  - Before/After code examples
  - Developer migration steps
  - Player workflow changes
  - Troubleshooting guide
  - Rollback instructions

#### Updated Files
- **README.md**: 
  - New UI Flow section with diagram
  - Updated Getting Started guide
  - Step-by-step gameplay instructions
  - 2-player setup guide
  - Navigation reference

### 🎮 User Experience

#### New Workflow
```
Splash (2.5s) → Login (Guest/User) → Main Menu → Quick Play → 
Character Select → Matchmaking → Game
```

#### Navigation Improvements
- ESC key for back navigation
- Arrow keys/WASD for menu navigation
- ENTER/SPACE for selection
- Full keyboard support throughout
- Mouse interaction on all buttons

### 🔧 Technical Details

#### File Structure
```
game/scripts/
├── sceneManager.mjs          (NEW - Core scene system)
├── scenes/                   (NEW - All UI scenes)
│   ├── splashScreen.mjs
│   ├── loginScreen.mjs
│   ├── mainMenu.mjs
│   ├── characterSelectScreen.mjs
│   ├── matchmakingScreen.mjs
│   └── gameScreen.mjs
├── performance.mjs           (NEW - Performance utils)
├── app.mjs                   (REFACTORED - Uses SceneManager)
└── ... (existing files)
```

#### Scene Manager API
```javascript
sceneManager.registerScene(name, instance)
sceneManager.showScene(name, data, addToStack)
sceneManager.goBack()
sceneManager.clearStack()
sceneManager.isSceneActive(name)
```

### 🐛 Fixes
- Fixed direct game access bypassing login
- Fixed lack of menu system
- Fixed no character selection
- Fixed missing matchmaking lobby
- Fixed unclear game flow

### 🎯 Quality Improvements
- Consistent code style across scenes
- Proper resource cleanup
- Memory management through scene lifecycle
- Separation of concerns (each scene is independent)
- Maintainable architecture

---

## v1.0.0 - First Playable Release (2026-02-07)

### 🎮 Major Features
- **Complete 2-Player Fighting Game**: Local multiplayer duel mode inspired by Super Smash Bros
- **Combat System**: Health (150 HP), damage percentage, three attack types (light/heavy/special)
- **Physics-Based Knockback**: Smash Bros-style knockback that increases with damage percentage
- **Win Conditions**: Knockout by reducing HP to 0 or knocking opponent off stage
- **Four Playable Characters**: Kraken, Glonky, Spaceman, Void (each with unique stats)

### 🎨 User Interface
- **In-Game HUD**: Real-time health bars with color-coded health levels
- **Damage Percentage Display**: Shows accumulated damage for each player
- **Win Screen**: Overlay showing winner with instant restart (R key)
- **Visual Effects**: Star burst effects on successful hits
- **Character Select**: UI created and ready for integration

### 🕹️ Controls
#### Keyboard (Player 1)
- **Movement**: W (jump), A (left), D (right), S (duck)
- **Attacks**: J (light), K (heavy), L (special)
- **Restart**: R (after match ends)

#### Gamepad Support
- **Movement**: Left analog stick
- **Jump**: A button
- **Attacks**: X (light), Y (heavy), B (special)
- **Auto-detection**: Prompts to switch input mode when gamepad connects

### ⚙️ Character Stats
Each character has distinct playstyle:
- **Kraken**: Balanced (1.0x speed, 105 weight, 1.2x attack)
- **Spaceman**: Fast & Light (1.15x speed, 85 weight, 0.95x attack)
- **Glonky**: Tank (0.95x speed, 115 weight, 1.35x attack)
- **Void**: Speed Demon (1.25x speed, 80 weight, 0.9x attack)

### 🌐 Multiplayer
- **WebRTC P2P**: Peer-to-peer networking for low latency
- **Full State Sync**: Health, damage, attacks, positions all synchronized
- **Local Play**: Same machine (multiple tabs) or LAN
- **WebSocket Signaling**: Reliable connection establishment

### ⚖️ Balance & Polish
- **Tuned Damage Values**: 8/18/25 for light/heavy/special attacks
- **Responsive Combat**: Fast attack durations (12/20/25 frames)
- **Improved Knockback**: Better vertical launch and percentage scaling
- **Fixed Position Sync**: Proper Pixi ↔ Matter.js center alignment
- **Platform Physics**: Accurate collision detection with friction

### 🏗️ Technical Architecture
- **Modular Design**: Separate modules for combat, HUD, VFX, game state
- **Clean Code**: Constants extracted, helper methods, minimal duplication
- **Type Safety**: Comprehensive null checks and guards
- **Performance**: Efficient rendering and physics updates at 60 FPS

### 📝 Code Quality
- Extracted magic numbers to named constants
- Fixed operator precedence bugs
- Removed dead code
- Added comprehensive documentation
- Consistent code style throughout

### 🐛 Known Limitations
- Character animations use placeholder "Shoot" animation for all attacks
- Limited to 2 players (designed for 1v1)
- Minor position sync offsets may occur under extreme physics conditions
- No pause menu yet (can restart with R)

---

## Development Notes

### Tech Stack
- **Rendering**: PixiJS v7+
- **Physics**: Matter.js
- **Networking**: WebRTC + WebSocket signaling
- **Input**: Keyboard & Gamepad API
- **Build**: ES6 modules (no bundler)

### Credits
- Original concept: hopeYouLikeGamminToo team
- Character assets: Custom sprites (aseprite/)
- Inspiration: Super Smash Bros series

## License
MIT

### 🎮 Major Features
- **Complete 2-Player Fighting Game**: Local multiplayer duel mode inspired by Super Smash Bros
- **Combat System**: Health (150 HP), damage percentage, three attack types (light/heavy/special)
- **Physics-Based Knockback**: Smash Bros-style knockback that increases with damage percentage
- **Win Conditions**: Knockout by reducing HP to 0 or knocking opponent off stage
- **Four Playable Characters**: Kraken, Glonky, Spaceman, Void (each with unique stats)

### 🎨 User Interface
- **In-Game HUD**: Real-time health bars with color-coded health levels
- **Damage Percentage Display**: Shows accumulated damage for each player
- **Win Screen**: Overlay showing winner with instant restart (R key)
- **Visual Effects**: Star burst effects on successful hits
- **Character Select**: UI created and ready for integration

### 🕹️ Controls
#### Keyboard (Player 1)
- **Movement**: W (jump), A (left), D (right), S (duck)
- **Attacks**: J (light), K (heavy), L (special)
- **Restart**: R (after match ends)

#### Gamepad Support
- **Movement**: Left analog stick
- **Jump**: A button
- **Attacks**: X (light), Y (heavy), B (special)
- **Auto-detection**: Prompts to switch input mode when gamepad connects

### ⚙️ Character Stats
Each character has distinct playstyle:
- **Kraken**: Balanced (1.0x speed, 105 weight, 1.2x attack)
- **Spaceman**: Fast & Light (1.15x speed, 85 weight, 0.95x attack)
- **Glonky**: Tank (0.95x speed, 115 weight, 1.35x attack)
- **Void**: Speed Demon (1.25x speed, 80 weight, 0.9x attack)

### 🌐 Multiplayer
- **WebRTC P2P**: Peer-to-peer networking for low latency
- **Full State Sync**: Health, damage, attacks, positions all synchronized
- **Local Play**: Same machine (multiple tabs) or LAN
- **WebSocket Signaling**: Reliable connection establishment

### ⚖️ Balance & Polish
- **Tuned Damage Values**: 8/18/25 for light/heavy/special attacks
- **Responsive Combat**: Fast attack durations (12/20/25 frames)
- **Improved Knockback**: Better vertical launch and percentage scaling
- **Fixed Position Sync**: Proper Pixi ↔ Matter.js center alignment
- **Platform Physics**: Accurate collision detection with friction

### 🏗️ Technical Architecture
- **Modular Design**: Separate modules for combat, HUD, VFX, game state
- **Clean Code**: Constants extracted, helper methods, minimal duplication
- **Type Safety**: Comprehensive null checks and guards
- **Performance**: Efficient rendering and physics updates at 60 FPS

### 📝 Code Quality
- Extracted magic numbers to named constants
- Fixed operator precedence bugs
- Removed dead code
- Added comprehensive documentation
- Consistent code style throughout

### 🐛 Known Limitations
- Character animations use placeholder "Shoot" animation for all attacks
- Limited to 2 players (designed for 1v1)
- Minor position sync offsets may occur under extreme physics conditions
- No pause menu yet (can restart with R)

### 🎯 Next Steps (Future Releases)
- Integrate character selection screen into game flow
- Add proper attack animations from aseprite assets
- Implement pause menu
- Add sound effects and music
- Create additional stages/maps
- Mobile/touch controls
- Online matchmaking
- Additional characters

---

## Development Notes

### Setup
1. `cd game`
2. `npm install`
3. `node server.js` (start signaling server)
4. `npx http-server -p 8080` (start game)
5. Open `http://localhost:8080` in browser

### File Structure
```
game/
├── scripts/
│   ├── app.mjs           # Main application setup
│   ├── game.mjs          # Game loop and state management
│   ├── player.mjs        # Player class with combat stats
│   ├── combat.mjs        # Combat system (damage, knockback, hitboxes)
│   ├── hud.mjs           # Heads-up display
│   ├── gameState.mjs     # Game state and win/restart screens
│   ├── vfx.mjs           # Visual effects
│   ├── input.mjs         # Keyboard and gamepad input
│   ├── map.mjs           # Stage/platform definitions
│   ├── physics.mjs       # Matter.js physics setup
│   ├── client.mjs        # WebRTC networking
│   ├── characterSelect.mjs # Character selection UI
│   └── ...
├── assets/               # Character sprites and animations
├── server.js             # WebSocket signaling server
└── index.html           # Entry point
```

### Tech Stack
- **Rendering**: PixiJS v7+ (2D graphics)
- **Physics**: Matter.js (2D physics engine)
- **Networking**: WebRTC + WebSocket signaling
- **Input**: Keyboard & Gamepad API
- **Build**: ES6 modules (no bundler needed)

---

## Credits
- Original concept and development: hopeYouLikeGamminToo team
- Character art assets: Custom sprites in aseprite/ folder
- Inspiration: Super Smash Bros series

## License
MIT
