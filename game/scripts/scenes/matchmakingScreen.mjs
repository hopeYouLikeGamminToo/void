// Matchmaking Lobby - Wait for opponent and ready up
import { BaseScene } from '../sceneManager.mjs';
import { Container, Text, Graphics } from '../libs/pixi.mjs';
import { playerList, sendToServer } from '../client.mjs';

export class MatchmakingScreen extends BaseScene {
    constructor(app, container, sceneManager) {
        super(app, container);
        this.sceneManager = sceneManager;
        this.isReady = false;
        this.countdown = 0;
        this.countdownActive = false;
    }

    async init() {
        if (this.initialized) return;
        await super.init();

        // Title
        const title = new Text('MATCHMAKING', {
            fontFamily: 'Arial',
            fontSize: 56,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x9A8FD9,
            strokeThickness: 4
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 100;
        this.container.addChild(title);

        // Status text
        this.statusText = new Text('Waiting for opponent...', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xaaaaaa,
            align: 'center'
        });
        this.statusText.anchor.set(0.5);
        this.statusText.x = this.app.screen.width / 2;
        this.statusText.y = 200;
        this.container.addChild(this.statusText);

        // Player list
        this.playerListText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xcccccc,
            align: 'left'
        });
        this.playerListText.x = this.app.screen.width / 2 - 200;
        this.playerListText.y = 300;
        this.container.addChild(this.playerListText);

        // Ready button
        this.readyButton = this.createButton('READY', 
            this.app.screen.width / 2 - 100, 
            this.app.screen.height - 200,
            () => this.toggleReady());
        this.container.addChild(this.readyButton);

        // Cancel button
        this.cancelButton = this.createButton('CANCEL',
            this.app.screen.width / 2 - 100,
            this.app.screen.height - 120,
            () => this.cancel());
        this.container.addChild(this.cancelButton);

        // Countdown text
        this.countdownText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0x00ff00,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 6
        });
        this.countdownText.anchor.set(0.5);
        this.countdownText.x = this.app.screen.width / 2;
        this.countdownText.y = this.app.screen.height / 2;
        this.countdownText.visible = false;
        this.container.addChild(this.countdownText);

        // Setup update loop
        this.updateFunc = this.update.bind(this);
        this.app.ticker.add(this.updateFunc);

        // Setup input
        this.setupInputHandlers();
    }

    createButton(text, x, y, action) {
        const button = new Container();

        // Background
        const bg = new Graphics();
        bg.beginFill(0x9A8FD9);
        bg.drawRoundedRect(0, 0, 200, 50, 10);
        bg.endFill();
        button.addChild(bg);
        button.bg = bg;

        // Text
        const buttonText = new Text(text, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 100;
        buttonText.y = 25;
        button.addChild(buttonText);
        button.text = buttonText;

        button.x = x;
        button.y = y;
        button.action = action;

        // Make interactive
        button.interactive = true;
        button.buttonMode = true;
        button.on('pointerover', () => {
            bg.clear();
            bg.beginFill(0xB0A0E9);
            bg.drawRoundedRect(0, 0, 200, 50, 10);
            bg.endFill();
        });
        button.on('pointerout', () => {
            bg.clear();
            bg.beginFill(0x9A8FD9);
            bg.drawRoundedRect(0, 0, 200, 50, 10);
            bg.endFill();
        });
        button.on('pointerdown', () => {
            if (action) action();
        });

        return button;
    }

    setupInputHandlers() {
        this.keyHandler = (e) => {
            if (!this.isVisible) return;

            switch (e.key) {
                case 'r':
                case 'R':
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    if (!this.countdownActive) {
                        this.toggleReady();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (!this.countdownActive) {
                        this.cancel();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    toggleReady() {
        this.isReady = !this.isReady;
        
        // Update button text
        if (this.readyButton && this.readyButton.text) {
            this.readyButton.text.text = this.isReady ? 'NOT READY' : 'READY';
        }

        // Send ready state to server
        const msg = {
            type: 'ready',
            username: this.data.userInfo?.username,
            isReady: this.isReady,
            character: this.data.character
        };
        sendToServer(msg);

        console.log('[Matchmaking] Ready state:', this.isReady);
    }

    cancel() {
        console.log('[Matchmaking] Cancelled');
        this.sceneManager.goBack();
    }

    update(delta) {
        if (!this.isVisible) return;

        // Update player list display
        this.updatePlayerList();

        // Check if we should start countdown
        if (playerList.length >= 2 && this.isReady && !this.countdownActive) {
            // Check if other players are ready (simplified - assume they are)
            this.startCountdown();
        }

        // Update countdown
        if (this.countdownActive) {
            this.updateCountdown(delta);
        }
    }

    updatePlayerList() {
        if (!this.playerListText) return;

        let text = 'Players in lobby:\n\n';
        playerList.forEach((username, index) => {
            const prefix = username === this.data.userInfo?.username ? '> ' : '  ';
            const readyStatus = this.isReady && username === this.data.userInfo?.username ? ' [READY]' : '';
            text += `${prefix}${username}${readyStatus}\n`;
        });

        this.playerListText.text = text;

        // Update status
        if (this.statusText) {
            if (playerList.length < 2) {
                this.statusText.text = 'Waiting for opponent...';
            } else if (!this.isReady) {
                this.statusText.text = 'Press READY when you\'re set!';
            } else {
                this.statusText.text = 'Waiting for opponent to ready up...';
            }
        }
    }

    startCountdown() {
        this.countdownActive = true;
        this.countdown = 3;
        this.countdownText.visible = true;
        this.countdownStartTime = Date.now();
        console.log('[Matchmaking] Starting countdown...');
    }

    updateCountdown(delta) {
        const elapsed = Date.now() - this.countdownStartTime;
        const secondsElapsed = Math.floor(elapsed / 1000);
        const remaining = Math.max(0, 3 - secondsElapsed);

        if (this.countdownText) {
            if (remaining > 0) {
                this.countdownText.text = remaining.toString();
            } else {
                this.countdownText.text = 'FIGHT!';
                
                // Start game after brief delay
                setTimeout(() => {
                    this.startGame();
                }, 500);
            }
        }
    }

    startGame() {
        console.log('[Matchmaking] Starting game!');
        
        // Transition to game screen
        this.sceneManager.showScene('game', {
            userInfo: this.data.userInfo,
            character: this.data.character
        }, false); // Don't add to stack - can't go back from game
    }

    onShow(data) {
        this.isReady = false;
        this.countdownActive = false;
        this.countdownText.visible = false;
        
        if (this.readyButton && this.readyButton.text) {
            this.readyButton.text.text = 'READY';
        }

        // Send initial join message to trigger userlist update
        const msg = {
            type: 'game',
            username: data.userInfo?.username || 'Player',
            ts: Date.now(),
            character: data.character || 'kraken',
            x: 0,
            y: 0,
            animation: null,
            playerCount: 0
        };
        sendToServer(msg);
        
        console.log('[Matchmaking] Joined lobby, requesting player list');
    }

    onHide() {
        this.isReady = false;
        this.countdownActive = false;
    }

    cleanup() {
        if (this.updateFunc) {
            this.app.ticker.remove(this.updateFunc);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        super.cleanup();
    }
}
