import { Application, Container, Loader, Sprite, SCALE_MODES, settings, } from './libs/pixi.mjs';

import { Player } from './player.mjs'
import { Chatbox } from './chatbox.mjs'
import { Login } from './login.mjs'
import { splashLoop, gameLoop } from './game.mjs'
import { playerList, sendToServer, log, connect, connection } from "./client.mjs";

const BYPASS_LOGIN = true;

// settings.RESOLUTION = window.devicePixelRatio;
settings.SCALE_MODE = SCALE_MODES.NEAREST;

// https://pixijs.download/release/docs/PIXI.Application.html
export var app = new Application({
    autoResize: true,
    resizeTo: window,
    resolution: window.devicePixelRatio,
    width: window.outerWidth,
    height: window.outerHeight,
    backgroundColor: 0x202020,
    autoDensity: true
});

document.body.appendChild(app.view);

export let ticker = app.ticker;

// declare game scenes globally
export let splash;
export let start;
export let game;
export let end;

// declare chatbox and login globally
export let chatbox;
export let login;

// export player
// export let player;

// declare game objects globally
// let title;
// let triangle;
// https://pixijs.download/v6.1.1/docs/PIXI.Loader.html 
// Loader.shared
// 		.add(['assets/void.gif'])
// 		.add(['assets/triangle.jpeg'])
// 		.load(setup); // calling setup function after loading resources

app.loader.baseUrl = 'assets';
let assets = ["void", "spaceman", "kraken", "glonky"];
for (let i = 0; i < assets.length; i++)  {
    loadCharacterAssets(assets[i]);    
}
app.loader.add("bullet", "bullet/bullet.png")
        // .add("something", "something/something.json").load();

app.loader.load(setup);
// preload assets

function setup() {
    // initialize game scenes & set start.visible = true
    splash = new Container();
    app.stage.addChild(splash);

    start = new Container();
    app.stage.addChild(start);

    game = new Container();
    app.stage.addChild(game);

    end = new Container();
    app.stage.addChild(end);

    // TODO: should create separate class for misc. objects & platforms in game
    let logo = new Player(app, splash, null, 'void')
    logo.position(window.outerWidth / 2, window.outerHeight / 2);

    login = new Login(app.renderer, start);
    chatbox = new Chatbox(app.renderer, game);
    // player = new Player(app, game, null, 'glonky'); // default to kraken for now
    // player.position(window.outerWidth / 2, window.outerHeight / 2);

    if (BYPASS_LOGIN) {
        start.visible = false;
        splash.visible = false;
        game.visible = true;
        end.visible = false;

        connect();
        login.submit(BYPASS_LOGIN);

        app.ticker.add(gameLoop);
    } else {
        splash.visible = true;
        start.visible = false;
        game.visible = false;
        end.visible = false;
        app.ticker.add(splashLoop);
    }
}

// this needs some rework > should not have to edit json file to load assets
async function loadCharacterAssets(character){
    let spritesheetPath = character + "/" + character + ".json";

    // console.log(`loading ${character} from "${spritesheetPath}"`);

    await app.loader
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
        .add(character, spritesheetPath);
}
