import { Game } from './core/game';
import LoginManager from './ui/loginManager';
import { MainMenuManager } from './scenes/DIANA/mainMenuManager';

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

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('configModal');
  const saveBtn = document.getElementById('saveConfigBtn') as HTMLButtonElement | null;
  const volume = document.getElementById('volumeRange') as HTMLInputElement | null;
  const difficulty = document.getElementById('difficultySelect') as HTMLSelectElement | null;
  const fullscreen = document.getElementById('fullscreenToggle') as HTMLInputElement | null;

  if (!modalEl || !saveBtn || !volume || !difficulty || !fullscreen) return;

  const bootstrapGlobal = (window as any).bootstrap;
  const modal = bootstrapGlobal?.Modal?.getOrCreateInstance(modalEl);
  if (!modal) return;

  const saved = localStorage.getItem('gameSettings');
  if (saved) {
    const persisted = JSON.parse(saved);
    if (typeof persisted.volume === 'number') {
      volume.value = String(persisted.volume);
    }
    if (typeof persisted.difficulty === 'string') {
      difficulty.value = persisted.difficulty;
    }
    if (typeof persisted.fullscreen === 'boolean') {
      fullscreen.checked = persisted.fullscreen;
    }
  }

  saveBtn.addEventListener('click', () => {
    const settings = {
      volume: Number.parseInt(volume.value, 10),
      difficulty: difficulty.value,
      fullscreen: fullscreen.checked,
    };

    localStorage.setItem('gameSettings', JSON.stringify(settings));

    if ((window as any).game?.sound) {
      (window as any).game.sound.volume = settings.volume / 100;
    }

    modal.hide();
  });
});