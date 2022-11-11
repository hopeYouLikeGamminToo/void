<p float="left">
  <img src="./game/assets/glonky/glonky-headshot-transparent.png" width="15%" />
  <img src="./game/assets/void/void.gif" width="35%" /> 
  <img src="./game/assets/kraken/kraken-headshot-transparent.png" width="20%" />
</p>

&nbsp;

NOTICE: <br/>
There is an issue when adding multiple players & serving with tea <br/>
please continue to use node/vscode live server until the tea bug is fixed. <br/>
`node server.js` <br/>
`vscode live server > index.html`

## Gettings Started
Install tea: <br/>
`sh <(curl tea.xyz)` <br/>

Note: If you do not wish to install tea you can replace `sh <(curl tea.xyz)` for every instance of `tea` below. If tea is already installed, it uses it, if not it *doesn’t* install tea, a temporary sandbox is created. <br/> 

Navigate to the game directory: <br/>
`cd tea-game`

Install npm package dependencies: <br/>
`tea -X npm install websocket pixi-text-input -webrtc-adapter`

Start signaling server: <br/>
`tea scripts/server.js`

In another terminal start the game: <br/>
`tea -X npx --yes browser-sync start --server`

Note: WSL2 users should execute the wsl.sh script from their wsl terminal before starting the signaling server. This shell script will automate changing the hostname in client.mjs to your wsl terminal ip address. <br/>
