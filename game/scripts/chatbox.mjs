import { Text, TextStyle } from './libs/pixi.mjs';
import ElementWrapper from './libs/element-wrapper.mjs';

export class Chatbox {
    constructor(renderer, stage) {
        this.input = document.getElementById("chatInput");

        // styling for chatbox > should try adding to style.css...
        this.input.style.fontFamily = 'space';
        this.input.style.color = "#9A8FD9";
        this.input.style.border = "gray";
        this.input.style.backgroundColor = "black";
        this.input.style.outlineColor = "black";
        // this.input.style.outlineWidth = "0px";
        // this.input.style.outlineStyle = "none";
        this.input.style.outlineOffset = "0px";
        this.input.style.overflow = "hidden";
        this.input.style.pointerEvents = "none";
        this.input.style.padding = "0px";
        this.input.style.margin = "0px";
        this.input.style.lineHeight = "0px";
        this.input.style.appearance = "none";
        this.input.style.whiteSpace = "nowrap";
        this.input.style.position = "absolute";
        // move input form off screen > wrapped element will be in canvas
        this.input.style.left = "-999em";
        this.input.style.display = 'none'; // block = show; none = hidden

        this.wrappedInput = new ElementWrapper(this.input);

        this.wrappedInput.x = 25;
        this.wrappedInput.y = 240;

        // chatbox helper variables
        this.first_enter = true;
        this.previousMessageY;
        this.chatMessages = [];
        this.messageStepSize = 10;

        this.stage = stage;
        this.renderer = renderer;
        this.stage.addChild(this.wrappedInput);
    }

    inputMessage() {
        this.input.style.display = "block";
        this.input.focus();
    }

    submitMessage(enter_cnt) {
        this.input.style.display = "none";
        this.input.blur();
        this.input.submit;

        var inputMessage = this.wrappedInput.target.value;
        this.wrappedInput.target.value = "";

        const style = new TextStyle({
            fontFamily: "space",
            fontSize: 12,
            fill: "#9A8FD9",
            wordWrap: true,
            wordWrapWidth: 300, 
            // TODO:    wordWrapWidth does not work well > should count characters... 
            //          may still need wordwrap for small characters...
        });

        const message = new Text(inputMessage, style);
        // console.log("inputMessage: ", inputMessage);

        if (inputMessage != "") {
            this.chatMessages.push(message);
            this.stage.addChild(message);

            if (this.first_enter) {
                message.y = this.wrappedInput.y - 200;
                this.previousMessageY = message.y
                this.first_enter = false;
            }

            message.x = 25;
            // console.log("message.width: ", message.width);
            // console.log("Math.ceil(message.width / 250): ", Math.ceil(message.width / 250));
            message.y = this.previousMessageY + this.messageStepSize;
            this.previousMessageY = message.y + (this.messageStepSize * Math.ceil(message.width / 250));

            if (message.y >= this.wrappedInput.y - (this.messageStepSize * 3)) {
                let removedMessageLength = this.chatMessages[0].width;
                // console.log("removing this.chatMessages[0]: ", this.chatMessages[0])
                this.stage.removeChild(this.chatMessages[0]);
                this.previousMessageY -= this.messageStepSize * 2.5;
                this.renderer.render(this.stage);
                this.chatMessages.shift();
                for (var i = 0; i < this.chatMessages.length; i++) {
                    this.chatMessages[i].y -= this.messageStepSize * 2.5;
                }
            }
        }
        enter_cnt = -1;
        return enter_cnt
    }
}
