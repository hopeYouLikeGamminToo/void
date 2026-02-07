// Visual effects for void game
// Handles particle effects, flashes, and visual feedback

import { Graphics, Container } from './libs/pixi.mjs';

export class VFXManager {
    constructor(app, stage) {
        this.app = app;
        this.stage = stage;
        this.container = new Container();
        this.stage.addChild(this.container);
        
        this.effects = [];
    }

    // Create a hit effect at a position
    createHitEffect(x, y, attackType) {
        const effect = new Graphics();
        
        // Color based on attack type
        const colors = {
            'light': 0xffff00,   // Yellow
            'heavy': 0xff6600,   // Orange
            'special': 0xff0000  // Red
        };
        
        const color = colors[attackType] || colors['light'];
        const size = attackType === 'special' ? 40 : attackType === 'heavy' ? 30 : 20;
        
        // Draw starburst effect
        effect.beginFill(color, 0.8);
        effect.drawStar(0, 0, 8, size, size * 0.5);
        effect.endFill();
        
        effect.x = x;
        effect.y = y;
        effect.scale.set(0.1);
        
        this.container.addChild(effect);
        
        // Add to effects list with animation data
        this.effects.push({
            graphic: effect,
            frame: 0,
            maxFrame: 15,
            type: 'hit'
        });
    }

    // Create a damage number that floats up
    createDamageNumber(x, y, damage) {
        const Text = this.app.loader.resources ? 
            require('./libs/pixi.mjs').Text : 
            window.PIXI.Text;
        
        // We'll skip text for now to avoid import issues
        // Just create a simple circle effect instead
        const effect = new Graphics();
        effect.beginFill(0xff0000, 0.8);
        effect.drawCircle(0, 0, 5);
        effect.endFill();
        
        effect.x = x;
        effect.y = y;
        
        this.container.addChild(effect);
        
        this.effects.push({
            graphic: effect,
            frame: 0,
            maxFrame: 30,
            type: 'number',
            velocityY: -2
        });
    }

    // Update all active effects
    update() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.frame++;
            
            if (effect.type === 'hit') {
                // Scale up then fade out
                const progress = effect.frame / effect.maxFrame;
                if (progress < 0.3) {
                    effect.graphic.scale.set(progress * 3);
                    effect.graphic.alpha = 1;
                } else {
                    effect.graphic.alpha = 1 - ((progress - 0.3) / 0.7);
                }
            } else if (effect.type === 'number') {
                // Float up and fade
                effect.graphic.y += effect.velocityY;
                effect.graphic.alpha = 1 - (effect.frame / effect.maxFrame);
            }
            
            // Remove completed effects
            if (effect.frame >= effect.maxFrame) {
                this.container.removeChild(effect.graphic);
                effect.graphic.destroy();
                this.effects.splice(i, 1);
            }
        }
    }

    // Clear all effects
    clear() {
        this.effects.forEach(effect => {
            this.container.removeChild(effect.graphic);
            effect.graphic.destroy();
        });
        this.effects = [];
    }
}
