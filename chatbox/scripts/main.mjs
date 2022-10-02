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
    backgroundColor: 0x000000,
    autoDensity: true
});

document.body.appendChild(app.view);

const chatInput = document.getElementById("chatInput");
chatInput.style.fontFamily = 'space';
chatInput.style.color = "#6F5FCA";
chatInput.style.border = "gray";
chatInput.style.backgroundColor = "black";
chatInput.style.outlineColor = "black";
chatInput.style.pointerEvents = "none";
chatInput.style.padding = "0px";
chatInput.style.margin = "0px";
chatInput.style.lineHeight = "0px";
// chatInput.style.display = 'none'; // block = show; none = hidden

// create wrapped element
let wrappedElement = new ElementWrapper(chatInput);

wrappedElement.x = 25;
wrappedElement.y = 240;

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
	// console.log("onkeydown: ", e.code);
	keys[e.code] = true;
};
document.body.onkeyup = function (e) {
	// console.log("onkeyup: ", e.code);

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
				fill: "#6F5FCA",
				// stroke: "#6F5FCA",
				// strokeThickness: 4,
				// dropShadow: true,
				// dropShadowColor: "#000000",
				// dropShadowBlur: 4,
				dropShadowAngle: Math.PI / 6,
				dropShadowDistance: 6,
			  });
			
			const message = new Text(inputMessage, style);
			console.log("message: ", inputMessage);
			if (inputMessage != ""){
				chatMessages.push(message);
				app.stage.addChild(message);

				if (first_enter) {
					message.y = wrappedElement.y - 200;
					previousMessageY = message.y
					console.log("message.y: ", message.y);
					first_enter = false;
				}
	
				message.x = 25;
				message.y = previousMessageY + 20;
				previousMessageY = message.y;
				console.log("message.y: ", message.y);
				if (message.y >= wrappedElement.y - 20) {
					app.stage.removeChild(chatMessages[0]);
					previousMessageY -= 20;
					app.renderer.render(app.stage);
					chatMessages.shift();
					console.log("chatMessages: ", chatMessages)
					for (var i = 0; i < chatMessages.length; i++) {
						chatMessages[i].y -= 20;
					}
				}
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