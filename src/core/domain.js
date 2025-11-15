/**
 * Aquí vivirán todas las funciones puras necesarias para el manejo del estado del juego.
 * Todos los cambios de estado deben hacerse a través de estas funciones.
 */
/**
 * Función pura para pausar el juego. (Similar a 'pausarJuego' en las fuentes [8])
 * @param currentState El estado inmutable actual.
 * @returns Un nuevo EstadoJuego con 'isPaused' en true.
 */
export function setGamePaused(currentState) {
    return {
        ...currentState,
        isPaused: true
    };
}
export function setGameStoped(currentState) {
    return {
        ...currentState,
        isGameStoped: true
    };
}
/**
     * Devuelve un nuevo estado configurado para empezar a jugar.
     * @param currentState El estado inmutable actual.
     * @returns Un nuevo EstadoJuego con 'estaEnPausa' en false.
     */
export function setGameStart(currentState) {
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
export function setLevelUp(currentState) {
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
export function addPoint(currentState) {
    // Reutilizamos addScore para mantener la lógica de no-negatividad.
    return addScore(currentState, 1);
}
/**
 * Establece la puntuación absoluta del juego (pura).
 * @param currentState Estado actual inmutable
 * @param score Nueva puntuación a fijar
 */
export function setScore(currentState, score) {
    return {
        ...currentState,
        score: Math.max(0, Number.isFinite(score) ? score : currentState.score)
    };
}
/**
 * Añade (o resta) puntos a la puntuación actual de forma pura.
 * @param currentState Estado actual inmutable
 * @param delta Valor a sumar (puede ser negativo)
 */
export function addScore(currentState, delta) {
    const current = Number.isFinite(currentState.score) ? currentState.score : 0;
    const add = Number.isFinite(delta) ? delta : 0;
    const next = Math.max(0, current + add);
    return {
        ...currentState,
        score: next
    };
}
/**
 * Ajusta la precisión (precision) del estado de forma pura.
 * Se asegura que la precision esté entre 0 y 100.
 */
export function setPrecision(currentState, precision) {
    const p = Number.isFinite(precision) ? precision : currentState.precision;
    const clamped = Math.max(0, Math.min(100, p));
    return {
        ...currentState,
        precision: clamped
    };
}
/**
 * Establece el tiempo actual de la canción en milisegundos (puro).
 */
export function setCurrentTimeMs(currentState, timeMs) {
    const t = Number.isFinite(timeMs) ? timeMs : currentState.currentTimeMs;
    return {
        ...currentState,
        currentTimeMs: Math.max(0, t)
    };
}
/**
 * Cambia la escena actual de forma pura.
 */
export function setCurrentScene(currentState, scene) {
    return {
        ...currentState,
        currentScene: String(scene ?? currentState.currentScene)
    };
}
/**
 * Establece la canción (SongDefinition) en el estado de forma pura.
 */
export function setSong(currentState, song) {
    return {
        ...currentState,
        song
    };
}
/**
 * Reanuda el juego (quita la pausa) de forma pura.
 */
export function resumeGame(currentState) {
    return {
        ...currentState,
        isPaused: false,
        isRunning: true
    };
}
