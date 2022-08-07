// Get our hostname
var myHostname = window.location.hostname;
if (!myHostname) {
    myHostname = "localhost";
}
log("Hostname: " + myHostname);

// WebSocket chat/signaling channel variables.
var connection = null;
var clientID = 0;

// The media constraints object describes what sort of stream we want
// to request from the local A/V hardware (typically a webcam and
// microphone). Here, we specify only that we want both audio and
// video; however, you can be more specific. It's possible to state
// that you would prefer (or require) specific resolutions of video,
// whether to prefer the user-facing or rear-facing camera (if available),
// and so on.
//
// See also:
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
//
var mediaConstraints = {
    audio: true,            // We want an audio track
    video: {
        aspectRatio: {
            ideal: 1.333333     // 3:2 aspect is preferred
        }
    }
};

var username = null;
var character = null;
var targetUsername = null;      // To store username of other peer
var myPeerConnection = null;    // RTCPeerConnection
var transceiver = null;         // RTCRtpTransceiver
var webcamStream = null;        // MediaStream from webcam

document.getElementById("connect").addEventListener("click", connect, true);
document.getElementById("send").addEventListener("click", handleSendButton, true);
document.getElementById("text").addEventListener("keyup", handleKey, true);
document.getElementById("hangup-button").addEventListener("click", hangUpCall, true);

// Output logging information to console.
function log(text) {
    var time = new Date();

    console.log("[" + time.toLocaleTimeString() + "] " + text);
}

// Output an error message to console.
function log_error(text) {
    var time = new Date();

    console.trace("[" + time.toLocaleTimeString() + "] " + text);
}

// Send a JavaScript object by converting it to JSON and sending
// it as a message on the WebSocket connection.

function sendToServer(msg) {
    var msgJSON = JSON.stringify(msg);

    log("Sending '" + msg.type + "' message: " + msgJSON);
    connection.send(msgJSON);
}

// Called when the "id" message is received; this message is sent by the
// server to assign this login session a unique ID number; in response,
// this function sends a "username" message to set our username for this
// session.
function setUsername() {
    username = document.getElementById("name").value;
    console.log("username: ", username)

    // const characters = ["kraken", "spaceman"];
    // const randomCharacter = Math.floor(Math.random() * characters.length);
    // character = characters[randomCharacter];
    // console.log("random character: ", character);


    console.log("'kraken' in app.lodaer.resources: ", ("kraken" in app.loader.resources))
    if ("kraken" in app.loader.resources) {
        character = "spaceman";
    } else {
        character = "kraken";
    }

    app.loader
    .use(function (resource, next) {
        if (resource.extension === 'json' && resource.data.meta.app === 'http://www.aseprite.org/') {
            for (var _i = 0, _a = resource.data.meta.frameTags; _i < _a.length; _i++) {
                var tag = _a[_i];
                var frames = [];
                for (var i = tag.from; i < tag.to; i++) {
                    frames.push({ texture: resource.textures[i], time: resource.data.frames[i].duration });
                }
                if (tag.direction === 'pingpong') {
                    for (var i = tag.to; i >= tag.from; i--) {
                        frames.push({ texture: resource.textures[i], time: resource.data.frames[i].duration });
                    }
                }
                resource.spritesheet.animations[tag.name] = frames;
            }
        }
        next();
    })
    .add(character, character + ".json").load(setup);

    sendToServer({
        name: username,
        date: Date.now(),
        id: clientID,
        type: "username"
    });
}

// Open and configure the connection to the WebSocket server.
function connect() {
    var serverUrl;
    var scheme = "ws";

    // If this is an HTTPS connection, we have to use a secure WebSocket
    // connection too, so add another "s" to the scheme.
    if (document.location.protocol === "https:") {
        scheme += "s";
    }
    serverUrl = scheme + "://" + myHostname + ":6503";

    log(`Connecting to server: ${serverUrl}`);
    connection = new WebSocket(serverUrl, "json");

    connection.onopen = function (evt) {
        document.getElementById("text").disabled = false;
        document.getElementById("send").disabled = false;
    };

    connection.onerror = function (evt) {
        console.dir(evt);
    }

    connection.onmessage = function (evt) {
        var chatBox = document.querySelector(".chatbox");
        var text = "";
        var msg = JSON.parse(evt.data);
        log("Message received: ");
        console.dir(msg);
        var time = new Date(msg.date);
        var timeStr = time.toLocaleTimeString();

        switch (msg.type) {
            case "id":
                clientID = msg.id;
                setUsername();
                break;

            case "username":
                text = "<b>User <em>" + msg.name + "</em> signed in at " + timeStr + "</b><br>";
                break;

            case "message":
                text = "(" + timeStr + ") <b>" + msg.name + "</b>: " + msg.text + "<br>";
                break;

            case "rejectusername":
                username = msg.name;
                text = "<b>Your username has been set to <em>" + username +
                    "</em> because the name you chose is in use.</b><br>";
                break;

            case "userlist":      // Received an updated user list
                handleUserlistMsg(msg);
                break;

            // Signaling messages: these messages are used to trade WebRTC
            // signaling information during negotiations leading up to a video
            // call.
            case "video-offer":  // Invitation and offer to chat
                handleVideoOfferMsg(msg);
                break;

            case "video-answer":  // Callee has answered our offer
                handleVideoAnswerMsg(msg);
                break;

            case "new-ice-candidate": // A new ICE candidate has been received
                handleNewICECandidateMsg(msg);
                break;

            case "hang-up": // The other peer has hung up the call
                handleHangUpMsg(msg);
                break;

            // Unknown message; output to console for debugging.

            default:
                log_error("Unknown message received:");
                log_error(msg);
        }

        // If there's text to insert into the chat buffer, do so now, then
        // scroll the chat panel so that the new text is visible.
        if (text.length) {
            chatBox.innerHTML += text;
            chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
        }
    };
}

// Handles a click on the Send button (or pressing return/enter) by
// building a "message" object and sending it to the server.
function handleSendButton() {
    var msg = {
        text: document.getElementById("text").value,
        type: "message",
        id: clientID,
        date: Date.now()
    };
    sendToServer(msg);
    document.getElementById("text").value = "";
}

// Handler for keyboard events. This is used to intercept the return and
// enter keys so that we can call send() to transmit the entered text
// to the server.
function handleKey(evt) {
    console.log("evt.keyCode: ", evt.keyCode);
    if (evt.keyCode === 13 || evt.keyCode === 14) {
        if (!document.getElementById("send").disabled) {
            handleSendButton();
        }
    }
}

// Create the RTCPeerConnection which knows how to talk to our
// selected STUN/TURN server and then uses getUserMedia() to find
// our camera and microphone and add that stream to the connection for
// use in our video call. Then we configure event handlers to get
// needed notifications on the call.

async function createPeerConnection() {
    log("Setting up a connection...");

    // Create an RTCPeerConnection which knows to use our chosen
    // STUN server.

    myPeerConnection = new RTCPeerConnection({
        iceServers: [     // Information about ICE servers - Use your own!
            {
                urls: "turn:" + myHostname,  // A TURN server
                username: "webrtc",
                credential: "turnserver"
            }
        ]
    });

    // Set up event handlers for the ICE negotiation process.

    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.ontrack = handleTrackEvent;
}

// Called by the WebRTC layer to let us know when it's time to
// begin, resume, or restart ICE negotiation.
async function handleNegotiationNeededEvent() {
    log("*** Negotiation needed");

    try {
        log("---> Creating offer");
        const offer = await myPeerConnection.createOffer();

        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.
        if (myPeerConnection.signalingState != "stable") {
            log("     -- The connection isn't stable yet; postponing...")
            return;
        }

        // Establish the offer as the local peer's current
        // description.
        log("---> Setting local description to the offer");
        await myPeerConnection.setLocalDescription(offer);

        // Send the offer to the remote peer.
        log("---> Sending the offer to the remote peer");
        sendToServer({
            name: username,
            target: targetUsername,
            type: "video-offer",
            sdp: myPeerConnection.localDescription
        });
    } catch (err) {
        log("*** The following error occurred while handling the negotiationneeded event:");
        reportError(err);
    };
}

// Called by the WebRTC layer when events occur on the media tracks
// on our WebRTC call. This includes when streams are added to and
// removed from the call.
//
// track events include the following fields:
//
// RTCRtpReceiver       receiver
// MediaStreamTrack     track
// MediaStream[]        streams
// RTCRtpTransceiver    transceiver
//
// In our case, we're just taking the first stream found and attaching
// it to the <video> element for incoming media.
function handleTrackEvent(event) {
    log("*** Track event");
    document.getElementById("received_video").srcObject = event.streams[0];
    document.getElementById("hangup-button").disabled = false;
}

// Handles |icecandidate| events by forwarding the specified
// ICE candidate (created by our local ICE agent) to the other
// peer through the signaling server.
function handleICECandidateEvent(event) {
    if (event.candidate) {
        log("*** Outgoing ICE candidate: " + event.candidate.candidate);

        sendToServer({
            type: "new-ice-candidate",
            target: targetUsername,
            candidate: event.candidate
        });
    }
}

// Handle |iceconnectionstatechange| events. This will detect
// when the ICE connection is closed, failed, or disconnected.
//
// This is called when the state of the ICE agent changes.
function handleICEConnectionStateChangeEvent(event) {
    log("*** ICE connection state changed to " + myPeerConnection.iceConnectionState);

    switch (myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
        case "disconnected":
            closeVideoCall();
            break;
    }
}

// Set up a |signalingstatechange| event handler. This will detect when
// the signaling connection is closed.
//
// NOTE: This will actually move to the new RTCPeerConnectionState enum
// returned in the property RTCPeerConnection.connectionState when
// browsers catch up with the latest version of the specification!
function handleSignalingStateChangeEvent(event) {
    log("*** WebRTC signaling state changed to: " + myPeerConnection.signalingState);
    switch (myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
}

// Handle the |icegatheringstatechange| event. This lets us know what the
// ICE engine is currently working on: "new" means no networking has happened
// yet, "gathering" means the ICE engine is currently gathering candidates,
// and "complete" means gathering is complete. Note that the engine can
// alternate between "gathering" and "complete" repeatedly as needs and
// circumstances change.
//
// We don't need to do anything when this happens, but we log it to the
// console so you can see what's going on when playing with the sample.
function handleICEGatheringStateChangeEvent(event) {
    log("*** ICE gathering state changed to: " + myPeerConnection.iceGatheringState);
}

// Given a message containing a list of usernames, this function
// populates the user list box with those names, making each item
// clickable to allow starting a video call.
function handleUserlistMsg(msg) {
    var i;
    var listElem = document.querySelector(".userlistbox");

    // Remove all current list members. We could do this smarter,
    // by adding and updating users instead of rebuilding from
    // scratch but this will do for this sample.
    while (listElem.firstChild) {
        listElem.removeChild(listElem.firstChild);
    }

    // Add member names from the received list.
    msg.users.forEach(function (username) {
        var item = document.createElement("li");
        item.appendChild(document.createTextNode(username));
        item.addEventListener("click", invite, false);

        listElem.appendChild(item);
    });
}

// Close the RTCPeerConnection and reset variables so that the user can
// make or receive another call if they wish. This is called both
// when the user hangs up, the other user hangs up, or if a connection
// failure is detected.
function closeVideoCall() {
    var localVideo = document.getElementById("local_video");

    log("Closing the call");

    // Close the RTCPeerConnection
    if (myPeerConnection) {
        log("--> Closing the peer connection");

        // Disconnect all our event listeners; we don't want stray events
        // to interfere with the hangup while it's ongoing.
        myPeerConnection.ontrack = null;
        myPeerConnection.onnicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnotificationneeded = null;

        // Stop all transceivers on the connection
        myPeerConnection.getTransceivers().forEach(transceiver => {
            transceiver.stop();
        });

        // Stop the webcam preview as well by pausing the <video>
        // element, then stopping each of the getUserMedia() tracks
        // on it.
        if (localVideo.srcObject) {
            localVideo.pause();
            localVideo.srcObject.getTracks().forEach(track => {
                track.stop();
            });
        }

        // Close the peer connection
        myPeerConnection.close();
        myPeerConnection = null;
        webcamStream = null;
    }

    // Disable the hangup button
    document.getElementById("hangup-button").disabled = true;
    targetUsername = null;
}

// Handle the "hang-up" message, which is sent if the other peer
// has hung up the call or otherwise disconnected.
function handleHangUpMsg(msg) {
    log("*** Received hang up notification from other peer");

    closeVideoCall();
}

// Hang up the call by closing our end of the connection, then
// sending a "hang-up" message to the other peer (keep in mind that
// the signaling is done on a different connection). This notifies
// the other peer that the connection should be terminated and the UI
// returned to the "no call in progress" state.
function hangUpCall() {
    closeVideoCall();

    sendToServer({
        name: username,
        target: targetUsername,
        type: "hang-up"
    });
}

// Handle a click on an item in the user list by inviting the clicked
// user to video chat. Note that we don't actually send a message to
// the callee here -- calling RTCPeerConnection.addTrack() issues
// a |notificationneeded| event, so we'll let our handler for that
// make the offer.
async function invite(evt) {
    log("Starting to prepare an invitation");
    if (myPeerConnection) {
        alert("You can't start a call because you already have one open!");
    } else {
        var clickedUsername = evt.target.textContent;

        // Don't allow users to call themselves, because weird.
        if (clickedUsername === username) {
            alert("I'm afraid I can't let you talk to yourself. That would be weird.");
            return;
        }

        // Record the username being called for future reference
        targetUsername = clickedUsername;
        log("Inviting user " + targetUsername);

        // Call createPeerConnection() to create the RTCPeerConnection.
        // When this returns, myPeerConnection is our RTCPeerConnection
        // and webcamStream is a stream coming from the camera. They are
        // not linked together in any way yet.
        log("Setting up connection to invite user: " + targetUsername);
        createPeerConnection();

        // Get access to the webcam stream and attach it to the
        // "preview" box (id "local_video").
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            document.getElementById("local_video").srcObject = webcamStream;
        } catch (err) {
            handleGetUserMediaError(err);
            return;
        }

        // Add the tracks from the stream to the RTCPeerConnection
        try {
            webcamStream.getTracks().forEach(
                transceiver = track => myPeerConnection.addTransceiver(track, { streams: [webcamStream] })
            );
        } catch (err) {
            handleGetUserMediaError(err);
        }
    }
}

// Accept an offer to video chat. We configure our local settings,
// create our RTCPeerConnection, get and attach our local camera
// stream, then create and send an answer to the caller.
async function handleVideoOfferMsg(msg) {
    targetUsername = msg.name;

    // If we're not already connected, create an RTCPeerConnection
    // to be linked to the caller.
    log("Received video chat offer from " + targetUsername);
    if (!myPeerConnection) {
        createPeerConnection();
    }

    // We need to set the remote description to the received SDP offer
    // so that our local WebRTC layer knows how to talk to the caller.
    var desc = new RTCSessionDescription(msg.sdp);

    // If the connection isn't stable yet, wait for it...
    if (myPeerConnection.signalingState != "stable") {
        log("  - But the signaling state isn't stable, so triggering rollback");

        // Set the local and remove descriptions for rollback; don't proceed
        // until both return.
        await Promise.all([
            myPeerConnection.setLocalDescription({ type: "rollback" }),
            myPeerConnection.setRemoteDescription(desc)
        ]);
        return;
    } else {
        log("  - Setting remote description");
        await myPeerConnection.setRemoteDescription(desc);
    }

    // Get the webcam stream if we don't already have it
    if (!webcamStream) {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        } catch (err) {
            handleGetUserMediaError(err);
            return;
        }

        document.getElementById("local_video").srcObject = webcamStream;

        // Add the camera stream to the RTCPeerConnection
        try {
            webcamStream.getTracks().forEach(
                transceiver = track => myPeerConnection.addTransceiver(track, { streams: [webcamStream] })
            );
        } catch (err) {
            handleGetUserMediaError(err);
        }
    }

    log("---> Creating and sending answer to caller");

    await myPeerConnection.setLocalDescription(await myPeerConnection.createAnswer());

    sendToServer({
        name: username,
        target: targetUsername,
        type: "video-answer",
        sdp: myPeerConnection.localDescription
    });
}

// Responds to the "video-answer" message sent to the caller
// once the callee has decided to accept our request to talk.
async function handleVideoAnswerMsg(msg) {
    log("*** Call recipient has accepted our call");

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    var desc = new RTCSessionDescription(msg.sdp);
    await myPeerConnection.setRemoteDescription(desc).catch(reportError);
}

// A new ICE candidate has been received from the other peer. Call
// RTCPeerConnection.addIceCandidate() to send it along to the
// local ICE framework.
async function handleNewICECandidateMsg(msg) {
    var candidate = new RTCIceCandidate(msg.candidate);

    log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
    try {
        await myPeerConnection.addIceCandidate(candidate)
    } catch (err) {
        reportError(err);
    }
}

// Handle errors which occur when trying to access the local media
// hardware; that is, exceptions thrown by getUserMedia(). The two most
// likely scenarios are that the user has no camera and/or microphone
// or that they declined to share their equipment when prompted. If
// they simply opted not to share their media, that's not really an
// error, so we won't present a message in that situation.
function handleGetUserMediaError(e) {
    log_error(e);
    switch (e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                "were found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            // Do nothing; this is the same as the user canceling the call.
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }

    // Make sure we shut down our end of the RTCPeerConnection so we're
    // ready to try again.
    closeVideoCall();
}

// Handles reporting errors. Currently, we just dump stuff to console but
// in a real-world application, an appropriate (and user-friendly)
// error message should be displayed.
function reportError(errMessage) {
    log_error(`Error ${errMessage.name}: ${errMessage.message}`);
}








/**************************************************************************************************************************************************************************/








// MultiAnimatedSprite needs extends to load spritesheet
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

import * as PIXI from "./pixi.mjs";

// Use the native window resolution as the default resolution
// will support high-density displays when rendering
PIXI.settings.RESOLUTION = window.devicePixelRatio;
// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var app = new PIXI.Application({
    // options
    autoResize: true,
    resizeTo: window,
    resolution: devicePixelRatio,
    width: window.outerWidth, // window.outerWidth,
    height: window.outerHeight, // window.outerHeight,
    backgroundColor: 0x000000,
    autoDensity: true
});

document.body.appendChild(app.view);

var MultiAnimatedSprite = /** @class */ (function (_super) {
    __extends(MultiAnimatedSprite, _super);
    function MultiAnimatedSprite(spritesheet) {
        var _this = _super.call(this) || this;
        _this.spritesheet = spritesheet;
        console.log("spritesheet: ", spritesheet);
        _this.scale.x = _this.scale.y = 1;
        var defaultAnimation = Object.keys(spritesheet.animations)[0];
        _this.setAnimation(defaultAnimation);
        return _this;
    }
    MultiAnimatedSprite.prototype.setAnimation = function (name) {
        if (this.currentAnimation === name)
            return;

        var textures = this.spritesheet.animations[name];
        if (!this.sprite) {
            this.sprite = new PIXI.AnimatedSprite(textures);
            this.addChild(this.sprite);
        }
        else {
            this.sprite.textures = textures;
        }
        this.sprite.animationSpeed = 0.22;
        this.sprite.play();
        this.currentAnimation = name;
    };
    return MultiAnimatedSprite;
}(PIXI.Container));

var state = {
    keys: {},
    player: null,
};

var mouse = {
    "x": 0,
    "y": 0,
    "angle": 0
}

var playerSpeed = 5;
var bullets = [];

function gameLoop() {
    updateBullets();

    if (input_type == "gamepad"){
        var gamepads = navigator.getGamepads();
        console.log(gamepads[0]);
        if (gamepads[0].buttons[7].value) {
            state.player.setAnimation('Shoot');
            console.log("shoot!");
            if (mouse.y > 400) {
                let bullet = new PIXI.Sprite(app.loader.resources.bullet.texture);
                // should read arm offsets from character json sprite sheet file here
                bullet.x = state.player.x + 140; // 155; // spaceman
                bullet.y = state.player.y + 115; // 130; // spaceman
                app.stage.addChild(bullet);
                bullets.push(bullet);
                delete state.keys["click"];
            } else {
                // console.log("clicked in chat");
            }
        } else if (gamepads[0].axes[0] < -0.10) {
            state.player.setAnimation('RunLeft');
            state.player.x -= playerSpeed * -1*gamepads[0].axes[0];
            console.log("run left!");
        } else if (gamepads[0].buttons[3].value || gamepads[0].axes[1] < -0.50) {
            state.player.setAnimation('Jump');
            // state.player.y -= playerSpeed;
            console.log("jump!");
        } else if (gamepads[0].axes[0] > 0.10) {
            state.player.setAnimation('RunRight');
            state.player.x += playerSpeed * gamepads[0].axes[0];
            console.log("run right!");
        } else if (gamepads[0].axes[1] > 0.50) {
            // if touching platform > duck, else accelerate
            state.player.setAnimation('Duck');
            // state.player.y += playerSpeed;
            console.log("duck!");
        } else {
            state.player.setAnimation('Idle');
        }
    }
    if (input_type == "keyboard") { // keyboard
        if (state.keys['click']) {
            state.player.setAnimation('Shoot');
            console.log("shoot!");
        } else if (state.keys['Space']) {
            // state.player.setAnimation('Jump');
            console.log("space!");
        } else if (state.keys["KeyA"]) {
            state.player.setAnimation('RunLeft');
            state.player.x -= playerSpeed;
            console.log("run left!");
        } else if (state.keys["KeyW"]) {
            state.player.setAnimation('Jump');
            // state.player.y -= playerSpeed;
            console.log("jump!");
        } else if (state.keys["KeyD"]) {
            state.player.setAnimation('RunRight');
            state.player.x += playerSpeed;
            console.log("run right!");
        } else if (state.keys["KeyS"]) {
            // if touching platform > duck, else accelerate
            state.player.setAnimation('Duck');
            // state.player.y += playerSpeed;
            console.log("duck!");
        } else {
            state.player.setAnimation('Idle');
        }
    }
}

function updateBullets() {
    let speed = 15;
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        bullet.x += Math.cos(mouse.angle * Math.PI / 180) * speed;
        bullet.y += Math.sin(mouse.angle * Math.PI / 180) * speed;
        if (bullet.y < 0) {
            app.stage.removeChild(bullet);
            bullets.splice(i, 1);
        }
    }
}

// preload assets
app.loader.baseUrl = 'assets';
app.loader.add("bullet", "bullet.png")
        .add("moon", "moon.json").load();

let input_type = "keyboard" // (keyboard/mouse, gampepad, touch)
configureInputHandlers();

function setup(loader, resources) {
    console.log(resources);

    // create player
    try{
        switch (character) {
            case "kraken":
                var player = state.player = new MultiAnimatedSprite(resources.kraken.spritesheet);
            case "spaceman":
                var player = state.player = new MultiAnimatedSprite(resources.spaceman.spritesheet);
            default:
                console.log("character not available!")
        }
    } catch {}
    player.x = app.view.width / 4;
    player.y = app.view.height / 4;

    app.stage.addChild(player);

    app.ticker.add(gameLoop);
}

function configureInputHandlers() {
    document.body.onkeydown = function (e) {
        console.log("onkeydown: ", e.code);
        state.keys[e.code] = true;
        if (e.code == "Space" && mouse.y > 400) {
            e.preventDefault(); // prevent spacebar scrolling
        }
    };
    document.body.onkeyup = function (e) {
        console.log("onkeyup: ", e.code);
        delete state.keys[e.code];
    };
    document.body.onmousedown = function (e) {
        console.log("onclick: ", e);

        mouse.x = e.x;
        mouse.y = e.y;
        mouse.angle = Math.atan2(mouse.y - state.player.y - 520, mouse.x - state.player.x) * 180 / Math.PI;

        if (mouse.y > 400) {
            state.keys["click"] = true;
            console.log("player {" + state.player.x + "," + state.player.y + "} " + "fires at {" + mouse.x + "," + mouse.y + "}");
        } else {
            console.log("clicked in chat");
        }
    };
    document.body.onmouseup = function (e) {
        // console.log("onmouseup: ", e);
        if (mouse.y > 400) {
            let bullet = new PIXI.Sprite(app.loader.resources.bullet.texture);
            // should read arm offsets from character json sprite sheet file here
            bullet.x = state.player.x + 140; // 155; // spaceman
            bullet.y = state.player.y + 115; // 130; // spaceman
            app.stage.addChild(bullet);
            bullets.push(bullet);
            delete state.keys["click"];
        } else {
            // console.log("clicked in chat");
        }
    };
    document.body.onmousemove = function (e) {
        mouse.x = e.x;
        mouse.y = e.y;
        // mouse.angle = Math.atan2(mouse.y - state.player.y - 470, mouse.x - state.player.x) * 180 / Math.PI; // - 145; + 115
    };
    window.addEventListener("gamepadconnected", function (e) {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id,
            e.gamepad.buttons.length, e.gamepad.axes.length);
        
        let switch_input = window.confirm("Switch input to gamepad?");
        if (switch_input) {
            input_type = "gamepad";
        } else {
            // input_type = "keyboard" // default
        }
    });
}