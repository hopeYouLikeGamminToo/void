import { Loader, Sprite } from "./pixi.mjs";

export class Player extends Sprite {
    constructor(x=300, y=300, name="none", hp=100, speed=5) {
        super(Loader.shared.resources.spaceman.texture);
        this.position = {"x": x,"y": y};
        this.name = name;
        this.hp = hp;
        this.speed = speed;

        this.width = 122; // fixed
        this.height = 165; // fixed
    }

    status() {
        return {
            name: this.name,
            position: this.position,
            hp: this.hp,
            speed: this.speed,
            weapon: this.weapon
        };
    }
}