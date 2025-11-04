import { Game } from './core/game';
import LoginManager from './ui/loginManager';


import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";

// Inicializar el sistema de login
const loginManager: LoginManager = new LoginManager();
loginManager.init();

// Esperar a que se complete el login antes de iniciar el juego
window.addEventListener('startGame', () => {
    // Inicializar el juego
    const game: Game = new Game();
    game.start();
});

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveConfigBtn")!;
  const volume = document.getElementById("volumeRange") as HTMLInputElement;
  const difficulty = document.getElementById("difficultySelect") as HTMLSelectElement;
  const fullscreen = document.getElementById("fullscreenToggle") as HTMLInputElement;

  // Cargar configuración guardada
  const saved = localStorage.getItem("gameSettings");
  if (saved) {
    const s = JSON.parse(saved);
    volume.value = s.volume;
    difficulty.value = s.difficulty;
    fullscreen.checked = s.fullscreen;
  }

  // Guardar configuración
  saveBtn.addEventListener("click", () => {
    const settings = {
      volume: parseInt(volume.value),
      difficulty: difficulty.value,
      fullscreen: fullscreen.checked,
    };

    localStorage.setItem("gameSettings", JSON.stringify(settings));

    // Aplicar al juego si está cargado
    if ((window as any).game?.sound) {
      (window as any).game.sound.volume = settings.volume / 100;
    }

    // Cerrar modal usando Bootstrap API
    const modalEl = document.getElementById('configModal')!;
    const modal = Modal.getInstance(modalEl);
    modal?.hide();
  });
});