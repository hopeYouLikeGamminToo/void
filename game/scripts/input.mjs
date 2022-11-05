
import { splash, start, game, end, chatbox, login } from "./app.mjs";
// import { login } from "./game.mjs";

export class Input {
    constructor() {
        let keys = [];
        let enterCount = 0;

        document.body.onkeydown = function (e) {
            // console.log("onkeydown: ", e.code);
            keys[e.code] = true;
        };
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
            delete keys[e.code];
        };
    }
}
