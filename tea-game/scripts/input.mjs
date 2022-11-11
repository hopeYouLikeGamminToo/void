
import { splash, start, game, end, chatbox } from "./app.mjs";
// import { login } from "./game.mjs";


export let enterCount = 0;
export let type = 'keyboard';

export let click = null;// false;

export let mouse = {
    'x': 0,
    'y': 0,
    'angle': 0
};

export let keyboard = [];

window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);

    let switch_input = window.confirm("Switch input to gamepad?");
    if (switch_input) {
        type = "gamepad";
    }
});

document.body.onkeydown = function (e) {
    // console.log("onkeydown: ", e.code);
    keyboard[e.code] = true;
}

document.body.onkeyup = function (e) {
    // console.log("onkeyup: ", e.code);

    if (e.code == "Space") {
        // console.log("space!");
    }

    if (e.code == "Enter") {
        if (enterCount == 0) {
            if (splash.visible) {
                // chatbox.inputMessage();
                console.log("splash.visible");
            } else if (start.visible) {
                enterCount = -1;
                // login.submit(); // should submit with button only here...
                // start.visible = false;
                // game.visible = true;
            } else if (game.visible) {
                chatbox.inputMessage();
            } else if (end.visible) {
                console.log("end.visible");
            } else {
                console.log("enterCount = ", enterCount, ", but not sure what to do...")
            }
            // chatbox.inputMessage();
        }
        if (enterCount >= 1) {
            if (splash.visible) {
                // chatbox.inputMessage();
                console.log("splash.visible");
            } else if (start.visible) {
                // login.submit(); // should submit with button only here...
            } else if (game.visible) {
                enterCount = chatbox.submitMessage(enterCount);
            } else if (end.visible) {
                console.log("end.visible");
            } else {
                console.log("enterCount = ", enterCount, ", but not sure what to do...")
            }
        }
        enterCount += 1;
    }
    delete keyboard[e.code];
};

document.body.onmousedown = function (e) {
    // console.log("onmousedown: ", e.type);
    keyboard['click'] = true;
    // console.log("click: ", click);
};

document.body.onmouseup = function (e) {
    // bullet code
    // console.log("onmouseup: ", e.type);
    // keyboard = { [e.type]: false };
    delete keyboard['click'];
    // console.log("click: ", click);
};

document.body.onmousemove = function (e) {
    mouse = {
        x: e.x,
        y: e.y
    };
};
