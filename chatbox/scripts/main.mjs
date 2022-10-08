import { Application, Container, Loader, SCALE_MODES, Sprite, settings, Text, TextStyle} from './pixi.mjs';
import ElementWrapper from './element-wrapper.mjs';

settings.RESOLUTION = window.devicePixelRatio;
settings.SCALE_MODE = SCALE_MODES.NEAREST;

let startupScene;
let gameScene;
let gameOverScene;

let triangle;
let square;

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

/****************************
	MOVE TO SETUP FXN
******************************/
const chatInput = document.getElementById("chatInput");
chatInput.style.fontFamily = 'space';
chatInput.style.color = "#6F5FCA";
chatInput.style.border = "gray";
chatInput.style.backgroundColor = "black";
chatInput.style.outlineColor = "black";
// chatInput.style.outlineWidth = "0px";
// chatInput.style.outlineStyle = "none";
chatInput.style.outlineOffset = "0px";
chatInput.style.overflow = "hidden";	
chatInput.style.pointerEvents = "none";
chatInput.style.padding = "0px";
chatInput.style.margin = "0px";
chatInput.style.lineHeight = "0px";
chatInput.style.appearance = "none";
chatInput.style.whiteSpace = "nowrap";
chatInput.style.position = "absolute"; 
// move input form off screen > wrapped element will be in canvas
chatInput.style.left= "-999em";
chatInput.style.display = 'none'; // block = show; none = hidden

const username = document.getElementById("username");
username.style.fontFamily = 'space';
username.style.color = "#6F5FCA";
username.style.border = "gray";
username.style.backgroundColor = "white";
username.style.outlineColor = "white";
// username.style.outlineWidth = "0px";
// username.style.outlineStyle = "none";
username.style.outlineOffset = "0px";
username.style.overflow = "hidden";	
username.style.pointerEvents = "none";
username.style.padding = "0px";
username.style.margin = "0px";
username.style.lineHeight = "0px";
username.style.appearance = "none";
username.style.whiteSpace = "nowrap";
username.style.position = "absolute"; 
// move input form off screen > wrapped element will be in canvas
username.style.left= "-999em";
username.style.display = 'block'; // block = show; none = hidden

const labelStyle = new TextStyle({
	fontFamily: "space",
	fontSize: 16,
	fill: "#6F5FCA",
	wordWrap: true,
	wordWrapWidth: 300,
	stroke: "#860000",
	strokeThickness: 1,
	// dropShadow: true,
	// dropShadowColor: "#000000",
	// dropShadowBlur: 4,
	// dropShadowAngle: Math.PI / 6,
	// dropShadowDistance: 6,
  });

let usernameLabel = new Text("USERNAME", labelStyle);
usernameLabel.x = 100;
usernameLabel.y = 80;
app.stage.addChild(usernameLabel);

// create wrapped element
let wrappedChatInput = new ElementWrapper(chatInput);
let wrappedUsername = new ElementWrapper(username);

wrappedChatInput.x = 25;
wrappedChatInput.y = 240;

wrappedUsername.x = 100;
wrappedUsername.y = 100;

// wait to add chatInput to scene
app.stage.addChild(wrappedChatInput);
app.stage.addChild(wrappedUsername);

/****************************
	END OF MOVE TO SETUP FXN > (everything that gets added to stage > add to proper stage plz)
******************************/

Loader.shared
		.add(['images/triangle.jpeg'])
		.add(['images/square.png'])
		.load(setup);

function setup() {
	triangle = new Sprite(
		Loader.shared.resources['images/triangle.jpeg'].texture
	);

	square = new Sprite(
		Loader.shared.resources['images/square.png'].texture
	);

	// triangle.position.set(300, 300);
	triangle.x = window.innerWidth / 2.5;
	triangle.y = window.innerHeight /  3;
	triangle.width = 200;
	triangle.height = 200;

	// triangle.position.set(300, 300);
	square.x = window.innerWidth / 2.5;
	square.y = window.innerHeight /  3;
	square.width = 200;
	square.height = 200;

	// Add the triangle to the stage
	// app.stage.addChild(triangle);

	startupScene = new Container();
	app.stage.addChild(startupScene);
	startupScene.visible = true;
	startupScene.addChild(triangle)

	gameScene = new Container();
	app.stage.addChild(gameScene);
	gameScene.visible = false;

	gameOverScene = new Container();
	app.stage.addChild(gameOverScene);
	gameOverScene.visible = false;

	app.ticker.add(loop);
}

let keys = []
let enter_cnt = 0;
let first_enter = true;
let previousMessageY;
let chatMessages = [];
let messageStepSize = 20;

document.body.onkeydown = function (e) {
	// console.log("onkeydown: ", e.code);
	keys[e.code] = true;
};
document.body.onkeyup = function (e) {
	// console.log("onkeyup: ", e.code);

	if (e.code == "Space") {
		app.stage.removeChild(usernameLabel);
		startupScene.removeChild(wrappedUsername);
		username.style.display = "none";
		startupScene.removeChild(triangle);
		startupScene.visible = false;
		gameScene.addChild(square)
		gameScene.visible = true;
	}

	if (e.code == "Enter") {
		if (enter_cnt == 0) {
			if (startupScene.visible) {
				username.style.display = "block";
				username.focus();
			} else if( gameScene.visible) {
				chatInput.style.display = "block";
				chatInput.focus();
			} else {

			}
		}
		if (enter_cnt >= 1) {
			if (startupScene.visible) {
				console.log("startupScene enter!")
			} else if(gameScene.visible) {
				chatInput.style.display = "none"; // leave this in for now > may help with performance if display is removed
				// blur removes focus > not needed if we set display to none, but leaving for now...
				chatInput.blur();
				chatInput.submit;
				var inputMessage = chatInput.value;
				chatInput.value = "";
			} else {

			}

			const style = new TextStyle({
				fontFamily: "space",
				fontSize: 12,
				fill: "#6F5FCA",
				wordWrap: true,
				wordWrapWidth: 300,
				// stroke: "#6F5FCA",
				// strokeThickness: 4,
				// dropShadow: true,
				// dropShadowColor: "#000000",
				// dropShadowBlur: 4,
				// dropShadowAngle: Math.PI / 6,
				// dropShadowDistance: 6,
			  });
			
			const message = new Text(inputMessage, style);
			console.log("inputMessage: ", inputMessage);
			
			if (inputMessage != ""){
				chatMessages.push(message);
				app.stage.addChild(message);

				if (first_enter) {
					message.y = wrappedChatInput.y - 200;
					previousMessageY = message.y
					console.log("message.y: ", message.y);
					first_enter = false;
				}
	
				message.x = 25;
				console.log(message.width);
				message.y = previousMessageY + (messageStepSize * Math.ceil(message.width / 300));
				previousMessageY = message.y;
				console.log("message.y: ", message.y, ", previousMessageY: ", previousMessageY);

				if (message.y >= wrappedChatInput.y - messageStepSize) {
					app.stage.removeChild(chatMessages[0]);
					previousMessageY -= messageStepSize;
					app.renderer.render(app.stage);
					chatMessages.shift();
					console.log("chatMessages: ", chatMessages)
					for (var i = 0; i < chatMessages.length; i++) {
						chatMessages[i].y -= messageStepSize;
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