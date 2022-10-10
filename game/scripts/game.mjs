import { app, splash, start, game, end } from "./app.mjs"
// import { Login } from './login.mjs'


let frame = 0;
// export let login;

export function splashLoop() {
    frame += 1;
    if (frame % 300 == 0) {
        frame = 0;
        console.log("splash > start");
        splash.visible = false;
        start.visible = true;

        // login = new Login(app.renderer, start);

        app.ticker.remove(splashLoop);
        app.ticker.add(startLoop);
    }
}

export function startLoop() {

}

export function gameLoop() {
}