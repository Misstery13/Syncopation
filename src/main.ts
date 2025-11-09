import { Game } from './core/game';
import LoginManager from './ui/loginManager';
import { MainMenuManager } from './scenes/DIANA/mainMenuManager';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';

let loginManager: LoginManager;
const mainMenu = new MainMenuManager({
  onLogout: () => {
    loginManager.resetToLogin();
  },
});

loginManager = new LoginManager({
  onAuthSuccess: (payload) => {
    mainMenu.show(payload);
  },
});

loginManager.init();

window.addEventListener('startGame', () => {
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