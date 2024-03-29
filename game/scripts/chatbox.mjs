import { Text, TextStyle } from './libs/pixi.mjs';
import ElementWrapper from './libs/element-wrapper.mjs';

import { sendToServer, playerList } from "./client.mjs";
import {self} from "./game.mjs";
// import { player } from './app.mjs';


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

    addMessage(msg) {
        
        let message = `${msg.username}: ${msg.text}`

        let style = new TextStyle({
            fontFamily: "space",
            fontSize: 12,
            fill: "#9A8FD9",
            wordWrap: true,
            wordWrapWidth: 350,
            // TODO:    wordWrapWidth does not work well > should count characters... 
            //          may still need wordwrap for small characters...
        });

        // let color;
        if (msg.username != playerList[0]) {
            style.fill = "white";
        } else {
            style.fill = "#9A8FD9";
        }

        const pixiMessage = new Text(message, style);

        this.chatMessages.push(pixiMessage);
        this.stage.addChild(pixiMessage);

        if (this.first_enter) {
            pixiMessage.y = this.wrappedInput.y - 200;
            this.previousMessageY = pixiMessage.y
            this.first_enter = false;
        }

        pixiMessage.x = 25;
        // console.log("message.width: ", message.width);
        // console.log("Math.ceil(message.width / 250): ", Math.ceil(message.width / 250));
        pixiMessage.y = this.previousMessageY + this.messageStepSize;
        this.previousMessageY = pixiMessage.y + (this.messageStepSize * Math.ceil(pixiMessage.width / 250));

        if (pixiMessage.y >= this.wrappedInput.y - (this.messageStepSize * 3)) {
            // let removedMessageLength = this.chatMessages[0].width;
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

    submitMessage(enter_cnt) {
        this.input.style.display = "none";
        this.input.blur();
        this.input.submit;

        var inputMessage = this.wrappedInput.target.value;
        this.wrappedInput.target.value = "";

        // const message = new Text(inputMessage, style);
        // console.log("inputMessage: ", inputMessage);

        if (inputMessage != "") {
            // this.addMessage(inputMessage);
            var ts = Date.now();
            sendToServer({
                "type": "message",
                "ts": ts,
                "username": playerList[self],
                "text": inputMessage
            });
        }
        enter_cnt = -1;
        return enter_cnt
    }
}
