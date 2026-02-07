// Login Screen - Refactored for proper UI flow
import { BaseScene } from '../sceneManager.mjs';
import { Container, Text, Graphics } from '../libs/pixi.mjs';
import { connect } from '../client.mjs';
import ElementWrapper from '../libs/element-wrapper.mjs';

export class LoginScreen extends BaseScene {
    constructor(app, container, sceneManager) {
        super(app, container);
        this.sceneManager = sceneManager;
        this.form = null;
        this.wrappedForm = null;
    }

    async init() {
        if (this.initialized) return;
        await super.init();

        // Get the login form from HTML
        this.form = document.getElementById("loginForm");
        
        // Style the form
        this.form.style.fontFamily = 'Arial';
        this.form.style.color = "#9A8FD9";
        this.form.style.display = "block";
        this.form.style.textAlign = "center";
        this.form.style.position = "absolute";
        this.form.style.left = "50%";
        this.form.style.top = "50%";
        this.form.style.transform = "translate(-50%, -50%)";
        this.form.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.form.style.padding = "40px";
        this.form.style.borderRadius = "10px";
        this.form.style.border = "2px solid #9A8FD9";

        // Style form elements
        this.form['username'].style.fontFamily = 'inherit';
        this.form['password'].style.fontFamily = 'inherit';
        this.form['button'].style.fontFamily = 'inherit';
        
        this.form['username'].style.color = "white";
        this.form['username'].style.backgroundColor = "#333";
        this.form['username'].style.border = "1px solid #666";
        this.form['username'].style.padding = "10px";
        this.form['username'].style.margin = "10px 0";
        this.form['username'].style.width = "250px";
        
        this.form['password'].style.color = "white";
        this.form['password'].style.backgroundColor = "#333";
        this.form['password'].style.border = "1px solid #666";
        this.form['password'].style.padding = "10px";
        this.form['password'].style.margin = "10px 0";
        this.form['password'].style.width = "250px";
        
        this.form['button'].style.color = "white";
        this.form['button'].style.backgroundColor = "#9A8FD9";
        this.form['button'].style.border = "none";
        this.form['button'].style.padding = "12px 30px";
        this.form['button'].style.margin = "20px 10px 10px 10px";
        this.form['button'].style.cursor = "pointer";
        this.form['button'].style.borderRadius = "5px";
        this.form['button'].style.fontSize = "16px";

        // Add form submission handler
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleLogin();
        });

        // Add guest login button
        this.createGuestButton();

        // Title overlay on canvas
        const title = new Text('VOID', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xffffff,
            fontWeight: 'bold',
            stroke: 0x9A8FD9,
            strokeThickness: 4
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 100;
        this.container.addChild(title);
    }

    createGuestButton() {
        // Check if guest button already exists
        if (document.getElementById('guestButton')) return;

        const guestButton = document.createElement('button');
        guestButton.id = 'guestButton';
        guestButton.textContent = 'Play as Guest';
        guestButton.type = 'button';
        guestButton.style.color = "white";
        guestButton.style.backgroundColor = "#666";
        guestButton.style.border = "none";
        guestButton.style.padding = "12px 30px";
        guestButton.style.margin = "10px";
        guestButton.style.cursor = "pointer";
        guestButton.style.borderRadius = "5px";
        guestButton.style.fontSize = "16px";
        
        guestButton.addEventListener('click', () => {
            this.handleGuestLogin();
        });
        
        this.form.appendChild(guestButton);
    }

    handleLogin() {
        const username = this.form['username'].value.trim();
        const password = this.form['password'].value;
        
        if (!username) {
            alert('Please enter a username');
            return;
        }

        // Connect to signaling server
        connect();
        
        // Store user info
        this.userInfo = {
            username: username,
            password: password,
            remember: this.form['remember'].checked,
            isGuest: false
        };

        // Transition to main menu
        this.sceneManager.showScene('mainMenu', { userInfo: this.userInfo });
    }

    handleGuestLogin() {
        // Generate random guest name
        const guestName = this.generateGuestName();
        
        // Connect to signaling server
        connect();
        
        // Store guest info
        this.userInfo = {
            username: guestName,
            password: '',
            remember: false,
            isGuest: true
        };

        // Transition to main menu
        this.sceneManager.showScene('mainMenu', { userInfo: this.userInfo });
    }

    generateGuestName() {
        const adjectives = ['Swift', 'Brave', 'Silent', 'Mighty', 'Quick', 'Bold', 'Fierce', 'Cool', 'Epic', 'Wild'];
        const nouns = ['Tiger', 'Eagle', 'Dragon', 'Wolf', 'Falcon', 'Shark', 'Panther', 'Phoenix', 'Viper', 'Lion'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 1000);
        
        return `${adj}${noun}${num}`;
    }

    onShow(data) {
        // Show the form
        if (this.form) {
            this.form.style.display = "block";
            this.form['username'].focus();
            this.form['username'].value = '';
            this.form['password'].value = '';
        }
    }

    onHide() {
        // Hide the form
        if (this.form) {
            this.form.style.display = "none";
        }
    }

    cleanup() {
        if (this.form) {
            this.form.style.display = "none";
        }
        super.cleanup();
    }
}
