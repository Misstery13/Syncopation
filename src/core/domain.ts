import { GameState } from '../types/index.js';

/**
 * Aquí vivirán todas las funciones puras necesarias para el manejo del estado del juego.
 * Todos los cambios de estado deben hacerse a través de estas funciones.
 */



/**
 * Función pura para pausar el juego. (Similar a 'pausarJuego' en las fuentes [8])
 * @param currentState El estado inmutable actual.
 * @returns Un nuevo EstadoJuego con 'isPaused' en true.
 */
export function setGamePaused(currentState: GameState): GameState {
    return {
        ...currentState,
        isPaused: true
    };
}

export function setGameStoped(currentState: GameState): GameState {
    return {
        ...currentState,
        isGameStoped: true
    };
}

/**
     * Devuelve un nuevo estado configurado para empezar a jugar.
     * @param estadoActual El estado inmutable actual.
     * @returns Un nuevo EstadoJuego con 'estaEnPausa' en false.
     */
export function setGameStart(currentState: GameState): GameState {
    // Clonación del estado y modificación de la propiedad
    return {
        ...currentState,
        isRunning: true,
        isPaused: false
    };
}


/**
 * Devuelve un nuevo estado con el nivel incrementado.
 * 
 * Se podría hacer un if y si todo está bien, llamar a esta funcion
 * para verificar si el nivel máximo ha sido alcanzado.
 * y así evitar incrementar más allá del nivel permitido.
 * 
 * @param currentState El estado inmutable actual.
 * @returns Un nuevo EstadoJuego con 'level' aumentado en 1.
 */
export function setLevelUp(currentState: GameState): GameState {
    return {
        ...currentState,
        level: currentState.level + 1 // Incrementamos la propiedad en el nuevo objeto
    };
}

/**
 * @description Devuelve un nuevo estado con los puntos incrementados.
 * @param currentState 
 * @returns 
 */
export function getPoints(currentState: GameState): GameState {
    return {
        ...currentState,
        score: currentState.score + 1 // Incrementamos los puntos en 1.
    };
}