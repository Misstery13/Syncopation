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

// --- Main Menu Soundtrack Logic ---
const menuMusic = new Audio('assets/audio/test.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.5; // Default volume

// Attempt to play immediately
menuMusic.play().catch(() => {
  console.log('Autoplay blocked. Waiting for user interaction to play menu music.');
  const playOnInteraction = () => {
    menuMusic.play();
    document.removeEventListener('click', playOnInteraction);
    document.removeEventListener('keydown', playOnInteraction);
  };
  document.addEventListener('click', playOnInteraction);
  document.addEventListener('keydown', playOnInteraction);
});

// --- Button Sound Logic ---
const btnSound = new Audio('assets/audio/sfx/btnSound.mp3');
btnSound.volume = 0.5;

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  // Check if the clicked element or its parent is a button or menu option
  const clickable = target.closest('button, .btn, .menu-option');

  if (clickable) {
    // Clone the node to allow overlapping sounds if clicked rapidly
    const soundClone = btnSound.cloneNode() as HTMLAudioElement;
    soundClone.volume = btnSound.volume;
    soundClone.play().catch(e => console.warn('Button sound blocked', e));
  }
});

window.addEventListener('startGame', () => {
  // Stop menu music when game starts
  menuMusic.pause();
  menuMusic.currentTime = 0;

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
      // Apply saved volume to global audio
      menuMusic.volume = persisted.volume / 100;
      btnSound.volume = persisted.volume / 100;
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

    // Update global audio volume
    menuMusic.volume = settings.volume / 100;
    btnSound.volume = settings.volume / 100;

    modal.hide();
  });
});