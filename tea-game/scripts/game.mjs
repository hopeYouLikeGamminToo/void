import { Player } from './player.mjs'
import * as input from "./input.mjs";
// import { app, splash, start, game, end, login, chatbox, player } from "./app.mjs"
import { app, splash, start, game, end, login, chatbox } from "./app.mjs"
import { playerList, sendToServer, log } from "./client.mjs";
import { Point, Sprite } from './libs/pixi.mjs';

// pixijs runs @ 60 FPS
let frame = 0;
let bullets = [];

export let peerState = [];

export let self;
let playerCount = 0;
let activeList = [];
let player;
let players = [];

// should move these player functinos to player class... duh
export function addPlayer() {
    console.log("adding player");
    console.log("peerState: ", peerState);

    let difference = playerList.filter(x => !activeList.includes(x)).values();

    for (const username of difference) {
        let character = Math.random() < 0.5 ? "kraken" : "glonky"
        player = new Player(app, game, username, character); // add more characters! 
        player.sprite.x = 200; // peerState[username].x;
        player.sprite.y = 200; // peerState[username].y;
        activeList.push(username);
        players.push(player)
      }
}

function createBullet() {
    // where bullet is going to go
    var direction = new Point();
    direction.x = input.mouse.x - players[self].sprite.x;
    direction.y = input.mouse.y - players[self].sprite.y;
    console.log("direction: ", [direction.x, direction.y]);

    //Normalize
    let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    direction.x /= length;
    direction.y /= length;
    console.log("length: ", length)

    // create bullet & send in certain direction
    let bullet = new Sprite(app.loader.resources.bullet.texture);
    console.log("bullet: ", bullet);
    bullet.x = players[self].sprite.x + 75; // spaceman
    bullet.y = players[self].sprite.y + 75; // spaceman
    bullet.direction = direction;
    bullets.push(bullet);
    game.addChild(bullet);
}

function updateBullets() {
    let speed = 15;
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        bullet.x += bullet.direction.x * speed;
        bullet.y += bullet.direction.y * speed;
        // console.log("bullet direction: ", [bullet.x, bullet.y]);
        
        //Hit detection here

        if (bullet.y < 0) {
            game.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
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
        self = playerList.indexOf(login.info[0]);
    }

    if (playerList.length > activeList.length) {
    // if (Object.keys(peerState).length > activeList.length) {
        playerCount += 1
        addPlayer();
    } else if (playerList.length < activeList.length) {
        console.log("drop player");
    }

    if (input.type == 'keyboard' && activeList.length > 0) { // keyboard
        if (input.keyboard['click']) {
            // console.log("shoot!");
            if (players[self].sprite.animation != "Shoot") {
                createBullet();
            }
            players[self].sprite.setAnimation('Shoot');

        } else if (input.keyboard['Space']) {
            // console.log("space!");
            // player.setAnimation('Jump');
        } else if (input.keyboard["KeyW"]) {
            // console.log("jump!");
            players[self].sprite.setAnimation('Jump');
            players[self].sprite.y -= players[self].speed + players[self].jump;

            if (input.keyboard["KeyA"]) {
                players[self].sprite.x -= players[self].speed;
            } else if (input.keyboard["KeyD"]) {
                players[self].sprite.x += players[self].speed;
            }
        } else if (input.keyboard["KeyA"]) {
            // console.log("run left!");
            players[self].sprite.setAnimation('RunLeft');
            players[self].sprite.x -= players[self].speed;
        } else if (input.keyboard["KeyD"]) {
            // console.log("run right!");
            players[self].sprite.setAnimation('RunRight');
            players[self].sprite.x += players[self].speed;
        } else if (input.keyboard["KeyS"]) {
            // if touching platform > duck, else accelerate
            // console.log("duck!");
            players[self].sprite.setAnimation('Duck');
            players[self].sprite.y += players[self].speed;
        } else {
            players[self].sprite.setAnimation('Idle');
        }
    }

    if (input.type == "gamepad" && activeList.length > 0) {
        var gamepads = navigator.getGamepads();
        if (gamepads[0].buttons.some((elem) => elem.pressed == 1) || gamepads[0].axes.some((elem) => elem >= 0.2) || gamepads[0].axes.some((elem) => elem <= -0.2)) {
            console.log(gamepads[0]);
        }
        
        if (gamepads[0].buttons[7].value) {
            if (players[self].sprite.animation != "Shoot") {
                createBullet();
            }
            players[self].sprite.setAnimation('Shoot');

        } else if (gamepads[0].buttons[3].value || gamepads[0].axes[1] < -0.50) {
            players[self].sprite.setAnimation('Jump');
            players[self].sprite.y -= players[self].speed + players[self].jump;
            // console.log("jump!");
            if (gamepads[0].axes[0] < -0.10) {
                players[self].sprite.x -= players[self].speed;
            } else if (gamepads[0].axes[0] > 0.10) {
                players[self].sprite.x += players[self].speed;
            } 
        } else if (gamepads[0].axes[0] < -0.10) {
            players[self].sprite.setAnimation('RunLeft');
            players[self].sprite.x -= players[self].speed * -1 * gamepads[0].axes[0];
            // console.log("run left!");
        } else if (gamepads[0].axes[0] > 0.10) {
            players[self].sprite.setAnimation('RunRight');
            players[self].sprite.x += players[self].speed * gamepads[0].axes[0];
            // console.log("run right!");
        } else if (gamepads[0].axes[1] > 0.50) {
            // if touching platform > duck, else accelerate
            players[self].sprite.setAnimation('Duck');
            players[self].sprite.y += players[self].speed;
            // console.log("duck!");
        } else {
            players[self].sprite.setAnimation('Idle');
        }
    }

    players.forEach(function (player) {
        if (player.username != login.info[0]) {
            try {
                player.sprite.x = peerState[player.username].x;
                player.sprite.y = peerState[player.username].y;
                player.sprite.setAnimation(peerState[player.username].animation);
            } catch {
                // console.log("peerState: ", peerState);
            }
        } else {
            // share game state with signaling server & thus other connected clients
            var ts = Date.now();
            var msg = {
                "type": 'game',
                "ts": ts,
                "username": player.username,
                "character": player.character,
                "x": player.sprite.x, 
                "y": player.sprite.y,
                "animation": player.sprite.currentAnimation,
                "playerCount": peerState.length + 1
            }
            sendToServer(msg);
        }
    });

    updateBullets();

    //detect collisions
    // let collision = collisionDetect(player, rectangle1) || collisionDetect(player, rectangle2) || collisionDetect(player, roundBox);
    // if (collision) {
    //     // console.log("collision detected!");
    // } else {
    //     player.y += gravity;
    // }
}