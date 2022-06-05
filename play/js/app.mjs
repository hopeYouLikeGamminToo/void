// import extern modules
import {
    AnimatedSprite, Application, BaseTexture,
    Loader, Rectangle, Sprite, Text, TextStyle, Texture, TilingSprite,
} from './pixi.mjs';

// import costume modules
import { Player } from './player.mjs';

let app;
let backdrop;
let mountainsFar;
let mountainsClose;
let treesFar;
let treesClose;
let bgX = 0;
let bgSpeed = 1;
let player;
let playerSheet = {};
let playerSpeed = 5;
let enemy;
let mouse = { "x": 0, "y": 0 };
let angle; // angle from player to mouse
let bullets = [];
// let loopCount = 0;
let text;
let keys = {};
let keysDiv;

// create PIXI application
app = new Application({
    // options
    autoResize: true,
    resizeTo: window,
    resolution: devicePixelRatio,
    width: window.outerWidth,
    height: window.outerHeight,
    backgroundColor: 0xffffff,
    autoDensity: true
});

// Adds Pixi's generated canvas to the HTML document' body
document.body.appendChild(app.view);

// preload assets
Loader.shared.baseUrl = 'assets';
Loader.shared
    .add('backdrop', 'mountain-dusk-parallax/backdrop.png')
    .add('mountainFar', 'mountain-dusk-parallax/mountains-far.png')
    .add('mountainClose', 'mountain-dusk-parallax/mountains-close.png')
    .add('treesFar', 'mountain-dusk-parallax/trees-far.png')
    .add('treesClose', 'mountain-dusk-parallax/trees-close.png')
    .add("player", "spaceman/original.png")
    .add("enemy", "spaceman/plant-based.png")
    .add("bullet", "bullet.png")
    .add("spaceman", "spaceman/spaceman.json")

Loader.shared.load(setup);

function setup() {
    console.log("done loading assets!");

    // let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
    // let sprite = new PIXI.Sprite(sheet.textures["image.png"]);

    parseAsperiteAnimationSheet(Loader.shared.resources["spaceman"].url, "spaceman");


    // create background -> move this to separate mjs file/class
    // backdrop = createBackground(Loader.shared.resources["backdrop"].texture);
    // mountainsFar = createBackground(Loader.shared.resources["mountainFar"].texture);
    // mountainsClose = createBackground(Loader.shared.resources["mountainClose"].texture);
    // treesFar = createBackground(Loader.shared.resources["treesFar"].texture);
    // treesClose = createBackground(Loader.shared.resources["treesClose"].texture);

    // player object -> app, x, y, name, hp, speed
    // add weapon object argument
    // player = new Player(app, 300, app.view.height - player.height, "spaceman", 100, 5);
    // createPlayerSheet();
    // createPlayer();

    // enemy object
    // enemy = new Sprite.from(Loader.shared.resources.enemy.texture); // new Sprite.from(Loader.shared.resources.enemy.texture);
    // enemy.position.set(app.view.width - 300, app.view.height - enemy.height);
    // app.stage.addChild(enemy);

    // mouse interaction
    // app.stage.interactive = true;
    // app.stage.on("pointermove", movePlayer);

    //keyboard event handlers
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("pointerdown", pointerDown);

    text = new Text('Welcome   to   the   void!');
    text.x = app.view.width / 2;
    text.y = app.view.height / 2;
    text.anchor.set(0.5);
    text.style = new TextStyle(
        {
            fontFamily: 'Pixelated',
            fontSize: '32px',
            fill: '#ffffff',
            align: 'center',
        }
    );
    app.stage.addChild(text);

    // game loop
    app.ticker.add(gameLoop);
}

function createBackground(texture) {
    let tiling = new TilingSprite(texture, app.view.width, app.view.height);
    tiling.position.set(0, 0);
    app.stage.addChild(tiling);

    return tiling;
}

function createPlayerSheet() {
    let width = 122;
    let height = 165;
    let sheet = new BaseTexture.from(Loader.shared.resources["spaceman"].url);

    playerSheet["standEast"] = [
        new Texture(sheet, new Rectangle(0, 0, width, height)),

    ]
    playerSheet["walkEast"] = [
        new Texture(sheet, new Rectangle(0, 0, width, height)),
        new Texture(sheet, new Rectangle(width, 0, width, height)),
        new Texture(sheet, new Rectangle(0, height, width, height))
    ]

    return playerSheet;
}

function createPlayer() {
    player = new AnimatedSprite(playerSheet.standEast);
    player.anchor.set(0.5);
    player.animationSpeed = 0.1;
    player.loop = false;
    player.x = app.view.width / 2 - 275;
    player.y = app.view.height - 80; // / 2 + 275;
    app.stage.addChild(player);
    player.play();
}

function movePlayer(e) {
    let pos = e.data.global;
    player.x = pos.x;
    player.y = pos.y;
}

function collision(a, b) {
    let abox = a.getBounds();
    let bbox = b.getBounds();
    return abox.x + abox.width > bbox.x &&
        abox.x < bbox.x + bbox.width &&
        abox.y + abox.height > bbox.y &&
        abox.y < bbox.y + bbox.height;
}

function mouseMove(e) {
    if (e.offsetX) {
        mouse.x = e.offsetX;
        mouse.y = e.offsetY;
    }
    else if (e.layerX) {
        mouse.x = e.layerX;
        mouse.y = e.layerY;
    }

    angle = Math.atan2(mouse.y - player.y, mouse.x - player.x) * 180 / Math.PI;
}

function keyDown(e) {
    console.log(e.keyCode);
    keys[e.keyCode] = true;
}

function keyUp(e) {
    console.log(e.keyCode);
    keys[e.keyCode] = false;
}

function pointerDown(e) {
    console.log("player {" + player.x + "," + player.y + "} " + "fires at {" + mouse.x + "," + mouse.y + "}");

    // check which weapon player has equipped -> got to appropriate action method
    // for now: default gun, bullet
    let bullet = createBullet();
    bullets.push(bullet);
}

function createBullet() {
    let bullet = new Sprite(Loader.shared.resources.bullet.texture);
    bullet.x = player.x + 60; // change to gun.x || arm.x
    bullet.y = player.y + 20;
    app.stage.addChild(bullet);
    return bullet;
}

function updateBullets() {
    let speed = 15;
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        bullet.x = bullet.x + Math.cos(angle * Math.PI / 180) * speed;
        bullet.y = bullet.y + Math.sin(angle * Math.PI / 180) * speed;
        if (bullet.y < 0) {
            app.stage.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
}

function updateBackground() {
    bgX = (bgX + bgSpeed);
    treesClose.tilePosition.x = bgX / 6;
    treesFar.tilePosition.x = bgX / 8;
    mountainsClose.tilePosition.x = bgX / 10;
    mountainsFar.tilePosition.x = bgX / 12;
    backdrop.tilePosition.x = bgX / 14;
}

function gameLoop(delta) {
    //  keysDiv.innerHTML = JSON.stringify(keys);
    updateBackground();
    updateBullets(delta);

    // A
    if (keys[65]) {
        if (!player.playing) {
            player.textures = playerSheet.walkEast;
            player.play()
            console.log("player is walking west");
        }
        player.x -= playerSpeed;
    }
    // S
    if (keys[87]) {
        // player.textures = playerSheet.duck;
        player.y -= playerSpeed;
        console.log("player is walking north");
    }
    // A
    if (keys[68]) {
        if (!player.playing) {
            player.textures = playerSheet.walkEast;
            player.play()
            console.log("player is walking east");
        }
        player.x += playerSpeed;
    }
    // W
    if (keys[83]) {
        // player.textures = playerSheet.jump;
        player.y += playerSpeed;
        console.log("player is walking south");
    }

    try {
        if (collision(enemy, player)) {
            console.log("collision");
            playerSpeed = 1;
        } else {
            playerSpeed = 5;
        }
    } catch (e) {
        console.log("objects may not be created yet");
    }

    loopCount++;
    if (loopCount % 60 == 0) {
        console.log("fps: ", app.ticker.FPS);
    }
    if (loopCount % 120 == 0) {
        app.stage.removeChild(text);
    }
}