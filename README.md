### First Time Setup
>execute startup shell script: ./play/startup.sh<br/>
>OR<br/>
>npm install websocket<br/>
>npm install webrtc-adapter<br/>
>cp node_modules/webrtc-adapter/out/adapter.js .<br/>
>node server.js<br/>

### To Run From WSL2
>execute wsl.sh script from wsl terminal before starting signaling server<br/>
>wsl.sh will automate changing the hostname in client.mjs to your wsl terminal ip address<br/>
<img src="./play/assets/wsl2-ifconfig.png" width="30%"><br/>
<img src="./play/assets/wsl2-hostname.png" width="30%"><br/>

### Start Signaling Server
>node server.js<br/>

### Start Client
>use vscode live server on play/public/index.html

<img src="./play/assets/kraken-sketch.jpeg" width="40%">
<br/><br/>
<img src="./play/assets/aseprite/gifs/kraken.gif">