// Scene Manager - Central UI flow controller for void game
// Manages scene lifecycle, transitions, and navigation

export class SceneManager {
    constructor(app) {
        this.app = app;
        this.scenes = new Map();
        this.currentScene = null;
        this.sceneStack = [];
        this.isTransitioning = false;
    }

    /**
     * Register a scene with the manager
     * @param {string} name - Unique scene identifier
     * @param {BaseScene} sceneInstance - Scene instance
     */
    registerScene(name, sceneInstance) {
        this.scenes.set(name, sceneInstance);
        console.log(`[SceneManager] Registered scene: ${name}`);
    }

    /**
     * Show a specific scene with optional data
     * @param {string} name - Scene name to show
     * @param {object} data - Optional data to pass to scene
     * @param {boolean} addToStack - Whether to add to navigation stack
     */
    async showScene(name, data = {}, addToStack = true) {
        if (this.isTransitioning) {
            console.warn(`[SceneManager] Already transitioning, ignoring showScene(${name})`);
            return;
        }

        const nextScene = this.scenes.get(name);
        if (!nextScene) {
            console.error(`[SceneManager] Scene not found: ${name}`);
            return;
        }

        this.isTransitioning = true;

        // Hide current scene
        if (this.currentScene) {
            await this.hideCurrentScene();
        }

        // Add to navigation stack if requested
        if (addToStack && this.currentScene) {
            this.sceneStack.push({
                name: this.getCurrentSceneName(),
                data: this.currentScene.data || {}
            });
        }

        // Show next scene
        this.currentScene = nextScene;
        await nextScene.show(data);

        this.isTransitioning = false;
        console.log(`[SceneManager] Now showing: ${name}`);
    }

    /**
     * Hide the current scene
     */
    async hideCurrentScene() {
        if (this.currentScene) {
            await this.currentScene.hide();
        }
    }

    /**
     * Get current scene name
     */
    getCurrentSceneName() {
        for (const [name, scene] of this.scenes.entries()) {
            if (scene === this.currentScene) {
                return name;
            }
        }
        return null;
    }

    /**
     * Go back to previous scene in stack
     */
    async goBack() {
        if (this.sceneStack.length === 0) {
            console.warn('[SceneManager] No previous scene in stack');
            return;
        }

        const previous = this.sceneStack.pop();
        await this.showScene(previous.name, previous.data, false);
    }

    /**
     * Clear navigation stack
     */
    clearStack() {
        this.sceneStack = [];
    }

    /**
     * Get scene by name
     */
    getScene(name) {
        return this.scenes.get(name);
    }

    /**
     * Check if a scene is currently active
     */
    isSceneActive(name) {
        return this.getCurrentSceneName() === name;
    }
}

/**
 * Base Scene class - all scenes should extend this
 */
export class BaseScene {
    constructor(app, container) {
        this.app = app;
        this.container = container;
        this.data = {};
        this.isVisible = false;
        this.initialized = false;
    }

    /**
     * Initialize scene - create UI elements (called once)
     */
    async init() {
        if (this.initialized) return;
        console.log(`[${this.constructor.name}] Initializing...`);
        this.initialized = true;
    }

    /**
     * Show scene - make visible and animate in
     * @param {object} data - Data passed from previous scene
     */
    async show(data = {}) {
        if (!this.initialized) {
            await this.init();
        } else {
            // If already initialized, clear and reinitialize to prevent overlapping
            this.clearContainer();
            await this.init();
        }
        
        this.data = data;
        this.container.visible = true;
        this.isVisible = true;
        this.onShow(data);
        console.log(`[${this.constructor.name}] Showing`);
    }

    /**
     * Hide scene - animate out and hide
     */
    async hide() {
        this.container.visible = false;
        this.isVisible = false;
        this.onHide();
        console.log(`[${this.constructor.name}] Hiding`);
    }

    /**
     * Clear all children from container to prevent overlapping
     */
    clearContainer() {
        if (this.container && this.container.children) {
            while (this.container.children.length > 0) {
                const child = this.container.children[0];
                this.container.removeChild(child);
                // Don't destroy - let cleanup() handle that
            }
        }
        // Reset initialized flag so init() will run again
        this.initialized = false;
    }

    /**
     * Called when scene is shown (override in subclass)
     */
    onShow(data) {
        // Override in subclass
    }

    /**
     * Called when scene is hidden (override in subclass)
     */
    onHide() {
        // Override in subclass
    }

    /**
     * Update scene (called every frame if needed)
     */
    update(delta) {
        // Override in subclass if needed
    }

    /**
     * Cleanup scene - destroy resources
     */
    cleanup() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
        this.initialized = false;
    }
}
