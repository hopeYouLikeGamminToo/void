import * as PIXI from "./pixi.mjs";
import { username, clientID, sendToServer, log} from "./client.mjs";

var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// MultiAnimatedSprite needs extends to load spritesheet
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

// Use the native window resolution as the default resolution
// will support high-density displays when rendering
PIXI.settings.RESOLUTION = window.devicePixelRatio;
// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var app = new PIXI.Application({
    // options
    autoResize: true,
    resizeTo: window,
    resolution: devicePixelRatio,
    width: window.outerWidth,
    height: window.outerHeight,
    backgroundColor: 0x000000,
    autoDensity: true
});

document.body.appendChild(app.view);

var MultiAnimatedSprite = /** @class */ (function (_super) {
    __extends(MultiAnimatedSprite, _super);
    function MultiAnimatedSprite(spritesheet) {
        var _this = _super.call(this) || this;
        _this.spritesheet = spritesheet;
        console.log("spritesheet: ", spritesheet);
        _this.scale.x = _this.scale.y = 1;
        var defaultAnimation = Object.keys(spritesheet.animations)[0];
        _this.setAnimation(defaultAnimation);
        return _this;
    }
    MultiAnimatedSprite.prototype.setAnimation = function (name) {
        if (this.currentAnimation === name)
            return;

        var textures = this.spritesheet.animations[name];
        if (!this.sprite) {
            this.sprite = new PIXI.AnimatedSprite(textures);
            this.addChild(this.sprite);
        }
        else {
            this.sprite.textures = textures;
        }
        this.sprite.animationSpeed = 0.22;
        this.sprite.play();
        this.currentAnimation = name;
    };
    return MultiAnimatedSprite;
}(PIXI.Container));

var state = {
    keys: {},
    player: null,
    onlinePlayers: {},
    playerCount: 1
};

var mouse = {
    "x": 0,
    "y": 0,
    "angle": 0
}

// (keyboard/mouse, gampepad, touch)
let input_type = "keyboard";
var player = null;
var player2 = null;
var character = null;

var gravity = 7;
var jumpSpeed = 10;
var playerSpeed = 5;
var bullets = [];

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

function addOnlinePlayer() {
    // create player
    try {
        player2 = new MultiAnimatedSprite(app.loader.resources.kraken.spritesheet); 
        app.stage.addChild(player2);
    } catch(err) { 
        console.log("ERROR ADDING ONLINE PLAYER: ", err);
    }
}

function gameLoop() {
    stats.begin();
    console.log("online player count: ", Object.keys(state.onlinePlayers).length);
    if (Object.keys(state.onlinePlayers).length > state.playerCount) {
        console.log("Another player joined the match!");
        state.playerCount += 1;
        addOnlinePlayer();
    }
    if (state.playerCount > 1) {
        if (Object.keys(state.onlinePlayers)[0] === username) {
            var thisUsername = Object.keys(state.onlinePlayers)[1];
        } else {
            var thisUsername = Object.keys(state.onlinePlayers)[0];
        }
        player2.x = state.onlinePlayers[thisUsername].x
        player2.y = state.onlinePlayers[thisUsername].y
        player2.setAnimation(state.onlinePlayers[thisUsername].animation)
    }
    // user input + positional console.logic
    if (input_type == "gamepad") {
        var gamepads = navigator.getGamepads();
        if (gamepads[0].buttons.some((elem) => elem.pressed == 1) || gamepads[0].axes.some((elem) => elem >= 0.2) || gamepads[0].axes.some((elem) => elem <= -0.2)) {
            console.log(gamepads[0]);
        }
        if (gamepads[0].buttons[7].value) {
            state.player.setAnimation('Shoot');
            console.log("shoot!");
            var direction = new PIXI.Point();
            direction.x = mouse.x - player.x;
            direction.y = mouse.y - player.y - 526;

            //Normalize
            let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            direction.x /= length;
            direction.y /= length;

            let bullet = new PIXI.Sprite(app.loader.resources.bullet.texture);
            bullet.x = state.player.x + 140; // 155; // spaceman
            bullet.y = state.player.y + 115; // 130; // spaceman
            console.log("bullet direction: ", direction);
            bullet.direction = direction;
            bullets.push(bullet);
            app.stage.addChild(bullet);

            // let bullet = new PIXI.Sprite(app.loader.resources.bullet.texture);
            // // should read arm offsets from character json sprite sheet file here
            // bullet.x = state.player.x + 140; // 155; // spaceman
            // bullet.y = state.player.y + 115; // 130; // spaceman
            // app.stage.addChild(bullet);
            // bullets.push(bullet);
            // delete state.keys["click"];
        } else if (gamepads[0].buttons[3].value || gamepads[0].axes[1] < -0.50) {
            state.player.setAnimation('Jump');
            state.player.y -= playerSpeed + jumpSpeed;
            console.log("jump!");
            if (gamepads[0].axes[0] < -0.10) {
                state.player.x -= playerSpeed;
            } else if (gamepads[0].axes[0] > 0.10) {
                state.player.x += playerSpeed;
            } 
        } else if (gamepads[0].axes[0] < -0.10) {
            state.player.setAnimation('RunLeft');
            state.player.x -= playerSpeed * -1 * gamepads[0].axes[0];
            console.log("run left!");
        } else if (gamepads[0].axes[0] > 0.10) {
            state.player.setAnimation('RunRight');
            state.player.x += playerSpeed * gamepads[0].axes[0];
            console.log("run right!");
        } else if (gamepads[0].axes[1] > 0.50) {
            // if touching platform > duck, else accelerate
            state.player.setAnimation('Duck');
            // state.player.y += playerSpeed;
            console.log("duck!");
        } else {
            state.player.setAnimation('Idle');
        }
    }
    if (input_type == "keyboard") { // keyboard
        if (state.keys['click']) {
            state.player.setAnimation('Shoot');
            console.log("shoot!");
        } else if (state.keys['Space']) {
            // state.player.setAnimation('Jump');
            console.log("space!");
        } else if (state.keys["KeyW"]) {
            state.player.setAnimation('Jump');
            state.player.y -= playerSpeed + jumpSpeed; // jump speed
            console.log("jump!");
            if (state.keys["KeyA"]) {
                state.player.x -= playerSpeed;
            } else if (state.keys["KeyD"]) {
                state.player.x += playerSpeed;
            } 
        } else if (state.keys["KeyA"]) {
            state.player.setAnimation('RunLeft');
            state.player.x -= playerSpeed;
            console.log("run left!");
        } else if (state.keys["KeyD"]) {
            state.player.setAnimation('RunRight');
            state.player.x += playerSpeed;
            console.log("run right!");
        } else if (state.keys["KeyS"]) {
            // if touching platform > duck, else accelerate
            state.player.setAnimation('Duck');
            // state.player.y += playerSpeed;
            console.log("duck!");
        } else {
            state.player.setAnimation('Idle');
        }
    }
    updateBullets();

    //detect collisions
    let collision = collisionDetect(player, rectangle1) || collisionDetect(player, rectangle2) || collisionDetect(player, roundBox);
    if (collision) {
        // console.log("collision detected!");
    } else {
        state.player.y += gravity;
    }

    //resolve collisions

    // share game state with signaling server & thus other connected clients
    var ts = Date.now();
    var msg = {
        "ts": ts,
        "username": username,
        "character": character,
        "x": state.player.x, 
        "y": state.player.y,
        "animation": state.player.currentAnimation,
        "playerCount": state.playerCount  
    }
    sendToServer(msg);

    stats.end();

}

function updateBullets() {
    let speed = 15;
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        bullet.x += bullet.direction.x * speed;
        bullet.y += bullet.direction.y * speed;
        //Hit detection here
        if (bullet.y < 0) {
            app.stage.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
}

// preload assets
app.loader.baseUrl = 'assets';
app.loader.add("bullet", "bullet.png")
    .add("moon", "moon.json").load();

// replace with load map fxn here
// create a couple pixi shapes to act as platforms & start working on collision physics
const rectangle1 = new PIXI.Graphics();
rectangle1.lineStyle({ width: 4, color: 0x575757, alpha: 1 });
rectangle1.beginFill(0xDAFFFF);
rectangle1.drawRoundedRect(0, 0, app.screen.width / 6, app.screen.height / 25, 10);
rectangle1.endFill();
rectangle1.x = app.screen.width / 1.33;
rectangle1.y = app.screen.height / 2;
app.stage.addChild(rectangle1);

const rectangle2 = new PIXI.Graphics();
rectangle2.lineStyle({ width: 4, color: 0x575757, alpha: 1 });
rectangle2.beginFill(0xDAFFFF);
rectangle2.drawRoundedRect(0, 0, app.screen.width / 6, app.screen.height / 25, 10);
rectangle2.endFill();
rectangle2.x = app.screen.width / 12;
rectangle2.y = app.screen.height / 2;
app.stage.addChild(rectangle2);

const roundBox = new PIXI.Graphics();
roundBox.lineStyle({ width: 4, color: 0x575757, alpha: 1 });
roundBox.beginFill(0xABABAB);
roundBox.drawRoundedRect(0, 0, app.screen.width / 2, app.screen.height / 25, 10);
roundBox.endFill();
roundBox.x = app.screen.width / 4;
roundBox.y = app.screen.height / 1.3;
app.stage.addChild(roundBox);

function setup(loader, resources) {
    console.log(resources);

    // create player
    try {
        switch (character) {
            case "kraken":
                player = state.player = new MultiAnimatedSprite(resources.kraken.spritesheet);
            case "spaceman":
                player = state.player = new MultiAnimatedSprite(resources.spaceman.spritesheet);
            default:
                console.log("character not available!")
        }
    } catch(err) { 
        console.log("ERROR CREATING PLAYER: ", err);
    }
    
    state.player.x = app.screen.width / 8;
    state.player.y = app.screen.height / 4;

    app.stage.addChild(state.player);

    configureInputHandlers();

    app.ticker.add(gameLoop);
}

function configureInputHandlers() {
    document.body.onkeydown = function (e) {
        console.log("onkeydown: ", e.code);
        state.keys[e.code] = true;
        if (e.code == "Space" && mouse.y > 400) {
            e.preventDefault(); // prevent spacebar scrolling
        }
    };
    document.body.onkeyup = function (e) {
        console.log("onkeyup: ", e.code);
        delete state.keys[e.code];
    };
    document.body.onmousedown = function (e) {
        console.log("onclick: ", e);
        // mouse.x = e.x;
        // mouse.y = e.y;
        // mouse.angle = Math.atan2(mouse.y - state.player.y, mouse.x - state.player.x) * 180 / Math.PI;

        state.keys["click"] = true;
        console.log("player {" + state.player.x + "," + state.player.y + "} " + "fires at {" + mouse.x + "," + mouse.y + "}");
    };
    document.body.onmouseup = function (e) {
        // console.log("onmouseup: ", e);
        var direction = new PIXI.Point();
        direction.x = e.pageX - player.x;
        direction.y = e.pageY - player.y - 526;

        //Normalize
        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;

        let bullet = new PIXI.Sprite(app.loader.resources.bullet.texture);
        bullet.x = state.player.x + 140; // 155; // spaceman
        bullet.y = state.player.y + 115; // 130; // spaceman
        console.log("bullet direction: ", direction);
        bullet.direction = direction;
        bullets.push(bullet);
        app.stage.addChild(bullet);
        delete state.keys["click"];
    };
    document.body.onmousemove = function (e) {
        mouse.x = e.x;
        mouse.y = e.y;
        // mouse.angle = Math.atan2(mouse.y - state.player.y - 470, mouse.x - state.player.x) * 180 / Math.PI; // - 145; + 115
    };
    window.addEventListener("gamepadconnected", function (e) {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);

        let switch_input = window.confirm("Switch input to gamepad?");
        if (switch_input) {
            input_type = "gamepad";
        } else {
            // input_type = "keyboard" // default
        }
    });
}

function addPlayer(){
    console.log("adding ", username, " to stage!");

    if ("kraken" in app.loader.resources) {
        character = "spaceman";
    } else {
        character = "kraken";
    }

    app.loader
        .use(function (resource, next) {
            if (resource.extension === 'json' && resource.data.meta.app === 'http://www.aseprite.org/') {
                for (var _i = 0, _a = resource.data.meta.frameTags; _i < _a.length; _i++) {
                    var tag = _a[_i];
                    var frames = [];
                    for (var i = tag.from; i < tag.to; i++) {
                        frames.push({ texture: resource.textures[i], time: resource.data.frames[i].duration });
                    }
                    if (tag.direction === 'pingpong') {
                        for (var i = tag.to; i >= tag.from; i--) {
                            frames.push({ texture: resource.textures[i], time: resource.data.frames[i].duration });
                        }
                    }
                    resource.spritesheet.animations[tag.name] = frames;
                }
            }
            next();
        })
        .add(character, character + ".json").load(setup);
}

export {addPlayer, state};
