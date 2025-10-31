import AuthService from './autenticacion.ts';
import { GameState, SaveResponse, GameProgress } from '../types/index.ts';

class SaveService {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Guardar progreso del juego
    public save(gameState: GameState): SaveResponse {
        const progress: GameProgress = {
            level: gameState.level,
            score: gameState.score,
            playerPosition: gameState.playerPosition,
            inventory: gameState.inventory,
            settings: gameState.settings,
            lastSaved: new Date().toISOString()
        };

        return this.authService.saveProgress(progress);
    }

    // Cargar progreso guardado
    public load(): SaveResponse {
        return this.authService.loadProgress();
    }

    // Verificar si el usuario tiene cuenta
    public hasAccount(): boolean {
        const user = this.authService.getCurrentUser();
        return user !== null && !user.isGuest;
    }
}

export default SaveService;