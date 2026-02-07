// Player class for void game
import { AnimatedSprite, Container, Sprite, Texture } from './libs/pixi.mjs';
import { engine, World, Bodies, Vector } from './physics.mjs';

// Constants
const DEFAULT_ATTACK_DURATION = 12;

export class Player {
    constructor(app, stage, username, character) {
        if (username != null) {
            console.log(`assigning ${character} to ${username}`);
        }

        let sprite;
        let resources = app.loader.resources;
        switch (character) {
            case "kraken":
                sprite = new MultiAnimatedSprite(resources.kraken.spritesheet);
                break;
            case "spaceman":
                sprite = new MultiAnimatedSprite(resources.spaceman.spritesheet);
                break;
            case "glonky":
                sprite = new MultiAnimatedSprite(resources.glonky.spritesheet);
                break;
            case "void":
                sprite = new MultiAnimatedSprite(resources.void.spritesheet);
                // texture = Texture.from("./assets/void.gif");
                break;
            default:
                console.log("character not available!")
                break;
        }

        // super(player);
        // would be nice to use super here...
        // need to figure out how to extend player class
        this.sprite = sprite;

        if  (character != "void") {
            this.body = Bodies.circle(
                250 - (this.sprite.width / 2),
                250 - (this.sprite.width / 2),
                this.sprite.width / 2,
                // this.sprite.height,
                {
                    // isSensor: false,
                    density: 1.078,
                    frictionAir: 0.75,
                    friction: 2,
                    frictionStatic: 2,
                    restitution: 0, 
                    mass: 30,
                    // damping: 5,
                    // gravityScale: 2  // Set the gravity scale to a non-zero value to enable the sprite to be affected by gravity
                }
            );
            World.addBody(engine.world, this.body);
            console.log("player.body: ", this.body);
            console.log("engine: ", engine);
        }

        this.username = username;
        this.password = null;
        this.remember = null;
        this.character = character;
        this.stage = stage;
        // this._resources = resources;

        // Combat stats
        this.maxHealth = 150;
        this.health = 150;
        this.damagePercent = 0; // Smash-style damage percentage
        this.isOffStage = false;
        
        // Character-specific stats (will vary by character)
        this.stats = this.getCharacterStats(character);
        this.speed = this.stats.speed;
        this.jumpPower = this.stats.jumpPower;
        this.weight = this.stats.weight;
        this.attackPower = this.stats.attackPower;
        
        // Movement vectors
        this.run_right = Vector.create(this.speed * 0.6, 0);
        this.run_left = Vector.create(-this.speed * 0.6, 0);
        this.jump = Vector.create(0, -this.jumpPower * 1.2);

        this.movement = "";
        
        // Attack state
        this.isAttacking = false;
        this.attackType = null;
        this.attackFrame = 0;

        this.stage.addChild(this.sprite);
    }

    // Get character-specific stats
    getCharacterStats(character) {
        const stats = {
            'kraken': {
                speed: 1.0,
                jumpPower: 1.0,
                weight: 105,    // Heavy, harder to knock back
                attackPower: 1.2 // Strong attacks
            },
            'spaceman': {
                speed: 1.15,    // Increased speed
                jumpPower: 1.25, // Better jumps
                weight: 85,      // Light, easier to knock back
                attackPower: 0.95 // Weaker attacks
            },
            'glonky': {
                speed: 0.95,    // Slower
                jumpPower: 0.9,  // Lower jumps
                weight: 115,     // Heaviest
                attackPower: 1.35 // Strongest attacks
            },
            'void': {
                speed: 1.25,    // Fastest
                jumpPower: 1.15,
                weight: 80,      // Lightest
                attackPower: 0.9  // Weakest attacks
            }
        };
        
        return stats[character] || stats['kraken'];
    }

    // Start an attack
    startAttack(attackType) {
        if (this.isAttacking) return false;
        
        this.isAttacking = true;
        this.attackType = attackType;
        this.attackFrame = 0;
        
        return true;
    }

    // Update attack state
    updateAttack() {
        if (!this.isAttacking) return;
        
        this.attackFrame++;
        
        // End attack after duration (matching AttackHitboxes)
        const attackDurations = {
            'light': 12,
            'heavy': 20,
            'special': 25
        };
        
        const duration = attackDurations[this.attackType] || DEFAULT_ATTACK_DURATION;
        if (this.attackFrame >= duration) {
            this.isAttacking = false;
            this.attackType = null;
            this.attackFrame = 0;
        }
    }

    position(x, y) {
        this.sprite.x = x - (this.sprite.width / 2);
        this.sprite.y = y - (this.sprite.height / 2);

        if (this.body) {
            console.log("this.body.getGlobalPosition(): ", this.body.getGlobalPosition());
            this.body.position = this.sprite.position;
        }
    }

}

// may want to just organize assets to load spritesheets with default pixijs AnimatedSprite
// https://pixijs.download/dev/docs/PIXI.AnimatedSprite.html

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

// create multi - PIXI.AnimatedSprite (spritesheet)
// took this from stackoverlow > may want to spend the time to re-write
// the read-ability of this is atrocious > optimization in order
var MultiAnimatedSprite = /** @class */ (function (_super) {
    __extends(MultiAnimatedSprite, _super);
    function MultiAnimatedSprite(spritesheet) {
        var _this = _super.call(this) || this;
        _this.spritesheet = spritesheet;
        // console.log("spritesheet: ", spritesheet);
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
            this.sprite = new AnimatedSprite(textures);
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
}(Container));
