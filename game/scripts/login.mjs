import { start, game } from "./app.mjs"
import ElementWrapper from './libs/element-wrapper.mjs';

export class Login {
    constructor(renderer, stage) {
        this.form = document.getElementById("loginForm");

        this.form.addEventListener('submit', (event) => {
            // stop form submission
            event.preventDefault();
            this.submit();
        });
        
        // styling for chatbox > should try adding to style.css...
        this.form.style.fontFamily = 'space';
        this.form.style.color = "#9A8FD9";
        this.form.style.display = "block";
        // this.form.style.flexDirection = "row";
        // this.form.style.justifyContent = "flex-end";
        this.form.style.textAlign = "left";

        this.form.style.appearance = "none";
        this.form.style.position = "absolute";
        this.form.style.left = "-999em";

        this.form['username'].style.fontFamily = 'inherit';
        this.form['password'].style.fontFamily = 'inherit';
        this.form['button'].style.fontFamily = 'inherit';

        this.form['username'].style.display = "block";
        this.form['password'].style.display = "block";
        this.form['button'].style.display = "inline ";

        this.form['username'].style.color = "grey";
        this.form['username'].style.borderColor = "white";
        this.form['username'].style.backgroundColor = "black";
        // this.form['username'].style.outlineColor = "black";
        this.form['username'].focus()

        this.form['password'].style.color = "grey";
        this.form['password'].style.borderColor = "white";
        this.form['password'].style.backgroundColor = "black";
        // this.form['password'].style.outlineColor = "white";
        // this.form['password'].focus()

        this.form['button'].style.color = "#9A8FD9";
        // this.form['username'].style.border = "grey";
        this.form['button'].style.backgroundColor = "#404040";
        // this.form['username'].style.outlineColor = "grey";

        this.wrappedForm = new ElementWrapper(this.form);

        this.wrappedForm.x =  window.outerWidth / 2 - 200;
        this.wrappedForm.y =  window.outerHeight / 2 - 100;

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

        // console.log("this.wrappedForm: ", this.wrappedForm);

        this.info = []
        this.info.push(this.wrappedForm.target.elements['username'].value);
        this.info.push(this.wrappedForm.target.elements['password'].value);
        this.info.push(this.wrappedForm.target.elements['remember'].checked);
        console.log("login.info: ", this.info)
        this.wrappedForm.target.value = [];

        start.visible = false;
        game.visible = true;
    }
}
