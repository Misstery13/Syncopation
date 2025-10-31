import { GameState, GameConfig } from '../types/index.js';
import { setGameStart, setGameStoped, setLevelUp, getPoints } from './domain.js';

// Clase principal del juego


/**
 * Aquí hay muchas funciones imperativas que manejan el ciclo de vida del juego,
 * pero todas las modificaciones al estado del juego se hacen a través de
 * funciones puras importadas desde el núcleo (domain.ts).
 */
export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;


    // Declaramos que el juego no está corriendo al inicio
    private isRunning: boolean = false;

    // Este es un estado del juego mutable para definir el estado actual y 
    // cambiar el estado del que sí es mutable.
    private gameState: GameState;

    private config: GameConfig;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.isRunning = false;

        // Configuración inicial del juego
        this.config = {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            }
        };

        // Estado inicial del juego
        this.gameState = {
            isRunning: false,
            isPaused: false,
            currentTimeMs: 0,
            currentScene: 'menu',
            score: 0,
            level: 1,
            precision: 0,
            isGameStoped: false,
            song: {
                idSong: '',
                difficulty: 'normal',
                tempos: []
            },


        };

        // Ajustar tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.config.width = window.innerWidth;
            this.config.height = window.innerHeight;
            this.resizeCanvas();
        });
    }



    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('🎮 Juego iniciado');

        // 2. Llamada a la Función Pura del Núcleo para obtener el NUEVO estado
        // Note que se llama a la función pura y se asigna el resultado (el nuevo objeto)
        this.gameState = setGameStart(this.gameState);

        // Aquí puedes agregar tu lógica del juego
        this.gameLoop();
    }

    private resizeCanvas(): void {
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
    }



    private gameLoop(): void {
        if (!this.isRunning) return;

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Tu lógica de juego aquí

        // Continuar el loop
        requestAnimationFrame(() => this.gameLoop());
    }

    public stop(): void {
        // 1. Llamada a la Función Pura del Núcleo para obtener el NUEVO estado
        this.gameState = setGameStoped(this.gameState);

        // 2. Lógica Imperativa local
        this.isRunning = false;
        console.log('⏸ Juego detenido');
    }

    public getState(): GameState {
        return { ...this.gameState };
    }

    public updateScore(): void {
        this.gameState = getPoints(this.gameState); //implementar getPoints en domain.ts
        console.log(`El jugador ha obtenido un punto. Total: ${this.gameState.score}`);

        // 1. Llamada a la Función Pura del Núcleo para obtener el NUEVO estado
        this.gameState = getPoints(this.gameState);

        // No hay efectos secundarios específicos, solo la actualización de la referencia.
        console.log(`Nivel avanzado a: ${this.gameState.level}`);
    }

    public nextLevel(): void {
        // 1. Llamada a la Función Pura del Núcleo para obtener el NUEVO estado
        this.gameState = setLevelUp(this.gameState);

        // No hay efectos secundarios específicos, solo la actualización de la referencia.
        console.log(`Nivel avanzado a: ${this.gameState.level}`);
    }
}

