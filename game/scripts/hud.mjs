// HUD (Heads-Up Display) for void game
// Shows health bars, damage percent, and game status

import { Container, Graphics, Text } from './libs/pixi.mjs';

export class HUD {
    constructor(app, stage) {
        this.app = app;
        this.stage = stage;
        this.container = new Container();
        this.stage.addChild(this.container);
        
        // Player health displays
        this.player1Health = null;
        this.player2Health = null;
        this.player1HealthBg = null;
        this.player2HealthBg = null;
        this.player1Text = null;
        this.player2Text = null;
        this.player1PercentText = null;
        this.player2PercentText = null;
        
        // Game status
        this.statusText = null;
        
        this.createHealthBars();
        this.createStatusText();
    }

    createHealthBars() {
        const barWidth = 300;
        const barHeight = 30;
        const margin = 20;
        
        // Player 1 (left side)
        this.player1HealthBg = new Graphics();
        this.player1HealthBg.beginFill(0x333333);
        this.player1HealthBg.drawRoundedRect(0, 0, barWidth, barHeight, 5);
        this.player1HealthBg.endFill();
        this.player1HealthBg.x = margin;
        this.player1HealthBg.y = margin;
        this.container.addChild(this.player1HealthBg);
        
        this.player1Health = new Graphics();
        this.player1Health.beginFill(0x00ff00);
        this.player1Health.drawRoundedRect(0, 0, barWidth, barHeight, 5);
        this.player1Health.endFill();
        this.player1Health.x = margin;
        this.player1Health.y = margin;
        this.container.addChild(this.player1Health);
        
        this.player1Text = new Text('P1', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        this.player1Text.x = margin + 10;
        this.player1Text.y = margin + 5;
        this.container.addChild(this.player1Text);
        
        this.player1PercentText = new Text('0%', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffff00,
            fontWeight: 'bold'
        });
        this.player1PercentText.x = margin + 10;
        this.player1PercentText.y = margin + barHeight + 5;
        this.container.addChild(this.player1PercentText);
        
        // Player 2 (right side)
        const p2X = this.app.screen.width - barWidth - margin;
        
        this.player2HealthBg = new Graphics();
        this.player2HealthBg.beginFill(0x333333);
        this.player2HealthBg.drawRoundedRect(0, 0, barWidth, barHeight, 5);
        this.player2HealthBg.endFill();
        this.player2HealthBg.x = p2X;
        this.player2HealthBg.y = margin;
        this.container.addChild(this.player2HealthBg);
        
        this.player2Health = new Graphics();
        this.player2Health.beginFill(0x00ff00);
        this.player2Health.drawRoundedRect(0, 0, barWidth, barHeight, 5);
        this.player2Health.endFill();
        this.player2Health.x = p2X;
        this.player2Health.y = margin;
        this.container.addChild(this.player2Health);
        
        this.player2Text = new Text('P2', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        this.player2Text.x = p2X + barWidth - 40;
        this.player2Text.y = margin + 5;
        this.container.addChild(this.player2Text);
        
        this.player2PercentText = new Text('0%', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffff00,
            fontWeight: 'bold'
        });
        this.player2PercentText.x = p2X + barWidth - 60;
        this.player2PercentText.y = margin + barHeight + 5;
        this.container.addChild(this.player2PercentText);
    }

    createStatusText() {
        this.statusText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4
        });
        this.statusText.anchor.set(0.5);
        this.statusText.x = this.app.screen.width / 2;
        this.statusText.y = 100;
        this.container.addChild(this.statusText);
    }

    getHealthColor(healthPercent) {
        if (healthPercent < 0.25) return 0xff0000; // Red
        if (healthPercent < 0.5) return 0xffaa00;  // Yellow
        return 0x00ff00; // Green
    }

    updateHealth(player1, player2) {
        if (!player1 || !player2) return;
        
        const barWidth = 300;
        
        // Update Player 1
        const p1HealthPercent = Math.max(0, player1.health / player1.maxHealth);
        this.player1Health.clear();
        
        const p1Color = this.getHealthColor(p1HealthPercent);
        this.player1Health.beginFill(p1Color);
        this.player1Health.drawRoundedRect(0, 0, barWidth * p1HealthPercent, 30, 5);
        this.player1Health.endFill();
        
        this.player1PercentText.text = Math.floor(player1.damagePercent) + '%';
        
        // Update Player 2
        const p2HealthPercent = Math.max(0, player2.health / player2.maxHealth);
        this.player2Health.clear();
        
        const p2Color = this.getHealthColor(p2HealthPercent);
        this.player2Health.beginFill(p2Color);
        this.player2Health.drawRoundedRect(0, 0, barWidth * p2HealthPercent, 30, 5);
        this.player2Health.endFill();
        
        this.player2PercentText.text = Math.floor(player2.damagePercent) + '%';
    }

    showStatus(message) {
        this.statusText.text = message;
    }

    hideStatus() {
        this.statusText.text = '';
    }

    hide() {
        this.container.visible = false;
    }

    show() {
        this.container.visible = true;
    }
}
