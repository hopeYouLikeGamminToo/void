// Splash Screen - Initial branding/logo screen
import { BaseScene } from '../sceneManager.mjs';
import { Container, Text, Graphics } from '../libs/pixi.mjs';

export class SplashScreen extends BaseScene {
    constructor(app, container) {
        super(app, container);
        this.duration = 2500; // 2.5 seconds
        this.startTime = 0;
    }

    async init() {
        if (this.initialized) return;
        await super.init();

        // Create centered logo/title
        const title = new Text('VOID', {
            fontFamily: 'Arial',
            fontSize: 120,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x9A8FD9,
            strokeThickness: 6,
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 10,
            dropShadowDistance: 5
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = this.app.screen.height / 2 - 50;
        this.container.addChild(title);
        this.title = title;

        // Subtitle
        const subtitle = new Text('A Multiplayer Fighting Game', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xaaaaaa,
            align: 'center'
        });
        subtitle.anchor.set(0.5);
        subtitle.x = this.app.screen.width / 2;
        subtitle.y = this.app.screen.height / 2 + 60;
        this.container.addChild(subtitle);

        // Loading indicator
        const loadingText = new Text('Loading...', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x9A8FD9
        });
        loadingText.anchor.set(0.5);
        loadingText.x = this.app.screen.width / 2;
        loadingText.y = this.app.screen.height - 100;
        this.container.addChild(loadingText);
        this.loadingText = loadingText;

        // Add pulsing animation ticker
        this.animateFunc = this.animate.bind(this);
        this.app.ticker.add(this.animateFunc);
    }

    onShow(data) {
        this.startTime = Date.now();
        this.title.alpha = 0;
        
        // Fade in animation
        const fadeIn = () => {
            this.title.alpha += 0.05;
            if (this.title.alpha < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        fadeIn();

        // Auto-transition after duration
        setTimeout(() => {
            if (this.isVisible && data.onComplete) {
                data.onComplete();
            }
        }, this.duration);
    }

    animate(delta) {
        if (!this.isVisible) return;
        
        // Pulse loading text
        if (this.loadingText) {
            const time = Date.now() / 500;
            this.loadingText.alpha = 0.5 + Math.sin(time) * 0.5;
        }
    }

    onHide() {
        // Fade out
        if (this.title) {
            this.title.alpha = 0;
        }
        
        // Remove ticker to prevent memory leaks
        if (this.animateFunc) {
            this.app.ticker.remove(this.animateFunc);
        }
    }

    cleanup() {
        if (this.animateFunc) {
            this.app.ticker.remove(this.animateFunc);
        }
        super.cleanup();
    }
}
