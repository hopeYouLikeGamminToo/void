import { Application, Container, Loader, Sprite, SCALE_MODES, settings, } from './libs/pixi.mjs';
// import * as Matter from "./libs/matter.min.mjs"; // this is not being nice, importing in index.html instead

import { Player } from './player.mjs';
import { Map } from './map.mjs';
import { Chatbox } from './chatbox.mjs';
import { Login } from './login.mjs';
// REMOVED: Legacy game loop imports no longer needed with SceneManager
// import { splashLoop, gameLoop } from './game.mjs';
import { connect, playerList } from "./client.mjs";
import { Engine, World, Body, Bodies } from './physics.mjs';

// Scene Manager and Scenes
import { SceneManager } from './sceneManager.mjs';
import { SplashScreen } from './scenes/splashScreen.mjs';
import { LoginScreen } from './scenes/loginScreen.mjs';
import { MainMenu } from './scenes/mainMenu.mjs';
import { CharacterSelectScreen } from './scenes/characterSelectScreen.mjs';
import { MatchmakingScreen } from './scenes/matchmakingScreen.mjs';
import { GameScreen } from './scenes/gameScreen.mjs';

// REMOVED: const BYPASS_LOGIN = true; - proper flow now enforced

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
    autoDensity: true,
});

document.body.appendChild(app.view);

console.log("app.width: ", app.screen.width);
console.log("app.height: ", app.screen.height);

export let ticker = app.ticker;
export let screen = app.screen;

// declare game scenes globally
export let splash;
export let start;
export let game;
export let end;

// declare chatbox and login globally
export let chatbox;
export let login;

// Scene Manager
export let sceneManager;

app.loader.baseUrl = 'assets';
let assets = ["void", "spaceman", "kraken", "glonky"];
for (let i = 0; i < assets.length; i++)  {
    loadCharacterAssets(assets[i]);    
}
app.loader.add("bullet", "bullet/bullet.png");
        // .add("something", "something/something.json")

app.loader.load(setup);

function setup() {
    console.log('[App] Setting up game with new scene management system...');

    // Initialize scene containers
    splash = new Container();
    splash.visible = false;
    app.stage.addChild(splash);

    start = new Container();
    start.visible = false;
    app.stage.addChild(start);

    game = new Container();
    game.visible = false;
    app.stage.addChild(game);

    end = new Container();
    end.visible = false;
    app.stage.addChild(end);

    // Legacy components (keep for now, will refactor later if needed)
    login = new Login(app.renderer, start);
    chatbox = new Chatbox(app.renderer, game);

    // Initialize Scene Manager
    sceneManager = new SceneManager(app);

    // Create and register all scenes
    const splashScreen = new SplashScreen(app, splash);
    const loginScreen = new LoginScreen(app, start, sceneManager);
    const mainMenu = new MainMenu(app, start, sceneManager);
    const characterSelect = new CharacterSelectScreen(app, start, sceneManager);
    const matchmaking = new MatchmakingScreen(app, start, sceneManager);
    const gameScreen = new GameScreen(app, game, sceneManager);

    sceneManager.registerScene('splash', splashScreen);
    sceneManager.registerScene('login', loginScreen);
    sceneManager.registerScene('mainMenu', mainMenu);
    sceneManager.registerScene('characterSelect', characterSelect);
    sceneManager.registerScene('matchmaking', matchmaking);
    sceneManager.registerScene('game', gameScreen);

    // Start with splash screen
    sceneManager.showScene('splash', {
        onComplete: () => {
            // Auto-transition to login after splash
            sceneManager.showScene('login', {}, false);
        }
    }, false);

    console.log('[App] Scene management initialized. Starting with splash screen.');
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
