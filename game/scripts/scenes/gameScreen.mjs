// Game Screen - Wrapper for the main combat game
import { BaseScene } from '../sceneManager.mjs';
import { gameLoop } from '../game.mjs';

export class GameScreen extends BaseScene {
    constructor(app, container, sceneManager) {
        super(app, container);
        this.sceneManager = sceneManager;
        this.gameLoopAdded = false;
    }

    async init() {
        if (this.initialized) return;
        await super.init();
        
        // Game loop initialization happens in game.mjs
        // Just setup the scene container
        console.log('[GameScreen] Initialized');
    }

    onShow(data) {
        console.log('[GameScreen] Starting game with:', data);
        
        // Store game data
        this.gameData = data;
        
        // Add game loop to ticker if not already added
        if (!this.gameLoopAdded) {
            this.app.ticker.add(gameLoop);
            this.gameLoopAdded = true;
        }

        // Setup ESC key for pause/menu
        this.setupPauseHandler();
    }

    setupPauseHandler() {
        this.pauseHandler = (e) => {
            if (!this.isVisible) return;
            
            if (e.key === 'Escape') {
                e.preventDefault();
                this.showPauseMenu();
            }
        };
        
        document.addEventListener('keydown', this.pauseHandler);
    }

    showPauseMenu() {
        // Simple pause menu for now
        const shouldQuit = confirm('Paused\n\nReturn to Main Menu?');
        if (shouldQuit) {
            this.returnToMenu();
        }
    }

    returnToMenu() {
        // Remove game loop
        if (this.gameLoopAdded) {
            this.app.ticker.remove(gameLoop);
            this.gameLoopAdded = false;
        }

        // Clear navigation stack and go to main menu
        this.sceneManager.clearStack();
        this.sceneManager.showScene('mainMenu', { 
            userInfo: this.gameData?.userInfo 
        }, false);
    }

    onHide() {
        // Game loop continues to run in background
        // This allows for smooth transitions
    }

    cleanup() {
        if (this.pauseHandler) {
            document.removeEventListener('keydown', this.pauseHandler);
        }
        
        if (this.gameLoopAdded) {
            this.app.ticker.remove(gameLoop);
            this.gameLoopAdded = false;
        }
        
        super.cleanup();
    }
}
