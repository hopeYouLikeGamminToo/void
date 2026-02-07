// Character selection screen for void game
import { Container, Graphics, Text, Sprite } from './libs/pixi.mjs';

export class CharacterSelect {
    constructor(app, stage) {
        this.app = app;
        this.stage = stage;
        this.container = new Container();
        this.stage.addChild(this.container);
        
        this.characters = ['kraken', 'glonky', 'spaceman', 'void'];
        this.selectedCharacter = 0;
        this.confirmed = false;
        
        this.createUI();
    }

    createUI() {
        // Title
        const title = new Text('SELECT YOUR CHARACTER', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 80;
        this.container.addChild(title);
        
        // Instructions
        const instructions = new Text('Use A/D or Arrow Keys to select, SPACE or ENTER to confirm', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xaaaaaa,
            align: 'center'
        });
        instructions.anchor.set(0.5);
        instructions.x = this.app.screen.width / 2;
        instructions.y = this.app.screen.height - 50;
        this.container.addChild(instructions);
        
        // Character boxes (we'll draw simple placeholders)
        this.characterBoxes = [];
        const boxWidth = 200;
        const boxHeight = 200;
        const spacing = 50;
        const startX = (this.app.screen.width - (boxWidth * 4 + spacing * 3)) / 2;
        const y = this.app.screen.height / 2;
        
        for (let i = 0; i < this.characters.length; i++) {
            const box = new Graphics();
            const x = startX + i * (boxWidth + spacing);
            
            // Background
            box.beginFill(0x333333);
            box.drawRoundedRect(0, 0, boxWidth, boxHeight, 10);
            box.endFill();
            
            box.x = x;
            box.y = y - boxHeight / 2;
            this.container.addChild(box);
            
            // Character name
            const name = new Text(this.characters[i].toUpperCase(), {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold'
            });
            name.anchor.set(0.5);
            name.x = x + boxWidth / 2;
            name.y = y + boxHeight / 2 + 30;
            this.container.addChild(name);
            
            this.characterBoxes.push({ box, name, index: i });
        }
        
        // Selection indicator
        this.selector = new Graphics();
        this.updateSelector();
        this.container.addChild(this.selector);
    }

    updateSelector() {
        this.selector.clear();
        this.selector.lineStyle(5, 0x00ff00);
        
        const box = this.characterBoxes[this.selectedCharacter].box;
        this.selector.drawRoundedRect(
            box.x - 5,
            box.y - 5,
            210,
            210,
            10
        );
    }

    moveSelection(direction) {
        if (this.confirmed) return;
        
        this.selectedCharacter += direction;
        if (this.selectedCharacter < 0) {
            this.selectedCharacter = this.characters.length - 1;
        } else if (this.selectedCharacter >= this.characters.length) {
            this.selectedCharacter = 0;
        }
        
        this.updateSelector();
    }

    confirmSelection() {
        if (this.confirmed) return null;
        
        this.confirmed = true;
        return this.characters[this.selectedCharacter];
    }

    reset() {
        this.selectedCharacter = 0;
        this.confirmed = false;
        this.updateSelector();
    }

    hide() {
        this.container.visible = false;
    }

    show() {
        this.container.visible = true;
        this.reset();
    }
}
