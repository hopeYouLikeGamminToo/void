import {Sprite, Texture} from './libs/pixi.mjs';

export class Player extends Sprite {
    constructor(username, character, stage) {
        console.log(`assigning ${username} to character ${character}`);
        
        let texture;
        switch (character) {
            case "title":
                texture = Texture.from("./images/void.png");
                break;
            case "kraken":
                // should maybe pull this path from a config file
                // path will be used in multiple scripts
                // & will be easier with a large number of characters
                texture = Texture.from("./images/kraken.png");
                break;
            default:
                console.log("invalid character");
        }

        super(texture);
        
        this._username = username;
        this._character = character;
        this._stage = stage;

        // future parameters...
        // this._characer = character;
        // this._health = 100;
        // this._position = position;
        // this._sprite = sprite;

        // this will be dependent on character, specials, wearables, armor, etc.
        // this.melee_strength = 10;
        // this.jump_height = 20;

        this.anchor.set(.5);
        this.scale.set(.5);
        stage.addChild(this);
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
}
 