
export class Input {
    constructor(chatbox) {
        let keys = [];
        let enterCount = 0;

        document.body.onkeydown = function (e) {
            // console.log("onkeydown: ", e.code);
            keys[e.code] = true;
        };
        document.body.onkeyup = function (e) {
            // console.log("onkeyup: ", e.code);

            if (e.code == "Space") {
                console.log("space!");
            }

            if (e.code == "Enter") {
                console.log("enter: ", enterCount)
                if (enterCount == 0) {
                    chatbox.inputMessage();
                }
                if (enterCount >= 1) {
                    enterCount = chatbox.submitMessage(enterCount);
                }
                enterCount += 1;
                delete keys[e.code];
            };
        }
    }
}
