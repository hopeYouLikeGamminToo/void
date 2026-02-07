// Character Select Screen - Enhanced for proper UI flow
import { BaseScene } from '../sceneManager.mjs';
import { Container, Text, Graphics, Sprite } from '../libs/pixi.mjs';

export class CharacterSelectScreen extends BaseScene {
    constructor(app, container, sceneManager) {
        super(app, container);
        this.sceneManager = sceneManager;
        this.characters = ['kraken', 'glonky', 'spaceman', 'void'];
        this.selectedIndex = 0;
        this.characterBoxes = [];
        
        // Character stats for display
        this.characterStats = {
            'kraken': { speed: '1.0x', weight: 105, attack: '1.2x', style: 'Balanced' },
            'spaceman': { speed: '1.15x', weight: 85, attack: '0.95x', style: 'Fast & Light' },
            'glonky': { speed: '0.95x', weight: 115, attack: '1.35x', style: 'Tank' },
            'void': { speed: '1.25x', weight: 80, attack: '0.9x', style: 'Speed Demon' }
        };
    }

    async init() {
        if (this.initialized) return;
        await super.init();

        // Title
        const title = new Text('SELECT YOUR CHARACTER', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x9A8FD9,
            strokeThickness: 4
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 80;
        this.container.addChild(title);

        // Create character selection boxes
        this.createCharacterBoxes();

        // Character stats display
        this.createStatsDisplay();

        // Instructions
        const instructions = new Text('A/D or Arrow Keys to navigate, SPACE/ENTER to confirm, ESC to go back', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xaaaaaa,
            align: 'center'
        });
        instructions.anchor.set(0.5);
        instructions.x = this.app.screen.width / 2;
        instructions.y = this.app.screen.height - 50;
        this.container.addChild(instructions);

        // Setup input handlers
        this.setupInputHandlers();
    }

    createCharacterBoxes() {
        const boxWidth = 180;
        const boxHeight = 180;
        const spacing = 40;
        const totalWidth = (boxWidth * 4) + (spacing * 3);
        const startX = (this.app.screen.width - totalWidth) / 2;
        const y = this.app.screen.height / 2 - 50;

        this.characters.forEach((charName, index) => {
            const box = new Container();
            const x = startX + (boxWidth + spacing) * index;

            // Background
            const bg = new Graphics();
            bg.beginFill(0x333333);
            bg.drawRoundedRect(0, 0, boxWidth, boxHeight, 10);
            bg.endFill();
            box.addChild(bg);

            // Selection highlight
            const highlight = new Graphics();
            highlight.lineStyle(4, 0x00ff00);
            highlight.drawRoundedRect(-5, -5, boxWidth + 10, boxHeight + 10, 10);
            highlight.visible = false;
            box.addChild(highlight);
            box.highlight = highlight;

            // Character name
            const name = new Text(charName.toUpperCase(), {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                fontWeight: 'bold'
            });
            name.anchor.set(0.5);
            name.x = boxWidth / 2;
            name.y = boxHeight - 25;
            box.addChild(name);

            // Try to add character preview sprite
            try {
                // This will work if character assets are loaded
                const preview = new Sprite();
                preview.x = boxWidth / 2;
                preview.y = boxHeight / 2 - 10;
                preview.anchor.set(0.5);
                preview.width = 120;
                preview.height = 120;
                box.addChild(preview);
                box.preview = preview;
            } catch (e) {
                // Fallback: just show the name prominently
                const placeholder = new Text('?', {
                    fontFamily: 'Arial',
                    fontSize: 80,
                    fill: 0x666666
                });
                placeholder.anchor.set(0.5);
                placeholder.x = boxWidth / 2;
                placeholder.y = boxHeight / 2 - 10;
                box.addChild(placeholder);
            }

            box.x = x;
            box.y = y;
            box.characterName = charName;

            this.container.addChild(box);
            this.characterBoxes.push(box);
        });

        // Selection indicator (large)
        this.selector = new Graphics();
        this.container.addChild(this.selector);
        this.updateSelector();
    }

    createStatsDisplay() {
        // Stats panel
        const panel = new Graphics();
        panel.beginFill(0x222222, 0.9);
        panel.drawRoundedRect(0, 0, 400, 180, 10);
        panel.endFill();
        panel.x = this.app.screen.width / 2 - 200;
        panel.y = this.app.screen.height - 250;
        this.container.addChild(panel);

        // Stats title
        this.statsTitle = new Text('', {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        this.statsTitle.x = this.app.screen.width / 2 - 180;
        this.statsTitle.y = this.app.screen.height - 235;
        this.container.addChild(this.statsTitle);

        // Stats text
        this.statsText = new Text('', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xcccccc,
            lineHeight: 24
        });
        this.statsText.x = this.app.screen.width / 2 - 180;
        this.statsText.y = this.app.screen.height - 200;
        this.container.addChild(this.statsText);

        this.updateStatsDisplay();
    }

    setupInputHandlers() {
        this.keyHandler = (e) => {
            if (!this.isVisible) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                    this.updateSelector();
                    this.updateStatsDisplay();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.characters.length - 1, this.selectedIndex + 1);
                    this.updateSelector();
                    this.updateStatsDisplay();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.confirmSelection();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.goBack();
                    break;
            }
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    updateSelector() {
        this.characterBoxes.forEach((box, index) => {
            box.highlight.visible = (index === this.selectedIndex);
        });
    }

    updateStatsDisplay() {
        const charName = this.characters[this.selectedIndex];
        const stats = this.characterStats[charName];

        if (this.statsTitle && this.statsText && stats) {
            this.statsTitle.text = charName.toUpperCase();
            this.statsText.text = `Style: ${stats.style}\n` +
                                   `Speed: ${stats.speed}\n` +
                                   `Weight: ${stats.weight}\n` +
                                   `Attack: ${stats.attack}`;
        }
    }

    confirmSelection() {
        const selectedCharacter = this.characters[this.selectedIndex];
        console.log('[CharacterSelect] Selected:', selectedCharacter);

        // Pass character and user info to matchmaking
        this.sceneManager.showScene('matchmaking', {
            userInfo: this.data.userInfo,
            character: selectedCharacter
        });
    }

    goBack() {
        this.sceneManager.goBack();
    }

    onShow(data) {
        this.selectedIndex = 0;
        this.updateSelector();
        this.updateStatsDisplay();
    }

    onHide() {
        // Nothing specific
    }

    cleanup() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        super.cleanup();
    }
}
