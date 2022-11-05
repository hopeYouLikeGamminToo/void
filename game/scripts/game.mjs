import { app, splash, start, game, end, login, chatbox, kraken } from "./app.mjs"

// pixijs runs @ 60 FPS
let frame = 0;

export function splashLoop() {
    frame += 1;
    if (frame == 1) { 
        console.log("splash stage");
    }

    // change splash screen duration for production
    if (frame % 60 == 0) {
        frame = 0;
        splash.visible = false;
        start.visible = true;

        app.ticker.remove(splashLoop);
        app.ticker.add(startLoop);
    }
}

export function startLoop() {
    frame += 1;
    if (frame == 1) {
        console.log("login stage");
    }

    if (!splash.visible && game.visible) {
        frame = 0;
        app.ticker.remove(startLoop);
        app.ticker.add(gameLoop);
    }
}

export function gameLoop() {
    frame += 1;
    if (frame == 1) {
        console.log("game stage");
        kraken.username = login.info[0];
    }
}