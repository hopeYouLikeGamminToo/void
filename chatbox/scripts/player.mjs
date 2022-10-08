export default class Player {
    constructor(username, sprite, position) {
        console.log("creating ")
        this._username = username;
        this._characer = character;
        this._health = 100;
        this._position = position;
        this._sprite = sprite;

        // this will be dependent on character, specials, wearables, armor, etc.
        this.melee_strength = 10;
        this.jump_height = 20;
    }

    get health() {
        return this._health
    }

    get position() {
        return this._position
    }

    get sprite() {
        return this._sprite
    }

    get player() {
        return { username: this._username, health: this._health, position: this._position, sprite: this._sprite }
    }

    damage(amount) {
        this._health += amount;
    }
}