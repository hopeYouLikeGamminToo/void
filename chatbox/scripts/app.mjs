import { Application, Container, Loader, Sprite, SCALE_MODES, settings, } from './libs/pixi.mjs';

import { Player } from './player.mjs'
import { Chatbox } from './chatbox.mjs'
import { Input } from './input.mjs'

import { gameLoop } from './game.mjs'

settings.RESOLUTION = window.devicePixelRatio;
settings.SCALE_MODE = SCALE_MODES.NEAREST;

// https://pixijs.download/release/docs/PIXI.Application.html
var app = new Application({
    autoResize: true,
    resizeTo: window,
    resolution: devicePixelRatio,
    width: window.outerWidth,
    height: window.outerHeight,
    backgroundColor: 0x000000,
    autoDensity: true
});

document.body.appendChild(app.view);

// declare game scenes globally
export let start;
export let game;
export let end;
// declare game objects globally
let title;
let triangle;

// https://pixijs.download/v6.1.1/docs/PIXI.Loader.html 
Loader.shared
		.add(['images/void.png'])
		.add(['images/triangle.jpeg'])
		.load(setup); // calling setup function after loading resources


function setup() {
    // initialize game scenes & set start.visible = true
    start = new Container();
    app.stage.addChild(start);
    start.visible = true;

    game = new Container();
    app.stage.addChild(game);
    game.visible = false;

    end = new Container();
    app.stage.addChild(end);
    end.visible = false;

    // create client's player object
    let username = "HARRY" // grabbed from client.mjs

    let player = new Player(username, "title", start)
    player.setPosition(window.innerWidth / 2, window.innerHeight / 2);

    let chat = new Chatbox(app.renderer, start);
    let input = new Input(chat)

	app.ticker.add(gameLoop);
}
