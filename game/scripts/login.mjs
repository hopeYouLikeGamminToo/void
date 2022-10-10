import { Text, TextStyle } from './libs/pixi.mjs';
import ElementWrapper from './libs/element-wrapper.mjs';

export class Login {
    constructor(renderer, stage) {
        console.log(
            "renderer: ", renderer,
            "stage: ", stage
        )
        this.form = document.getElementById("loginForm");

        // styling for chatbox > should try adding to style.css...
        this.form.style.fontFamily = 'space';
        this.form.style.color = "#9A8FD9";
        this.form.style.border = "black";
        this.form.style.backgroundColor = "black";
        this.form.style.outlineColor = "black";
        // this.form.style.outlineWidth = "0px";
        // this.form.style.outlineStyle = "none";
        this.form.style.outlineOffset = "0px";
        this.form.style.overflow = "hidden";
        this.form.style.pointerEvents = "none";
        this.form.style.padding = "0px";
        this.form.style.margin = "0px";
        this.form.style.lineHeight = "0px";
        this.form.style.appearance = "none";
        this.form.style.whiteSpace = "nowrap";
        this.form.style.position = "absolute";
        // move input form off screen > wrapped element will be in canvas
        this.form.style.left = "-999em";
        this.form.style.display = 'block'; // block = show; none = hidden
        this.form.focus();

        this.wrappedForm = new ElementWrapper(this.form);

        this.wrappedForm.x =  300;
        this.wrappedForm.y =  300;

        // chatbox helper variables
        this.first_enter = true;
        this.previousMessageY;
        this.chatMessages = [];
        this.messageStepSize = 20;

        // // wait to add chatInput to scene
        this.stage = stage;
        this.renderer = renderer;
        this.stage.addChild(this.wrappedForm);
    }

    submit() {
        this.form.style.display = "none";
        this.form.blur();
        this.form.submit;

        var loginInfo = this.wrappedForm.target.value;
        this.wrappedForm.target.value = "";
        console.log("loginInfo: ", loginInfo)
    }
}
