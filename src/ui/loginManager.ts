import AuthService from '../services/autenticacion.ts';
import { AuthResponse } from '../types/index.ts';

class LoginManager {
    private authService: AuthService;
    
    // Pantallas
    private loginScreen!: HTMLElement;
    private registerScreen!: HTMLElement;
    private gameCanvas!: HTMLElement;

    // Formularios
    private loginForm!: HTMLFormElement;
    private registerForm!: HTMLFormElement;

    // Mensajes
    private loginMessage!: HTMLElement;
    private registerMessage!: HTMLElement;

    // Botones
    private registerBtn!: HTMLElement;
    private guestBtn!: HTMLElement;
    private backToLoginBtn!: HTMLElement;

    constructor() {
        this.authService = new AuthService();
        this.initElements();
        this.initEventListeners();
    }

    private initElements(): void {
        // Pantallas
        this.loginScreen = document.getElementById('loginScreen') as HTMLElement;
        this.registerScreen = document.getElementById('registerScreen') as HTMLElement;
        this.gameCanvas = document.getElementById('gameCanvas') as HTMLElement;

        // Formularios
        this.loginForm = document.getElementById('loginForm') as HTMLFormElement;
        this.registerForm = document.getElementById('registerForm') as HTMLFormElement;

        // Mensajes
        this.loginMessage = document.getElementById('loginMessage') as HTMLElement;
        this.registerMessage = document.getElementById('registerMessage') as HTMLElement;

        // Botones
        this.registerBtn = document.getElementById('registerBtn') as HTMLElement;
        this.guestBtn = document.getElementById('guestBtn') as HTMLElement;
        this.backToLoginBtn = document.getElementById('backToLoginBtn') as HTMLElement;
    }

    private initEventListeners(): void {
        // Login
        this.loginForm.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registro
        this.registerForm.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Navegación
        this.registerBtn.addEventListener('click', () => this.showRegister());
        this.backToLoginBtn.addEventListener('click', () => this.showLogin());
        this.guestBtn.addEventListener('click', () => this.handleGuestLogin());
    }

    private handleLogin(): void {
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        const result: AuthResponse = this.authService.login(username, password);

        this.showMessage(this.loginMessage, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                this.startGame();
            }, 1000);
        }
    }

    private handleRegister(): void {
        const username = (document.getElementById('regUsername') as HTMLInputElement).value;
        const password = (document.getElementById('regPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('regConfirmPassword') as HTMLInputElement).value;

        if (password !== confirmPassword) {
            this.showMessage(this.registerMessage, 'Las contraseñas no coinciden', false);
            return;
        }

        const result: AuthResponse = this.authService.register(username, password);

        this.showMessage(this.registerMessage, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                this.showLogin();
                (document.getElementById('username') as HTMLInputElement).value = username;
            }, 1500);
        }
    }

    private handleGuestLogin(): void {
        const result: AuthResponse = this.authService.loginAsGuest();
        
        if (result.success) {
            this.startGame();
        }
    }

    private showLogin(): void {
        this.loginScreen.style.display = 'flex';
        this.registerScreen.style.display = 'none';
    }

    private showRegister(): void {
        this.loginScreen.style.display = 'none';
        this.registerScreen.style.display = 'flex';
    }

    private startGame(): void {
        // Ocultar pantalla de login
        this.loginScreen.style.display = 'none';
        this.registerScreen.style.display = 'none';
        
        // Mostrar canvas del juego
        this.gameCanvas.style.display = 'block';
        
        // Iniciar el juego (esto se dispararía automáticamente cuando se cargue el script)
        (window as any).loginComplete = true;
        this.triggerGameStart();
    }

    private triggerGameStart(): void {
        // Disparar evento personalizado para que el juego se inicie
        window.dispatchEvent(new CustomEvent('startGame'));
    }

    private showMessage(element: HTMLElement, message: string, isSuccess: boolean): void {
        element.textContent = message;
        element.className = 'message';
        element.classList.add(isSuccess ? 'success' : 'error');
    }

    public init(): void {
        this.authService.init();
    }
}

export default LoginManager;