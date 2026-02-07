// Game state manager for void
// Handles game flow, restart, and win/lose screens

import { Container, Graphics, Text } from './libs/pixi.mjs';

export class GameStateManager {
    constructor(app, stage) {
        this.app = app;
        this.stage = stage;
        this.state = 'waiting'; // waiting, playing, ended
        
        this.winScreen = null;
        this.createWinScreen();
    }

    createWinScreen() {
        this.winScreen = new Container();
        this.winScreen.visible = false;
        this.stage.addChild(this.winScreen);
        
        // Semi-transparent overlay
        const overlay = new Graphics();
        overlay.beginFill(0x000000, 0.7);
        overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.endFill();
        this.winScreen.addChild(overlay);
        
        // Winner text
        this.winnerText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 6
        });
        this.winnerText.anchor.set(0.5);
        this.winnerText.x = this.app.screen.width / 2;
        this.winnerText.y = this.app.screen.height / 2 - 50;
        this.winScreen.addChild(this.winnerText);
        
        // Restart instructions
        const restartText = new Text('Press R to Restart', {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xaaaaaa
        });
        restartText.anchor.set(0.5);
        restartText.x = this.app.screen.width / 2;
        restartText.y = this.app.screen.height / 2 + 50;
        this.winScreen.addChild(restartText);
    }

    setState(state) {
        this.state = state;
    }

    getState() {
        return this.state;
    }

    showWinScreen(winner) {
        if (winner) {
            this.winnerText.text = `${winner.username} WINS!`;
            this.winnerText.style.fill = 0x00ff00;
        } else {
            this.winnerText.text = 'DRAW!';
            this.winnerText.style.fill = 0xffaa00;
        }
        
        this.winScreen.visible = true;
        this.state = 'ended';
    }

    hideWinScreen() {
        this.winScreen.visible = false;
    }

    // Reset game state for restart
    resetGame(players) {
        this.hideWinScreen();
        this.state = 'playing';
        
        // Reset all players
        players.forEach(player => {
            player.health = player.maxHealth;
            player.damagePercent = 0;
            player.isOffStage = false;
            player.isAttacking = false;
            player.attackType = null;
            player.attackFrame = 0;
            
            // Reset position
            if (player.body) {
                player.body.position.x = 250;
                player.body.position.y = 250;
                player.body.velocity.x = 0;
                player.body.velocity.y = 0;
                player.body.angularVelocity = 0;
                player.body.angle = 0;
            }
        });
        
        return true;
    }
}
