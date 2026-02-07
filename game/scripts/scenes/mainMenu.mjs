// Main Menu - Central hub with Quick Play, Settings, Credits
import { BaseScene } from '../sceneManager.mjs';
import { Container, Text, Graphics } from '../libs/pixi.mjs';

export class MainMenu extends BaseScene {
    constructor(app, container, sceneManager) {
        super(app, container);
        this.sceneManager = sceneManager;
        this.selectedIndex = 0;
        this.menuItems = [];
    }

    async init() {
        if (this.initialized) return;
        await super.init();

        // Title
        const title = new Text('MAIN MENU', {
            fontFamily: 'Arial',
            fontSize: 64,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x9A8FD9,
            strokeThickness: 4
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 120;
        this.container.addChild(title);

        // Username display
        this.usernameText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xaaaaaa
        });
        this.usernameText.anchor.set(0.5);
        this.usernameText.x = this.app.screen.width / 2;
        this.usernameText.y = 180;
        this.container.addChild(this.usernameText);

        // Menu buttons
        const menuOptions = [
            { text: 'QUICK PLAY', action: () => this.quickPlay() },
            { text: 'SETTINGS', action: () => this.openSettings() },
            { text: 'CREDITS', action: () => this.openCredits() },
            { text: 'LOGOUT', action: () => this.logout() }
        ];

        const startY = 300;
        const spacing = 80;

        menuOptions.forEach((option, index) => {
            const button = this.createMenuButton(option.text, startY + index * spacing, option.action);
            this.menuItems.push(button);
        });

        // Instructions
        const instructions = new Text('Use Arrow Keys or W/S to navigate, ENTER or SPACE to select', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0x666666,
            align: 'center'
        });
        instructions.anchor.set(0.5);
        instructions.x = this.app.screen.width / 2;
        instructions.y = this.app.screen.height - 50;
        this.container.addChild(instructions);

        // Setup input handling
        this.setupInputHandlers();
    }

    createMenuButton(text, y, action) {
        const button = new Container();
        button.action = action;

        // Background
        const bg = new Graphics();
        bg.beginFill(0x333333);
        bg.drawRoundedRect(-200, -25, 400, 50, 10);
        bg.endFill();
        button.addChild(bg);
        button.bg = bg;

        // Highlight (initially hidden)
        const highlight = new Graphics();
        highlight.lineStyle(3, 0x9A8FD9);
        highlight.drawRoundedRect(-205, -30, 410, 60, 10);
        highlight.visible = false;
        button.addChild(highlight);
        button.highlight = highlight;

        // Text
        const buttonText = new Text(text, {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        buttonText.anchor.set(0.5);
        button.addChild(buttonText);

        // Position
        button.x = this.app.screen.width / 2;
        button.y = y;

        // Make interactive
        button.interactive = true;
        button.buttonMode = true;
        
        button.on('pointerover', () => {
            this.selectedIndex = this.menuItems.indexOf(button);
            this.updateSelection();
        });
        
        button.on('pointerdown', () => {
            if (action) action();
        });

        this.container.addChild(button);
        return button;
    }

    setupInputHandlers() {
        this.keyHandler = (e) => {
            if (!this.isVisible) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                    this.updateSelection();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
                    this.updateSelection();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (this.menuItems[this.selectedIndex]) {
                        this.menuItems[this.selectedIndex].action();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    updateSelection() {
        this.menuItems.forEach((item, index) => {
            item.highlight.visible = (index === this.selectedIndex);
        });
    }

    quickPlay() {
        console.log('[MainMenu] Quick Play selected');
        this.sceneManager.showScene('characterSelect', { 
            userInfo: this.data.userInfo 
        });
    }

    openSettings() {
        console.log('[MainMenu] Settings selected');
        alert('Settings menu coming soon!');
        // TODO: Implement settings screen
    }

    openCredits() {
        console.log('[MainMenu] Credits selected');
        alert('Credits:\n\nVoid - A Multiplayer Fighting Game\nDeveloped by: hopeYouLikeGamminToo\n\nThanks for playing!');
    }

    logout() {
        console.log('[MainMenu] Logout selected');
        this.sceneManager.clearStack();
        this.sceneManager.showScene('login', {}, false);
    }

    onShow(data) {
        // Display username
        if (data.userInfo && this.usernameText) {
            const prefix = data.userInfo.isGuest ? 'Guest: ' : 'Player: ';
            this.usernameText.text = prefix + data.userInfo.username;
        }

        // Reset selection
        this.selectedIndex = 0;
        this.updateSelection();
    }

    onHide() {
        // Nothing specific needed
    }

    cleanup() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        super.cleanup();
    }
}
