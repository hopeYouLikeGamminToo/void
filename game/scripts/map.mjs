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
        // Calculate center positions properly
        
        const platform1CenterX = this.platform1.x + this.platform1.width / 2;
        const platform1CenterY = this.platform1.y + this.platform1.height / 2;
        
        const platform2CenterX = this.platform2.x + this.platform2.width / 2;
        const platform2CenterY = this.platform2.y + this.platform2.height / 2;
        
        const platform3CenterX = this.platform3.x + this.platform3.width / 2;
        const platform3CenterY = this.platform3.y + this.platform3.height / 2;

        this.platform1_body = Bodies.rectangle(
            platform1CenterX,
            platform1CenterY,
            this.platform1.width,
            this.platform1.height,
            {
                isStatic: true,  // no moving or rotation
                isSensor: false,  // enable collisions
                friction: 0.8,  // friction forces
                frictionStatic: 1,  // static friction
                restitution: 0 // bounciness
            }
        );
        
        this.platform2_body = Bodies.rectangle(
            platform2CenterX,
            platform2CenterY,
            this.platform2.width,
            this.platform2.height,
            {
                isStatic: true,
                isSensor: false,
                friction: 0.8,
                frictionStatic: 1,
                restitution: 0
            }
        );
        
        this.platform3_body = Bodies.rectangle(
            platform3CenterX,
            platform3CenterY,
            this.platform3.width,
            this.platform3.height,
            {
                isStatic: true,
                isSensor: false,
                friction: 0.8,
                frictionStatic: 1,
                restitution: 0
            }
        );

        console.log("platform2.position: ", this.platform2.position);
        console.log("platform2_body.position: ", this.platform2_body.position);

        World.add(engine.world, [this.platform1_body, this.platform2_body, this.platform3_body]);
    }
}