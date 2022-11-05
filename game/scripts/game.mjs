import { Player } from './player.mjs'
import * as input from "./input.mjs";
import { app, splash, start, game, end, login, chatbox, player } from "./app.mjs"
import { playerList, sendToServer, log } from "./client.mjs";

// pixijs runs @ 60 FPS
let frame = 0;

export let peerState = [];
// [{
//     "username": {
//         "player": null,
//         "ts": null,
//         "character": null,
//         "x": null,
//         "y": null,
//         "animation": null,
//         "playerCount": null
//     }
// }]

let playerCount = 1;
let player2;

export function addPlayer() {
    playerList.forEach(function (username) {
        if (username != player.username) {
            console.log("peerState:", peerState);
            player2 = new Player(app, game, username, "kraken"); // add more characters!
            player2.sprite.x = peerState[username].x;
            player2.sprite.y = peerState[username].y;
            // player2.sprites = peerState[username].animation;
        }
    });
}

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
        player.username = login.info[0];
    }

    console.log("peerState: ",peerState);
    console.log("Object.keys(peerState).length", Object.keys(peerState).length)
    if (Object.keys(peerState).length > playerCount) {
        playerCount += 1
        console.log("boom! ", playerCount);
        addPlayer();
        // TODO: drop players too
    }

    if (playerCount > 1) {
        playerList.forEach(function (username) {
            if (username != player.username){
                player2.sprite.x = peerState[username].x;
                player2.sprite.y = peerState[username].y;
                player2.sprite.setAnimation(peerState[username].animation);
            }
        });
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

    // share game state with signaling server & thus other connected clients
    var ts = Date.now();
    var msg = {
        "ts": ts,
        "username": player.username,
        "character": player.character,
        "x": player.sprite.x, 
        "y": player.sprite.y,
        "animation": player.sprite.currentAnimation,
        "playerCount": peerState.length + 1
    }
    sendToServer(msg);

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