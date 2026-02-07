# Quick Start Guide - void v1.0

## Get Playing in 5 Minutes! 🎮

### Prerequisites
- Node.js installed (v14 or higher)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: A gamepad/controller for Player 2

### Setup Steps

#### 1. Install Dependencies
```bash
cd game
npm install
```

#### 2. Start the Signaling Server
Open a terminal and run:
```bash
node server.js
```

You should see: `Server is listening on port 6503`

#### 3. Start the Game
Open a **new terminal** (keep the server running) and run:
```bash
npx http-server -p 8080
```

Or use any simple HTTP server. Alternative options:
```bash
# Using Python 3
python -m http.server 8080

# Using npm live-server
npx live-server --port=8080
```

#### 4. Open in Browser
Navigate to: **http://localhost:8080**

The game will start automatically (login screen is bypassed in dev mode).

#### 5. Add Second Player
To play 2-player:

**Option A: Same Machine**
- Open a new browser tab/window
- Go to `http://localhost:8080`
- Both players are now connected!

**Option B: LAN**
- Find your local IP (e.g., `192.168.1.100`)
- Player 1: `http://192.168.1.100:8080`
- Player 2: `http://192.168.1.100:8080` (on another device)

⚠️ **Note**: Both players must connect to the same signaling server.

---

## Controls

### Player 1 (Keyboard)
```
Movement:
  W - Jump
  A - Move Left
  D - Move Right
  S - Duck

Combat:
  J - Light Attack (fast, low damage)
  K - Heavy Attack (medium speed, medium damage)
  L - Special Attack (slow, high damage)

Other:
  R - Restart (after match ends)
```

### Player 2 (Gamepad)
```
Movement:
  Left Stick - Move/Jump

Combat:
  X - Light Attack
  Y - Heavy Attack
  B - Special Attack
```

When you plug in a gamepad, the game will ask if you want to switch to gamepad control. Say yes!

---

## How to Play

1. **Objective**: Knock your opponent off the stage or reduce their HP to 0

2. **Damage System**: 
   - Attacks deal damage AND increase your opponent's damage percentage
   - Higher damage % = stronger knockback
   - Just like Super Smash Bros!

3. **Strategy Tips**:
   - Use light attacks for combos
   - Heavy attacks for big knockback
   - Special attacks when you have an opening
   - Watch your opponent's damage % - at high %, they fly further!

4. **Win Condition**:
   - Reduce opponent's HP to 0, OR
   - Knock them below the stage
   - Winner is displayed on screen
   - Press R to play again!

---

## Character Selection

Currently, characters are randomly assigned when you join. Four characters available:

| Character  | Playstyle         | Speed | Weight | Attack |
|-----------|-------------------|-------|--------|--------|
| **Kraken**    | Balanced          | 1.0x  | 105    | 1.2x   |
| **Spaceman**  | Fast & Light      | 1.15x | 85     | 0.95x  |
| **Glonky**    | Tank (Heavy/Slow) | 0.95x | 115    | 1.35x  |
| **Void**      | Speed Demon       | 1.25x | 80     | 0.9x   |

**Weight** affects knockback resistance (heavier = harder to KO)
**Attack** is damage multiplier (higher = more damage per hit)

---

## Troubleshooting

### "Waiting for players..." won't go away
- Make sure you opened a second tab/window for Player 2
- Check that the signaling server is running (`node server.js`)
- Refresh both browser windows

### Controls not working
- Click inside the game window to focus it
- If using gamepad, make sure you confirmed the switch when prompted
- Try pressing a key to test - you should see console logs

### Players appear but game freezes
- Check browser console (F12) for errors
- Make sure you're running from localhost (not file://)
- Try refreshing both players

### Gamepad not detected
- Plug in gamepad before starting the game
- Press a button on the gamepad
- You should see "Gamepad connected" message
- Confirm the prompt to switch input mode

### Players are desynced
- This shouldn't happen with local play
- If it does, refresh both windows and reconnect
- Make sure both players are on the same network

### "Can't connect to signaling server"
- Verify `node server.js` is running
- Check that it says "Server is listening on port 6503"
- Make sure no other app is using port 6503

---

## Performance Tips

- Close unnecessary browser tabs
- Use a modern browser (Chrome/Firefox recommended)
- If laggy, reduce browser window size
- Disable browser extensions that might interfere

---

## Advanced: WSL2 Users

If you're on Windows using WSL2:
1. Run `./wsl.sh` before starting the server
2. This updates the hostname for WSL2 networking

---

## That's It!

You're ready to fight! Have fun and may the best player win! 🏆

For more details, see the main [README.md](../README.md) or [CHANGELOG.md](../CHANGELOG.md).

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│  VOID v1.0 - Quick Controls                     │
├─────────────────────────────────────────────────┤
│  KEYBOARD          │  GAMEPAD                   │
├────────────────────┼────────────────────────────┤
│  W,A,S,D - Move    │  Left Stick - Move        │
│  J - Light Attack  │  X - Light Attack         │
│  K - Heavy Attack  │  Y - Heavy Attack         │
│  L - Special       │  B - Special              │
│  R - Restart       │                           │
└─────────────────────────────────────────────────┘
```

Enjoy the game! 🎮✨
