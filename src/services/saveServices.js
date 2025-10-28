import AuthService from './authService.js';

class SaveService {
    constructor() {
        this.authService = new AuthService();
    }

    // Guardar progreso del juego
    save(gameState) {
        const progress = {
            level: gameState.level,
            score: gameState.score,
            playerPosition: gameState.playerPosition,
            inventory: gameState.inventory,
            settings: gameState.settings
        };

        return this.authService.saveProgress(progress);
    }

    // Cargar progreso guardado
    load() {
        return this.authService.loadProgress();
    }

    // Verificar si el usuario tiene cuenta
    hasAccount() {
        const user = this.authService.getCurrentUser();
        return user && !user.isGuest;
    }
}

export default SaveService;