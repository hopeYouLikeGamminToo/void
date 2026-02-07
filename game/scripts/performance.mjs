// Performance Optimizations for void game
// Implements texture caching, sprite pooling, and culling

import { Container } from './libs/pixi.mjs';

/**
 * Sprite Pool - Reuse sprites instead of creating/destroying
 */
export class SpritePool {
    constructor(SpriteClass, initialSize = 10) {
        this.SpriteClass = SpriteClass;
        this.pool = [];
        this.active = [];
        
        // Pre-create sprites
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new SpriteClass());
        }
    }

    get() {
        let sprite;
        if (this.pool.length > 0) {
            sprite = this.pool.pop();
        } else {
            sprite = new this.SpriteClass();
        }
        
        sprite.visible = true;
        this.active.push(sprite);
        return sprite;
    }

    release(sprite) {
        const index = this.active.indexOf(sprite);
        if (index !== -1) {
            this.active.splice(index, 1);
            sprite.visible = false;
            this.pool.push(sprite);
        }
    }

    releaseAll() {
        this.active.forEach(sprite => {
            sprite.visible = false;
            this.pool.push(sprite);
        });
        this.active = [];
    }
}

/**
 * Texture Cache - Prevent redundant texture loads
 */
export class TextureCache {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, texture) {
        this.cache.set(key, texture);
    }

    has(key) {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }
}

/**
 * Viewport Culler - Only render visible objects
 */
export class ViewportCuller {
    constructor(app) {
        this.app = app;
        this.margin = 100; // Extra pixels around viewport
    }

    isVisible(sprite) {
        if (!sprite.visible) return false;

        const bounds = sprite.getBounds();
        const screen = this.app.screen;

        return !(
            bounds.x + bounds.width < -this.margin ||
            bounds.x > screen.width + this.margin ||
            bounds.y + bounds.height < -this.margin ||
            bounds.y > screen.height + this.margin
        );
    }

    cullContainer(container) {
        if (!container || !container.children) return;

        container.children.forEach(child => {
            if (child instanceof Container) {
                this.cullContainer(child);
            } else {
                // Only render if in viewport
                const shouldRender = this.isVisible(child);
                child.renderable = shouldRender;
            }
        });
    }
}

/**
 * Performance Monitor - Track FPS and performance metrics
 */
export class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameTime = 16.67;
        this.lastTime = performance.now();
        this.frames = 0;
        this.fpsUpdateTime = 0;
    }

    update() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        this.frameTime = delta;

        this.frames++;
        this.fpsUpdateTime += delta;

        // Update FPS every second
        if (this.fpsUpdateTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.fpsUpdateTime = 0;
        }
    }

    getFPS() {
        return this.fps;
    }

    getFrameTime() {
        return this.frameTime;
    }

    isPerformanceGood() {
        return this.fps >= 50; // Consider good if above 50 FPS
    }
}

/**
 * Asset Lazy Loader - Load assets on demand
 */
export class LazyAssetLoader {
    constructor(app) {
        this.app = app;
        this.loadedAssets = new Set();
        this.loadingPromises = new Map();
    }

    async loadCharacterAssets(characterName) {
        // Skip if already loaded
        if (this.loadedAssets.has(characterName)) {
            return Promise.resolve();
        }

        // Return existing promise if currently loading
        if (this.loadingPromises.has(characterName)) {
            return this.loadingPromises.get(characterName);
        }

        // Create new loading promise
        const promise = new Promise((resolve, reject) => {
            const spritesheetPath = `${characterName}/${characterName}.json`;
            
            this.app.loader
                .add(characterName, spritesheetPath)
                .load((loader, resources) => {
                    this.loadedAssets.add(characterName);
                    this.loadingPromises.delete(characterName);
                    resolve(resources[characterName]);
                });
        });

        this.loadingPromises.set(characterName, promise);
        return promise;
    }

    isLoaded(characterName) {
        return this.loadedAssets.has(characterName);
    }
}

/**
 * Render Optimization Settings
 */
export const RenderOptimizations = {
    // Enable sprite batching
    enableBatching: true,
    
    // Reduce resolution for better performance
    useReducedResolution: false, // Set to true on low-end devices
    
    // Skip frames under heavy load
    enableFrameSkipping: false,
    
    // Use requestAnimationFrame instead of ticker
    useRAF: false,
    
    // Limit physics updates per frame
    maxPhysicsSteps: 3,
    
    // Enable texture caching
    enableTextureCaching: true
};

/**
 * Apply optimizations to PixiJS app
 */
export function applyOptimizations(app) {
    // Enable batching
    if (RenderOptimizations.enableBatching) {
        app.renderer.plugins.interaction.autoPreventDefault = true;
        app.renderer.plugins.interaction.interactionFrequency = 30;
    }

    // Reduce resolution if needed
    if (RenderOptimizations.useReducedResolution) {
        app.renderer.resolution = Math.max(1, window.devicePixelRatio * 0.75);
    }

    console.log('[Performance] Optimizations applied');
}
