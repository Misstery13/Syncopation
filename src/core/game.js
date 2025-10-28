// Clase principal del juego
export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        
        // Ajustar tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🎮 Juego iniciado');
        
        // Aquí puedes agregar tu lógica del juego
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Tu lógica de juego aquí

        // Continuar el loop
        requestAnimationFrame(() => this.gameLoop());
    }

    stop() {
        this.isRunning = false;
        console.log('⏸ Juego detenido');
    }
}
