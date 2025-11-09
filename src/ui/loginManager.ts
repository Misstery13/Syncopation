import AuthService from '../services/autenticacion';
import { AuthResponse, User } from '../types/index';

type AuthMode = 'login' | 'register' | 'guest';

type LoginCallbacks = {
    onAuthSuccess?: (payload: { mode: AuthMode; user?: User | null }) => void;
};

class LoginManager {
    private authService: AuthService;
    private callbacks: LoginCallbacks;
    
    // Pantallas
    private menuScreen!: HTMLElement;
    private loginScreen!: HTMLElement;
    private registerScreen!: HTMLElement;
    private gameCanvas!: HTMLElement;
    private mainMenuScreen?: HTMLElement;

    // Formularios
    private loginForm!: HTMLFormElement;
    private registerForm!: HTMLFormElement;

    // Mensajes
    private loginMessage!: HTMLElement;
    private registerMessage!: HTMLElement;

    // Botones
    //private registerBtn!: HTMLElement;
    private backToMenuBtn!: HTMLElement;
    private backToMenuBtn2!: HTMLElement;

    //private guestBtn!: HTMLElement;
    // Memorias del menu para navegar dentro del mismo
    private menuOptions!: NodeListOf<HTMLLIElement>; //Lista de botones del menu
    private selectedIndex: number = 0; // la flecha seleccionada
    private currentFormInputs: HTMLInputElement[] = []; // Los cuadros del texto activos
    private inputIndex: number = 0; //El cuadro del texto seleccionado
    private currentScreen: 'menu' | 'login' | 'register' | 'mainMenu' | 'game' = 'menu'; // La pantalla actual

    constructor(callbacks?: LoginCallbacks) {
        this.authService = new AuthService();
        this.callbacks = callbacks ?? {};
        this.initElements();
        this.initEventListeners();

        // Para iniciar seleccionando la primera opcion enel menu
        if(this.menuOptions.length>0){
            this.menuOptions[this.selectedIndex].classList.add('selected')
        }
    }

    private initElements(): void {
        // Pantallas
        this.menuScreen = document.getElementById('menuScreen')!;
        this.loginScreen = document.getElementById('loginScreen') as HTMLElement;
        this.registerScreen = document.getElementById('registerScreen') as HTMLElement;
        this.gameCanvas = document.getElementById('gameCanvas') as HTMLElement;
        this.mainMenuScreen = document.getElementById('mainMenuScreen') ?? undefined;

        // Formularios
        this.loginForm = document.getElementById('loginForm') as HTMLFormElement;
        this.registerForm = document.getElementById('registerForm') as HTMLFormElement;

        // Mensajes
        this.loginMessage = document.getElementById('loginMessage') as HTMLElement;
        this.registerMessage = document.getElementById('registerMessage') as HTMLElement;

        // Botones
        const backBtnCandidate = document.getElementById('backToMenuBtn') ?? document.getElementById('backtoMenuBtn');
        const backBtnCandidate2 = document.getElementById('backToMenuBtn2') ?? document.getElementById('backToLoginBtn');

        if (!backBtnCandidate || !backBtnCandidate2) {
            throw new Error('[LoginManager] Botones de regreso no encontrados');
        }

        this.backToMenuBtn = backBtnCandidate;
        this.backToMenuBtn2 = backBtnCandidate2;
        //this.registerBtn = document.getElementById('registerBtn') as HTMLElement;
        //this.guestBtn = document.getElementById('guestBtn') as HTMLElement;
        //this.backToLoginBtn = document.getElementById('backToLoginBtn') as HTMLElement;

        // La lista de de opciones
        this.menuOptions = this.menuScreen.querySelectorAll('.menu-option');
    }

    private initEventListeners(): void {
        // Escucha todo el teclado cada vez que el usuario presione una tecla
        document.addEventListener('keydown', (e)=> this.handleKeyPress(e));

        // Botones del menu
        this.menuOptions.forEach((option, index)=>{
            option.addEventListener('click',() => this.selectMenuOption(index));
        })

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

        // Botones para volver
        this.backToMenuBtn.addEventListener('click', () => this.showMenu());
        this.backToMenuBtn2.addEventListener('click', () => this.showMenu());

    }

    // === Control de teclado general ===
    private handleKeyPress(e: KeyboardEvent): void {
        if (this.currentScreen === 'menu') {
            this.handleMenuNavigation(e);
        } else if (this.currentScreen === 'login' || this.currentScreen === 'register') {
            this.handleFormNavigation(e);
        }
    }

    // == Menu principal ==
    private handleMenuNavigation(e: KeyboardEvent): void {
        if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) e.preventDefault();

        if (e.key === 'ArrowUp') this.changeSelection(-1);
        else if (e.key === 'ArrowDown') this.changeSelection(1);
        else if (e.key === 'Enter') this.activateSelectedOption();
    }

    private changeSelection(direction: number): void {
        this.menuOptions[this.selectedIndex].classList.remove('selected');
        this.selectedIndex = (this.selectedIndex + direction + this.menuOptions.length) % this.menuOptions.length;
        this.menuOptions[this.selectedIndex].classList.add('selected');
    }

    private selectMenuOption(index: number): void {
        this.selectedIndex = index;
        this.menuOptions.forEach(opt => opt.classList.remove('selected'));
        this.menuOptions[index].classList.add('selected');
        this.activateSelectedOption();
    }

    private activateSelectedOption(): void {
        const selected = this.menuOptions[this.selectedIndex];
        const action = selected.dataset.action;

        // Animación de salida
        this.menuOptions.forEach(opt => {
            if (opt !== selected) opt.classList.add('fade-out');
        });

        setTimeout(() => {
            if (action === 'login') this.showLogin();
            else if (action === 'register') this.showRegister();
            else if (action === 'guest') this.handleGuestLogin();
        }, 400);
    }
    private handleFormNavigation(e: KeyboardEvent): void {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.showMenu();
            return;
        }

        const inputs = this.currentFormInputs;
        if (!inputs.length) return;

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.inputIndex = (this.inputIndex - 1 + inputs.length) % inputs.length;
            inputs[this.inputIndex].focus();
        } else if (e.key === 'ArrowDown' || e.key === 'Tab') {
            e.preventDefault();
            this.inputIndex = (this.inputIndex + 1) % inputs.length;
            inputs[this.inputIndex].focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.currentScreen === 'login') this.loginForm.requestSubmit();
            if (this.currentScreen === 'register') this.registerForm.requestSubmit();
        }
    }

    private handleLogin(): void {
        const username = (document.getElementById('username') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        // Verificar campos vacios
        if (!username || !password) {
            this.showMessage(this.loginMessage, 'Completa todos los campos', false);
            return;
        }

        const result: AuthResponse = this.authService.login(username, password);

        this.showMessage(this.loginMessage, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                this.notifyAuthSuccess('login', result.user ?? null);
            }, 1000);
        }
    }

    private handleRegister(): void {
        const username = (document.getElementById('regUsername') as HTMLInputElement).value;
        const password = (document.getElementById('regPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('regConfirmPassword') as HTMLInputElement).value;

        if (!username || !password || !confirmPassword) {
            this.showMessage(this.registerMessage, 'Completa todos los campos', false);
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage(this.registerMessage, 'Las contraseñas no coinciden', false);
            return;
        }

        const result: AuthResponse = this.authService.register(username, password);

        this.showMessage(this.registerMessage, result.message, result.success);

        if (result.success) {
            setTimeout(() => {
                const autoLogin = this.authService.login(username, password);
                const userData = autoLogin.success ? autoLogin.user ?? null : null;
                this.showMessage(this.registerMessage, autoLogin.message, autoLogin.success);
                if (autoLogin.success) {
                    this.notifyAuthSuccess('register', userData);
                } else {
                    this.showLogin();
                    (document.getElementById('username') as HTMLInputElement).value = username;
                }
            }, 1200);
        }
    }

    private handleGuestLogin(): void {
        const result: AuthResponse = this.authService.loginAsGuest();
        
        if (result.success) {
            this.notifyAuthSuccess('guest', result.user ?? null);
        }
    }

    // == Pantallas ==
    public showMenu(): void {
        this.hideAll();
        this.selectedIndex = 0;
        this.menuScreen.style.display = 'flex';
        this.menuOptions.forEach(opt => opt.classList.remove('fade-out'));
        this.currentScreen = 'menu';
        this.menuOptions.forEach(opt => opt.classList.remove('selected'));
        this.menuOptions[this.selectedIndex]?.classList.add('selected');
    }
    private showLogin(): void {
        this.hideAll();
        this.loginScreen.style.display = 'flex';
        //this.registerScreen.style.display = 'none';
        this.currentScreen = 'login';
        this.currentFormInputs = Array.from(this.loginForm.querySelectorAll('input'));
        this.inputIndex = 0;
        this.currentFormInputs[0]?.focus();
    }

    private showRegister(): void {
        this.hideAll();
        this.registerScreen.style.display = 'flex';
        this.currentScreen = 'register';
        this.currentFormInputs = Array.from(this.registerForm.querySelectorAll('input'));
        this.inputIndex = 0;
        this.currentFormInputs[0]?.focus();
    }

    public resetToLogin(): void {
        this.hideAll();
        this.selectedIndex = 0;
        this.menuOptions.forEach(opt => opt.classList.remove('fade-out', 'selected'));
        this.menuOptions[this.selectedIndex]?.classList.add('selected');
        this.currentScreen = 'menu';
        this.menuScreen.style.display = 'flex';
        this.gameCanvas.style.display = 'none';
    }

    private hideAll(): void {
        const screens: (HTMLElement | undefined)[] = [
            this.menuScreen,
            this.loginScreen,
            this.registerScreen,
            this.gameCanvas,
            this.mainMenuScreen
        ];
        screens
            .filter((el): el is HTMLElement => Boolean(el))
            .forEach(el => el.style.display = 'none');
    }

    private showMessage(element: HTMLElement, message: string, isSuccess: boolean): void {
        element.textContent = message;
        element.className = 'message';
        element.classList.add(isSuccess ? 'success' : 'error');
    }

    public init(): void {
        this.authService.init();
        this.showMenu();
    }

    private notifyAuthSuccess(mode: AuthMode, user: User | null): void {
        this.hideAll();
        this.currentScreen = 'mainMenu';
        this.callbacks.onAuthSuccess?.({ mode, user });
    }
}

export default LoginManager;