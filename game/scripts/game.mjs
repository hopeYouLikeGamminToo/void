import { ticker, splash, start, game, end, login, chatbox, player } from "./app.mjs"
import * as input from "./input.mjs";

// pixijs runs @ 60 FPS
let frame = 0;

export function splashLoop() {
    frame += 1;
    if (frame == 1) { 
        console.log("splash stage");
    }

    // change splash screen duration for production
    if (frame % 200 == 0) {
        frame = 0;
        splash.visible = false;
        start.visible = true;

        ticker.remove(splashLoop);
        ticker.add(startLoop);
    }
}

export function startLoop() {
    frame += 1;
    if (frame == 1) {
        console.log("login stage");
    }

    if (!splash.visible && game.visible) {
        frame = 0;
        ticker.remove(startLoop);
        ticker.add(gameLoop);
    }
}

export function gameLoop() {
    frame += 1;
    if (frame == 1) {
        console.log("game stage");
        player.username = login.info[0];
    }

    if (input.type == 'keyboard') { // keyboard
        if (input.keyboard['click']) {
            // console.log("shoot!");
            player.sprite.setAnimation('Shoot');
        } else if (input.keyboard['Space']) {
            // console.log("space!");
            // player.setAnimation('Jump');
        } else if (input.keyboard["KeyW"]) {
            // console.log("jump!");
            player.sprite.setAnimation('Jump');
            player.sprite.y -= player.speed + player.jump;

            if (input.keyboard["KeyA"]) {
                player.sprite.x -= player.speed;
            } else if (input.keyboard["KeyD"]) {
                player.sprite.x += player.speed;
            } 
        } else if (input.keyboard["KeyA"]) {
            // console.log("run left!");
            player.sprite.setAnimation('RunLeft');
            player.sprite.x -= player.speed;
        } else if (input.keyboard["KeyD"]) {
            // console.log("run right!");
            player.sprite.setAnimation('RunRight');
            player.sprite.x += player.speed;
        } else if (input.keyboard["KeyS"]) {
            // if touching platform > duck, else accelerate
            // console.log("duck!");
            player.sprite.setAnimation('Duck');
            player.sprite.y += player.speed;
        } else {
            player.sprite.setAnimation('Idle');
        }
    }
    
    // updateBullets();

    //detect collisions
    // let collision = collisionDetect(player, rectangle1) || collisionDetect(player, rectangle2) || collisionDetect(player, roundBox);
    // if (collision) {
    //     // console.log("collision detected!");
    // } else {
    //     player.y += gravity;
    // }

    // share game input with signaling server & thus other connected clients
    // var ts = Date.now();
    // var msg = {
    //     "ts": ts,
    //     "username": username,
    //     "character": character,
    //     "x": player.x, 
    //     "y": player.y,
    //     "animation": player.currentAnimation,
    //     "playerCount": playerCount  
    // }
    // sendToServer(msg);
}