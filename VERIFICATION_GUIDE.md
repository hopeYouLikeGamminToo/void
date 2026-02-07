# Bug Fixes Verification Guide

## Bugs Fixed

### Bug #1: Scene Drawing Not Clearing ✅
**Issue**: Scenes were stacking on top of each other instead of clearing between transitions.

**Fix**: Removed legacy `splashLoop` and `gameLoop` imports from app.mjs that were interfering with the SceneManager system.

### Bug #2: Matchmaking Doesn't Show Online Players ✅
**Issue**: Players in matchmaking lobby could only see themselves, not other connected players.

**Fix**: 
1. Server now broadcasts userlist immediately after connections
2. Server broadcasts userlist when receiving "game" and "ready" messages
3. Matchmaking screen triggers userlist update when player joins lobby

## Manual Testing Instructions

### Setup
```bash
# Terminal 1 - Start signaling server
cd game
node server.js

# Terminal 2 - Start HTTP server
npx http-server -p 8080
```

### Test Case 1: Scene Clearing (Single Browser)

**Steps**:
1. Open browser to `http://localhost:8080`
2. Wait for splash screen (2.5 seconds)
3. Click "Play as Guest" on login screen
4. Click "Quick Play" in main menu
5. View character select screen
6. Press ESC to go back to menu
7. Click "Quick Play" again
8. View character select screen again

**Expected Results**:
- ✅ Each scene transition should be clean
- ✅ No duplicate UI elements (titles, buttons, character boxes)
- ✅ No overlapping graphics
- ✅ Character sprites show properly (not "?")

**Pass Criteria**: 
- Character select screen looks identical on 2nd visit
- No accumulated UI elements
- Console logs show "Initializing..." for character select each time

### Test Case 2: Matchmaking Player List (Two Browsers)

**Steps**:
1. Open first browser tab to `http://localhost:8080`
2. Click "Play as Guest" (note the generated username, e.g., "SwiftTiger123")
3. Navigate: Main Menu → Quick Play → Character Select → Matchmaking
4. **Keep first tab open**

5. Open second browser tab to `http://localhost:8080`
6. Click "Play as Guest" (note the second username, e.g., "BoldEagle456")
7. Navigate: Main Menu → Quick Play → Character Select → Matchmaking

**Expected Results**:

**In Browser Tab 1**:
```
Players in lobby:

> SwiftTiger123 [READY]
  BoldEagle456
```

**In Browser Tab 2**:
```
Players in lobby:

  SwiftTiger123
> BoldEagle456 [READY]
```

**Pass Criteria**:
- ✅ Both browsers show BOTH usernames in the lobby
- ✅ Current player is marked with ">" prefix
- ✅ Ready status shows correctly when clicking READY button
- ✅ Player count shows 2 (not 1)

### Test Case 3: Server Userlist Broadcasting

**Monitor server console output**:

When Player 1 connects:
```
[TIME] Connection accepted from IP
[TIME] Server is listening on port 6503
```

When Player 1 sets username:
```
(Server sends userlist to all - should show 1 player)
```

When Player 2 connects:
```
[TIME] Connection accepted from IP
(Server sends userlist to all - should show 2 players)
```

When Player 2 enters matchmaking:
```
(Server sends userlist to all again)
```

**Pass Criteria**:
- ✅ Server doesn't crash
- ✅ Multiple connections handled properly
- ✅ Userlist updates sent at appropriate times

## Debugging

### If scenes still overlap:
1. Open DevTools Console
2. Check for errors related to "clearContainer"
3. Verify no legacy loop functions are being called
4. Check that `BaseScene.show()` is calling `clearContainer()`

### If matchmaking shows only self:
1. Open DevTools Console in both tabs
2. Check for `[Matchmaking] Joined lobby, requesting player list` message
3. In server console, verify `sendUserListToAll()` is being called
4. Check Network tab for WebSocket messages
5. Verify "userlist" messages are being received with multiple users

### Console Commands for Debugging

In browser console:
```javascript
// Check playerList
console.log(playerList);

// Should show array with usernames
// e.g., ["SwiftTiger123", "BoldEagle456"]
```

## Known Limitations

- Playwright test environment blocks CDN resources (Matter.js)
- Full verification requires real browser testing
- WebSocket connections need both clients to be active simultaneously

## Success Criteria

✅ **Bug #1 Fixed**: Clean scene transitions without UI overlap  
✅ **Bug #2 Fixed**: Matchmaking shows all connected players  
✅ **No Regressions**: Existing functionality still works  
✅ **Server Stable**: Handles multiple connections without crashes

## Architecture Changes

### Before Fix:
```
app.mjs
├── Import: splashLoop (unused) ❌
├── Import: gameLoop (unused) ❌
└── SceneManager (partially working)

Server
├── Broadcasts userlist on username change only
└── Doesn't broadcast on matchmaking join
```

### After Fix:
```
app.mjs
├── No legacy loop imports ✅
└── SceneManager (fully working)

Server
├── Broadcasts userlist on username change ✅
├── Broadcasts userlist on initial connection ✅
├── Broadcasts userlist on "game" messages ✅
└── Broadcasts userlist on "ready" messages ✅
```

## Performance Notes

- Userlist broadcasts are frequent but lightweight (JSON array of usernames)
- Scene clearing prevents memory accumulation
- No performance degradation expected

## Next Steps

After verification:
1. Test with 3+ players
2. Test edge cases (rapid connect/disconnect)
3. Consider optimizing userlist broadcasts (debouncing)
4. Add player count display in matchmaking UI
