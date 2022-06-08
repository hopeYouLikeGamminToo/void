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


import * as PIXI from "./pixi.mjs"

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
            this.sprite.animationSpeed = 0.25;
            this.sprite.play();
            this.currentAnimation = name;
    };
    return MultiAnimatedSprite;
}(PIXI.Container));

var state = {
    keys: {},
    player: null,
};

var mouse = {
    "x": 0,
    "y": 0,
    "angle": 0
}

var playerSpeed = 5;
var bullets = [];

function tick() {
    updateBullets();
    
    if (state.keys['click']) {
        state.player.setAnimation('Shoot');
        console.log("shoot!");
    } else if (state.keys['Space']) {
        state.player.setAnimation('Jump');
        console.log("jump!");
    } else if (state.keys["KeyA"]) {
        state.player.setAnimation('RunLeft');
        state.player.x -= playerSpeed;
        console.log("run left!");
    } else if (state.keys["KeyW"]) {
        state.player.setAnimation('Jump');
        state.player.y -= playerSpeed;
        console.log("jump!");
    } else if (state.keys["KeyD"]) {
        state.player.setAnimation('RunRight');
        state.player.x += playerSpeed;
        console.log("run right!");
    } else if (state.keys["KeyS"]) {
        state.player.setAnimation('Duck');
        // state.player.y += playerSpeed;
        console.log("duck!");
    } else {
        state.player.setAnimation('Idle');
    }

    // spaceman assets supports this
    // if (state.keys['Space']) {
    //     state.player.setAnimation('Jump');
    // } else if (state.keys['click']) {
    //     state.player.setAnimation('Shoot');
    // } else if (state.keys["KeyA"]) {
    //     state.player.setAnimation('Walk');
    //     console.log("player is walking west");
    //     state.player.x -= playerSpeed;
    // } else if (state.keys["KeyW"]) {
    //     state.player.setAnimation('Walk');
    //     state.player.y -= playerSpeed;
    //     console.log("player is walking north");
    // } else if (state.keys["KeyD"]) {
    //     state.player.setAnimation('Walk');
    //     state.player.x += playerSpeed;
    //     console.log("player is walking east");
    // } else if (state.keys["KeyS"]) {
    //     state.player.setAnimation('Walk');
    //     state.player.y += playerSpeed;
    //     console.log("player is walking south");
    // }
    // else {
    //     state.player.setAnimation('Idle');
    //     // state.moon.setAnimation('Idle');
    // }
}

function updateBullets() {
    let speed = 15;
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        bullet.x = bullet.x + Math.cos(mouse.angle * Math.PI / 180) * speed;
        bullet.y = bullet.y + Math.sin(mouse.angle * Math.PI / 180) * speed;
        if (bullet.y < 0) {
            app.stage.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
}

// preload assets
app.loader.baseUrl = 'assets';
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
    // .add('player', 'spaceman.json')
    .add('player', 'kraken.json')
    .add("bullet", "bullet.png")
    .add("moon", "moon.json").load(setup);

function setup(loader, resources) {
    var player = state.player = new MultiAnimatedSprite(resources.player.spritesheet);
    player.x = app.view.width / 4;
    player.y = app.view.height / 4;

    app.stage.addChild(player);

    // var player2 = state.player2 = new MultiAnimatedSprite(resources.player2.spritesheet);
    // player2.x = app.view.width / 4;
    // player2.y = app.view.height / 4;

    // app.stage.addChild(player2);

    // var moon = state.moon = new MultiAnimatedSprite(resources.moon.spritesheet);
    // moon.x = app.view.width / 4;
    // moon.y = app.view.height / 4;
    // app.stage.addChild(moon);
    
    app.ticker.add(tick);
}

document.body.onkeydown = function (e) {
    console.log("onkeydown: ", e.code);
    state.keys[e.code] = true;
};
document.body.onkeyup = function (e) {
    console.log("onkeykeyup: ", e.code);
    delete state.keys[e.code];
};
document.body.onmousedown = function (e) {
    console.log("onclick: ", e);

    mouse.x = e.x;
    mouse.y = e.y;
    mouse.angle

    state.keys["click"] = true;

    console.log("player {" + state.player.x + "," + state.player.y + "} " + "fires at {" + mouse.x + "," + mouse.y + "}");
};
document.body.onmouseup = function (e) {
    // console.log("onmouseup: ", e);

    let bullet = new PIXI.Sprite(app.loader.resources.bullet.texture);
    // should read arm offsets from character json sprite sheet file here
    bullet.x = state.player.x + 140; // 155; // spaceman
    bullet.y = state.player.y + 115; // 130; // spaceman
    app.stage.addChild(bullet);
    bullets.push(bullet);

    delete state.keys["click"];
};
document.body.onmousemove = function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
    mouse.angle = Math.atan2(mouse.y - state.player.y - 145, mouse.x - state.player.x + 115) * 180 / Math.PI;
};