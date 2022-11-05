import {AnimatedSprite, Container, Sprite, Texture} from './libs/pixi.mjs';

export class Player {
    constructor(app, stage, username, character) {
        if (username != null) {
            console.log(`assigning ${character} to ${username}`);
        }
        
        let sprite;
        let resources = app.loader.resources;
        switch (character) {
            case "kraken":
                sprite  = new MultiAnimatedSprite(resources.kraken.spritesheet);
                break;
            case "spaceman":
                sprite = new MultiAnimatedSprite(resources.spaceman.spritesheet);
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
        
        this.username = username;
        this.character = character;
        this.stage = stage;
        // this._resources = resources;

        // future parameters...
        // this._characer = character;
        // this._health = 100;
        // this._position = position;
        this.speed = 5;
        this.jump = 2;

        // this will be dependent on character, specials, wearables, armor, etc.
        // this.melee_strength = 10;
        // this.jump_height = 20;

        this.stage.addChild(this.sprite);
    }

    position(x, y) {
        this.sprite.x = x  - (this.sprite.width / 2);
        this.sprite.y = y - (this.sprite.height / 2);
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
 