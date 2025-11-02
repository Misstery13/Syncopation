import { Game } from './core/game';
import LoginManager from './ui/loginManager';

// Inicializar el sistema de login
const loginManager: LoginManager = new LoginManager();
loginManager.init();

// Esperar a que se complete el login antes de iniciar el juego
window.addEventListener('startGame', () => {
    // Inicializar el juego
    const game: Game = new Game();
    game.start();
});