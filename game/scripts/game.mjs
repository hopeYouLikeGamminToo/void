import { Player } from './player.mjs'
import { Map } from './map.mjs'
import * as input from "./input.mjs";
// import { app, splash, start, game, end, login, chatbox, player } from "./app.mjs"
import { app, splash, start, game, end, login, chatbox } from "./app.mjs"
import { playerList, sendToServer, log } from "./client.mjs";
import { Point, Sprite } from './libs/pixi.mjs';
import { engine, World, Body, Vector } from './physics.mjs';
import { CombatSystem, AttackHitboxes } from './combat.mjs';
import { HUD } from './hud.mjs';

// pixijs runs @ 60 FPS
let frame = 0;
let bullets = [];

export let peerState = [];

export let self;
let playerCount = 0;
let activeList = [];
let player;
let map;
export let players = [];
var gravity = 7;

// Combat system
let combatSystem = new CombatSystem();
let hud = null;
let gameEnded = false;


export function splashLoop() {
    if (frame == 0) {
        console.log("splash stage");
    }

    frame += 1;

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
    if (frame == 0) {
        console.log("login stage");
    }

    frame += 1;

    if (!splash.visible && game.visible) {
        frame = 0;
        app.ticker.remove(startLoop);
        app.ticker.add(gameLoop);
    }
}

export async function gameLoop() {
    if (frame == 0) {
        console.log("game stage");
        map = new Map(app, game, 0);
        hud = new HUD(app, game);
        hud.showStatus('Waiting for players...');

        if (playerList.length == 0) {
            frame -= 1;
        } else {
            self = playerList.indexOf(login.info[0]);
        }
    }

    frame += 1;

    if (frame > 60) {
        frame = 1;
        // players[self].jumping = false;
    }

    if (playerList.length > activeList.length) {
        // if (Object.keys(peerState).length > activeList.length) {
        playerCount += 1
        addPlayer();
    } else if (playerList.length < activeList.length) {
        console.log("drop player");
    }
    
    // Show start message when 2 players are ready
    if (players.length >= 2 && frame < 180) {
        hud.showStatus('FIGHT!');
    } else if (frame == 180) {
        hud.hideStatus();
    }

    // Update HUD
    if (players.length >= 2 && hud) {
        hud.updateHealth(players[0], players[1]);
    }

    // Ensure self player exists before updating
    if (self === undefined || !players[self]) {
        return;
    }

    players[self].sprite.position = players[self].body.position;
    players[self].sprite.rotation = players[self].body.angle;
    
    // Update attack state
    players[self].updateAttack();

    switch (players[self].movement) {
        case "jumping":
            players[self].sprite.setAnimation('Jump');
            Body.applyForce(players[self].body, players[self].body.position, players[self].jump);
            break;
        case "jumpingLeft":
            players[self].sprite.setAnimation('Jump');
            Body.applyForce(players[self].body, players[self].body.position, players[self].jump);
            Body.applyForce(players[self].body, players[self].body.position, players[self].run_left);
            break;
        case "jumpingRight":
            players[self].sprite.setAnimation('Jump');
            Body.applyForce(players[self].body, players[self].body.position, players[self].jump);
            Body.applyForce(players[self].body, players[self].body.position, players[self].run_right);
            break;
        case "runningRight":
            players[self].sprite.setAnimation('RunRight');
            Body.applyForce(players[self].body, players[self].body.position, players[self].run_right);
            break;
        case "runningLeft":
            players[self].sprite.setAnimation('RunLeft');
            Body.applyForce(players[self].body, players[self].body.position, players[self].run_left);
            break;
        default:
            players[self].sprite.setAnimation('Idle');
    }

    // if (players[self].jumping) {
    //     players[self].sprite.setAnimation('Jump');
    //     Body.applyForce(players[self].body, players[self].body.position, players[self].jump);
    // } else if {

    // } {
    //     players[self].sprite.setAnimation('Idle');
    // }

    // console.log("players[self].sprite.position: ", players[self].sprite.position);
    // console.log("players[self].body.position: ", players[self].body.position);

    // if (input.type == 'keyboard' && activeList.length > 0) { // keyboard
    //     if (input.keyboard['click']) {
    //         // console.log("shoot!");
    //         if (players[self].sprite.animation != "Shoot") {
    //             createBullet("keyboard");
    //         }
    //         players[self].sprite.setAnimation('Shoot');
    //         delete input.keyboard['click'];
            
    //     } else if (input.keyboard['Space']) {
    //         // console.log("space!");
    //         // player.setAnimation('Jump');
    //     } else if (input.keyboard["KeyW"] || players[self].jumping) {
    //         // console.log("jump!");
    //         players[self].jumping = true;
    //         players[self].sprite.setAnimation('Jump');
    //         // Body.setVelocity(players[self].body, players[self].jump);
    //         Body.applyForce(players[self].body, players[self].body.position, players[self].jump);

    //         // players[self].sprite.y -= players[self].speed + players[self].jump + gravity;
    //         if (input.keyboard["KeyA"]) {
    //             // players[self].sprite.x -= players[self].speed;
    //             Body.applyForce(players[self].body, players[self].body.position, players[self].run_left);
    //         } else if (input.keyboard["KeyD"]) {
    //             // players[self].sprite.x += players[self].speed;
    //             Body.applyForce(players[self].body, players[self].body.position, players[self].run_right);
    //         }
    //     } else if (input.keyboard["KeyA"]) {
    //         // console.log("run left!");
    //         players[self].sprite.setAnimation('RunLeft');
    //         Body.applyForce(players[self].body, players[self].body.position, players[self].run_left);
    //         // players[self].sprite.x -= players[self].speed;
    //     } else if (input.keyboard["KeyD"]) {
    //         // console.log("run right!");
    //         players[self].sprite.setAnimation('RunRight');
    //         Body.applyForce(players[self].body, players[self].body.position, players[self].run_right);
    //         // players[self].sprite.x += players[self].speed;
    //     } else if (input.keyboard["KeyS"]) {
    //         // if touching platform > duck, else accelerate
    //         // console.log("duck!");
    //         players[self].sprite.setAnimation('Duck');
    //         // players[self].sprite.y += players[self].speed;
    //     } else if (input.keyboard.length == 0) {
    //         players[self].sprite.setAnimation('Idle');
    //     }
    // }

    if (input.type == "gamepad" && activeList.length > 0) {
        var gamepads = navigator.getGamepads();
        if (!gamepads || !gamepads[0]) return; // No gamepad connected
        
        if (gamepads[0].buttons.some((elem) => elem.pressed == 1) || gamepads[0].axes.some((elem) => elem >= 0.2) || gamepads[0].axes.some((elem) => elem <= -0.2)) {
            console.log(gamepads[0]);
        }

        // Attack buttons (X, Y, B for light, heavy, special)
        if (gamepads[0].buttons[2].value) { // X button - light attack
            if (players[self].startAttack('light')) {
                players[self].sprite.setAnimation('Shoot');
            }
        } else if (gamepads[0].buttons[3].value) { // Y button - heavy attack
            if (players[self].startAttack('heavy')) {
                players[self].sprite.setAnimation('Shoot');
            }
        } else if (gamepads[0].buttons[1].value) { // B button - special attack
            if (players[self].startAttack('special')) {
                players[self].sprite.setAnimation('Shoot');
            }
        } else if (gamepads[0].buttons[0].value || gamepads[0].axes[1] < -0.40 || players[self].jumping) { // A button - jump
            players[self].jumping = true;
            players[self].sprite.setAnimation('Jump');
            Body.applyForce(players[self].body, players[self].body.position, players[self].jump);
            // players[self].sprite.y -= players[self].speed + players[self].jump + gravity;
            // console.log("jump!");
            if (gamepads[0].axes[0] < -0.10) {
                // players[self].sprite.x -= players[self].speed;
                Body.applyForce(players[self].body, players[self].body.position, Vector.create(gamepads[0].axes[0] * 0.025, 0));
            } else if (gamepads[0].axes[0] > 0.10) {
                // players[self].sprite.x += players[self].speed;
                Body.applyForce(players[self].body, players[self].body.position, Vector.create(gamepads[0].axes[0] * 0.025, 0));
            } 
        } else if (gamepads[0].axes[0] < -0.10) {
            players[self].sprite.setAnimation('RunLeft');
            Body.applyForce(players[self].body, players[self].body.position, Vector.create(gamepads[0].axes[0] * 0.045, 0));// players[self].run_left + (0.0001 * gamepads[0].axes[0]));
            // players[self].sprite.x -= players[self].speed * -1 * gamepads[0].axes[0];
            // console.log("run left!");
        } else if (gamepads[0].axes[0] > 0.10) {
            players[self].sprite.setAnimation('RunRight');
            Body.applyForce(players[self].body, players[self].body.position, Vector.create(gamepads[0].axes[0] * 0.045, 0));
            // players[self].sprite.x += players[self].speed * gamepads[0].axes[0];
            // console.log("run right!");
        } else if (gamepads[0].axes[1] > 0.50) {
            // if touching platform > duck, else accelerate
            players[self].sprite.setAnimation('Duck');
            // players[self].sprite.y += players[self].speed;
            // console.log("duck!");
        } else {
            players[self].sprite.setAnimation('Idle');
        }
    }

    // Combat checks - check for attacks hitting other players
    if (players.length >= 2 && !gameEnded) {
        players.forEach((attacker, i) => {
            if (attacker.isAttacking && attacker.attackFrame > 3 && attacker.attackFrame < 12) {
                // Check hit against other players
                players.forEach((defender, j) => {
                    if (i !== j && !defender.isOffStage) {
                        const hitbox = AttackHitboxes[attacker.attackType] || AttackHitboxes.light;
                        if (combatSystem.checkHitboxCollision(attacker, defender, hitbox)) {
                            const result = combatSystem.applyDamage(attacker, defender, attacker.attackType);
                            console.log(`Hit! ${defender.username} took ${result.damage} damage. HP: ${result.remainingHealth}`);
                        }
                    }
                });
            }
        });
        
        // Check off-stage
        players.forEach(player => {
            combatSystem.checkOffStage(player, app.screen.height);
        });
        
        // Check win condition
        const winResult = combatSystem.checkWinCondition(players);
        if (winResult && hud) {
            gameEnded = true;
            if (winResult.winner) {
                hud.showStatus(`${winResult.winner.username} WINS!`);
            } else {
                hud.showStatus('DRAW!');
            }
            // TODO: Add restart functionality
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
    // let collision = collisionDetect(players[self].sprite, map.platform1) || collisionDetect(players[self].sprite, map.platform2) || collisionDetect(players[self].sprite, map.platform3);
    // if (collision) {
    //     // console.log("collision detected!");
    // } else {
    //     // players[self].sprite.y += gravity;
    // }
    // matter-js handles this now
}

// should this function be in the player.mjs file?
export function addPlayer() {
    console.log("adding player");
    console.log("peerState: ", peerState);

    let difference = playerList.filter(x => !activeList.includes(x)).values();

    for (const username of difference) {
        let character = Math.random() < 0.5 ? "kraken" : "glonky"
        player = new Player(app, game, username, character); // add more characters! 
        player.sprite.x = 200; // peerState[username].x;
        player.sprite.y = 200; // peerState[username].y;
        // World.addBody(engine.World, [player.body]) // ; >> doing this in player.mjs
        activeList.push(username);
        players.push(player)
    }
}

// should this be in another file?
function createBullet(input_type) {
    // where bullet is going to go
    var direction = new Point();

    // this bit doesn't work but was intended to make bullet direction horizontal if input type is the gamepad
    // if (input_type == "keyboard") {
    //     direction.x = input.mouse.x - players[self].sprite.x;
    //     direction.y = input.mouse.y - players[self].sprite.y;
    // } else {
    //     if (players[self].character == "kraken") {
    //         direction.x = players[self].sprite.x + 50;
    //         direction.y = players[self].sprite.y - 250;
    //     } else { //(players[self].character == "glonky")
    //         direction.x = players[self].sprite.x + 50;
    //         direction.y = players[self].sprite.y - 400;
    //     }
    // }

    direction.x = 1; // players[self].sprite.x + 1;
    direction.y = 0; // players[self].sprite.y + 1;

    console.log("direction: ", [direction.x, direction.y]);

    //Normalize
    let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    direction.x /= length;
    direction.y /= length;
    console.log("length: ", length)

    // create bullet & send in certain direction
    let bullet = new Sprite(app.loader.resources.bullet.texture);
    console.log("bullet: ", bullet);
    if (players[self].character == "kraken") {
        bullet.x = players[self].sprite.x + 135;
        bullet.y = players[self].sprite.y + 120;
    } else { //(players[self].character == "glonky")
        bullet.x = players[self].sprite.x + 90;
        bullet.y = players[self].sprite.y + 75;
    }
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

function collisionDetect(character, object) {
    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    character.centerX = character.x + character.width / 2;
    character.centerY = character.y + character.height / 2 - 20; // -20 to make character overlap platform a bit
    object.centerX = object.x + object.width / 2;
    object.centerY = object.y + object.height / 2;

    //Find the half-widths and half-heights of each sprite
    character.halfWidth = character.width / 2;
    character.halfHeight = character.height / 2;
    object.halfWidth = object.width / 2;
    object.halfHeight = object.height / 2;

    //Calculate the distance vector between the sprites
    vx = character.centerX - object.centerX;
    vy = character.centerY - object.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = character.halfWidth + object.halfWidth;
    combinedHalfHeights = character.halfHeight + object.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } else {
            //There's no collision on the y axis
            hit = false;
        }
    } else {
        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};
