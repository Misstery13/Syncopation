import { Game } from './core/game.js';
import LoginManager from './ui/loginManager.js';

// Inicializar el sistema de login
const loginManager = new LoginManager();
loginManager.init();

// Esperar a que se complete el login antes de iniciar el juego
window.addEventListener('startGame', () => {
    // Inicializar el juego
    const game = new Game();
    game.start();
});