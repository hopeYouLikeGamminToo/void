
import { splash, start, game, end, chatbox } from "./app.mjs";
// import { login } from "./game.mjs";

// keyboard stuff
export let enterCount = 0;
export let type = 'keyboard';

export let click = null;// false;

export let mouse = {
    'x': 0,
    'y': 0,
    'angle': 0
};

keystrokes.bindKey('a', {
    onPressed: () => console.log('You pressed "a"'),
    onPressedWithRepeat: () => console.log('You\'re pressing "a"'),
    onReleased: () => console.log('You released "a"'),
})

export let keyboard = [];

document.body.onkeydown = function (e) {
    console.log("onkeydown: ", e.code);
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
    // keyboard['click'] = true;
    // console.log("click: ", click);
};

document.body.onmouseup = function (e) {
    // bullet code
    // console.log("onmouseup: ", e.type);
    // keyboard = { [e.type]: false };
    keyboard['click'] = true;
    // delete keyboard['click'];
    // console.log("click: ", click);
};

document.body.onmousemove = function (e) {
    mouse = {
        x: e.x,
        y: e.y
    };
};

// gamepad stuff
// export const gamepad = {
//     controller: {},
//     turbo: false,
//     connect(evt) {
//         gamepad.controller = evt.gamepad;
//         gamepad.turbo = true;
//         console.log('Gamepad connected.');
    
//         let switch_input = window.confirm("Switch input to gamepad?");
//         if (switch_input) {
//             type = "gamepad";
//         }
//     },
//     disconnect(evt) {
//         gamepad.turbo = false;
//         delete gamepad.controller;
//         console.log('Gamepad disconnected.');
    
//         let switch_input = window.confirm("Switch input to keyboard?");
//         if (switch_input) {
//             type = "keyboard";
//         }
//     },
//     update() {
//         // Clear the buttons cache
//         gamepad.buttonsCache = [];
    
//         // Move the buttons status from the previous frame to the cache
//         for (let k = 0; k < gamepad.buttonsStatus.length; k++) {
//             gamepad.buttonsCache[k] = gamepad.buttonsStatus[k];
//         }
    
//         // Clear the buttons status
//         gamepad.buttonsStatus = [];
    
//         // Get the gamepad object
//         const c = gamepad.controller || {};
    
//         // Loop through buttons and push the pressed ones to the array
//         const pressed = [];
//         if (c.buttons) {
//             for (let b = 0; b < c.buttons.length; b++) {
//                 if (c.buttons[b].pressed) {
//                     pressed.push(gamepad.buttons[b]);
//                 }
//             }
//         }
    
//         // Loop through axes and push their values to the array
//         const axes = [];
//         if (c.axes) {
//             for (let a = 0; a < c.axes.length; a++) {
//                 axes.push(c.axes[a].toFixed(2));
//             }
//         }
    
//         // Assign received values
//         gamepad.axesStatus = axes;
//         gamepad.buttonsStatus = pressed;
    
//         // Return buttons for debugging purposes
//         return pressed;
//     },
//     buttonPressed(button, hold) {
//         let newPress = false;
    
//         // Loop through pressed buttons
//         for (let i = 0; i < gamepad.buttonsStatus.length; i++) {
//             // If we found the button we're looking for
//             if (gamepad.buttonsStatus[i] === button) {
//                 // Set the boolean variable to true
//                 newPress = true;
    
//                 // If we want to check the single press
//                 if (!hold) {
//                     // Loop through the cached states from the previous frame
//                     for (let j = 0; j < gamepad.buttonsCache.length; j++) {
//                         // If the button was already pressed, ignore new press
//                         newPress = (gamepad.buttonsCache[j] !== button);
//                     }
//                 }
//             }
//         }
//         return newPress;
//     },
//     buttons: [
//         'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right',
//         'Start', 'Back', 'Axis-Left', 'Axis-Right',
//         'LB', 'RB', 'Power', 'A', 'B', 'X', 'Y',
//     ],
//     buttonsCache: [],
//     buttonsStatus: [],
//     axesStatus: [],
// };

// window.addEventListener("gamepadconnected", gamepad.connect);
// window.addEventListener("gamepaddisconnected", gamepad.disconnect);

// setInterval(gamepad.update, 1000 / 60); // 60 times per second

window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);

    let switch_input = window.confirm("Switch input to gamepad?");
    if (switch_input) {
        type = "gamepad";
    }
});