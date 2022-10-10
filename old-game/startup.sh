#!/bin/sh
# Started this script from the MDN WebSocket chat server example code

npm install websocket
npm install pixi-text-input
npm install stats
npm install webrtc-adapter
cp node_modules/webrtc-adapter/out/adapter.js .

node server.js
