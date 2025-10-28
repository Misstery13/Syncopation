import AuthService from '../services/autenticacion.js';

class LoginManager {
    constructor() {
        this.authService = new AuthService();
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        // Pantallas
        this.loginScreen = document.getElementById('loginScreen');
        this.registerScreen = document.getElementById('registerScreen');
        this.gameCanvas = document.getElementById('gameCanvas');

        // Formularios
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');

        // Mensajes
        this.loginMessage = document.getElementById('loginMessage');
        this.registerMessage = document.getElementById('registerMessage');

        // Botones
        this.registerBtn = document.getElementById('registerBtn');
        this.guestBtn = document.getElementById('guestBtn');
        this.backToLoginBtn = document.getElementById('backToLoginBtn');
    }

    initEventListeners() {
        // Login
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registro
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Navegación
        this.registerBtn.addEventListener('click', () => this.showRegister());
        this.backToLoginBtn.addEventListener('click', () => this.showLogin());
        this.guestBtn.addEventListener('click', () => this.handleGuestLogin());
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const result = this.authService.login(username, password);

        this.showMessage(this.loginMessage, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                this.startGame();
            }, 1000);
        }
    }

    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showMessage(this.registerMessage, 'Las contraseñas no coinciden', false);
            return;
        }

        const result = this.authService.register(username, password);

        this.showMessage(this.registerMessage, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                this.showLogin();
                document.getElementById('username').value = username;
            }, 1500);
        }
    }

    handleGuestLogin() {
        const result = this.authService.loginAsGuest();
        
        if (result.success) {
            this.startGame();
        }
    }

    showLogin() {
        this.loginScreen.style.display = 'flex';
        this.registerScreen.style.display = 'none';
    }

    showRegister() {
        this.loginScreen.style.display = 'none';
        this.registerScreen.style.display = 'flex';
    }

    startGame() {
        // Ocultar pantalla de login
        this.loginScreen.style.display = 'none';
        this.registerScreen.style.display = 'none';
        
        // Mostrar canvas del juego
        this.gameCanvas.style.display = 'block';
        
        // Iniciar el juego (esto se dispararía automáticamente cuando se cargue el script)
        window.loginComplete = true;
        this.triggerGameStart();
    }

    triggerGameStart() {
        // Disparar evento personalizado para que el juego se inicie
        window.dispatchEvent(new CustomEvent('startGame'));
    }

    showMessage(element, message, isSuccess) {
        element.textContent = message;
        element.className = 'message';
        element.classList.add(isSuccess ? 'success' : 'error');
    }

    init() {
        this.authService.init();
    }
}

export default LoginManager;