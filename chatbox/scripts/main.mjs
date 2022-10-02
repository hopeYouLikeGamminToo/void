import { Application, Loader, SCALE_MODES, Sprite, settings, Text, TextStyle} from './pixi.mjs';

import canvasBounds from './canvas-bounds.mjs';
import ElementWrapper from './element-wrapper.mjs';

settings.RESOLUTION = window.devicePixelRatio;
settings.SCALE_MODE = SCALE_MODES.NEAREST;

var app = new Application({
    // options
    autoResize: true,
    resizeTo: window,
    resolution: devicePixelRatio,
    width: window.outerWidth,
    height: window.outerHeight,
    backgroundColor: 0xFFFFFF,
    autoDensity: true
});

document.body.appendChild(app.view);

const chatInput = document.getElementById("chatInput");
chatInput.style.border = "gray";
chatInput.style.fontFamily = 'space';
chatInput.style.color = "purple";
chatInput.style.backgroundColor = "gray";
chatInput.style.display = 'none'; // block = show; none = hidden

// create wrapped element
let wrappedElement = new ElementWrapper(chatInput);

wrappedElement.x = 25;
wrappedElement.y = 200;

app.stage.addChild(wrappedElement);

Loader.shared.add(['images/triangle.png']).load(setup);

function setup() {
	const triangle = new Sprite(
		Loader.shared.resources['images/triangle.png'].texture
	);

	// triangle.position.set(300, 300);
	triangle.x = window.innerWidth / 2.5;
	triangle.y = window.innerHeight /  3;
	triangle.width = 200;
	triangle.height = 200;

	// Add the triangle to the stage
	app.stage.addChild(triangle);

	app.ticker.add(loop);
}

let keys = []
let enter_cnt = 0;
let first_enter = true;
let previousMessageY;
let chatMessages = [];

document.body.onkeydown = function (e) {
	console.log("onkeydown: ", e.code);
	keys[e.code] = true;
};
document.body.onkeyup = function (e) {
	console.log("onkeyup: ", e.code);

	if (e.code == "Enter") {
		if (enter_cnt == 0) {
			chatInput.style.display = 'block';
			chatInput.focus();
		}
		if (enter_cnt == 1) {
			chatInput.style.display = 'none';
			chatInput.submit;
			var inputMessage = chatInput.value;
			chatInput.value = "";

			const style = new TextStyle({
				fontFamily: "space",
				fontSize: 12,
				fill: "white",
				stroke: "#6F5FCA",
				strokeThickness: 4,
				dropShadow: true,
				dropShadowColor: "#000000",
				dropShadowBlur: 4,
				dropShadowAngle: Math.PI / 6,
				dropShadowDistance: 6,
			  });
			
			const message = new Text(inputMessage, style);
			chatMessages.push(message);
			app.stage.addChild(message);

			if (first_enter) {
				message.y = wrappedElement.y - 100;
				previousMessageY = message.y
				console.log("message.y: ", message.y);
				first_enter = false;
			}

			message.x = 25;
			message.y = previousMessageY + 20;
			previousMessageY = message.y;
			console.log("message.y: ", message.y);
			console.log("app.stage.children: ", app.stage.children);
			console.log(app.stage.children)
			if (message.y == wrappedElement.y + 20) {
				app.stage.removeChild(chatMessages[0]);
				chatMessages.shift();
			}

			enter_cnt = -1;
		}
		enter_cnt += 1;
		console.log("enter_cnt: ", enter_cnt);
	}

	delete keys[e.code];
};

function loop(){

}