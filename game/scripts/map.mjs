import { Graphics } from './libs/pixi.mjs';
import { engine, World, Body, Bodies } from './physics.mjs';

// TODO: ALOT
export class Map {
    constructor(app, stage, level) {
        // replace with load map fxn here
        // create a couple pixi shapes to act as platforms & start working on collision physics
        this.platform1 = new Graphics();
        this.platform1.lineStyle({ width: 4, color: 0x575757, alpha: 1 });
        this.platform1.beginFill(0xDAFFFF);
        this.platform1.drawRoundedRect(0, 0, app.screen.width / 6, app.screen.height / 25, 10);
        this.platform1.endFill();
        this.platform1.x = app.screen.width / 1.33;
        this.platform1.y = app.screen.height / 2;
        stage.addChild(this.platform1);

        this.platform2 = new Graphics();
        this.platform2.lineStyle({ width: 4, color: 0x575757, alpha: 1 });
        this.platform2.beginFill(0xDAFFFF);
        this.platform2.drawRoundedRect(0, 0, app.screen.width / 6, app.screen.height / 25, 10);
        this.platform2.endFill();
        this.platform2.x = app.screen.width / 12;
        this.platform2.y = app.screen.height / 2;
        stage.addChild(this.platform2);

        this.platform3 = new Graphics();
        this.platform3.lineStyle({ width: 4, color: 0x575757, alpha: 1 });
        this.platform3.beginFill(0xABABAB);
        this.platform3.drawRoundedRect(0, 0, app.screen.width / 2, app.screen.height / 25, 10);
        this.platform3.endFill();
        this.platform3.x = app.screen.width / 4;
        this.platform3.y = app.screen.height / 1.3;
        stage.addChild(this.platform3);

        // should be able to find the matter body offsets dynamically...
        // matter js position is the center of the body
        // pixi position is the top left corner of the body
        // still doesn't seem to be working correctly though...

        this.platform1_body = Bodies.rectangle( this.platform1.x + 95, this.platform1.y - 70, this.platform1.width - 30, this.platform1.height, {
            isStatic: true,  // no moving or rotatation
            isSensor: false,  // enable collisions
            // friction: 2,  // friction forces
            // frictionStatic: 2,  // static friction
            restitution: 0 // bounciness
        });
        this.platform2_body = Bodies.rectangle( this.platform2.x + 95, this.platform2.y - 70, this.platform2.width - 30, this.platform2.height, {
            isStatic: true,  // no moving or rotatation
            isSensor: false,  // enable collisions
            // friction: 2,  // friction forces
            // frictionStatic: 1,  // static friction
            restitution: 0 // bounciness
        });
        this.platform3_body = Bodies.rectangle( this.platform3.x + 405, this.platform3.y - 70, this.platform3.width - 50, this.platform3.height, {
            isStatic: true,  // no moving or rotatation
            isSensor: false,  // enable collisions
            // friction: 2,  // friction forces
            // frictionStatic: 1,  // static friction
            restitution: 0 // bounciness
        });

        console.log("platform2.position: ", this.platform2.position);
        console.log("platform2_body.position: ", this.platform2_body.position);

        World.add(engine.world, [this.platform1_body, this.platform2_body, this.platform3_body]);
    }
}