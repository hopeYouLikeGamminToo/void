const MATTER_RENDER = false;

// Alias Matter Modules
export const Engine = Matter.Engine;
export const World = Matter.World;
export const Body = Matter.Body;
export const Bodies = Matter.Bodies;
export const Vector = Matter.Vector;
export const Render = Matter.Render;
export const Runner = Matter.Runner;

// const Mouse = Matter.Mouse;
// const MouseConstraint = Matter.MouseConstraint;

// Matter Engine
export const engine = Engine.create();
engine.world.gravity.x = 0; // Horizontal gravity
engine.world.gravity.y = 7; // Vertical gravity

if (MATTER_RENDER) {
    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            showAxes: true,
            showCollisions: true,
            showConvexHulls: true,
            pixelRatio: window.devicePixelRatio,
        }
    });

    console.log("render.width: ", render.options.width);
    console.log("render.height: ", render.options.height);

    Render.run(render);
}

// create runner
var runner = Runner.create();
Runner.run(runner, engine);
