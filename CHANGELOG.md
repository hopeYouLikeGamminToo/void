# Changelog - void Game

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
