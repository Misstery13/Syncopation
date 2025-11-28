import { Game } from './core/game';
import LoginManager from './ui/loginManager';
import { MainMenuManager } from './scenes/DIANA/mainMenuManager';

// --- 1. INICIALIZACIÓN DEL LOGIN Y MENÚ ---
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

// --- 2. SISTEMA DE AUDIO (Música y Efectos) ---
const menuMusic = new Audio('assets/audio/test.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.5;

// Intentar reproducir de inmediato
menuMusic.play().catch(() => {
  console.log('Autoplay bloqueado. Esperando interacción del usuario.');
  const playOnInteraction = () => {
    menuMusic.play();
    document.removeEventListener('click', playOnInteraction);
    document.removeEventListener('keydown', playOnInteraction);
  };
  document.addEventListener('click', playOnInteraction);
  document.addEventListener('keydown', playOnInteraction);
});

const btnSound = new Audio('assets/audio/sfx/btnSound.mp3');
btnSound.volume = 0.5;

// Manejo global de sonidos de botones
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const clickable = target.closest('button, .btn, .menu-option');

  if (clickable) {
    const soundClone = btnSound.cloneNode() as HTMLAudioElement;
    soundClone.volume = btnSound.volume;
    soundClone.muted = btnSound.muted;
    soundClone.play().catch(e => console.warn('Button sound blocked', e));
  }
});

// Evento global para iniciar el juego
window.addEventListener('startGame', () => {
  menuMusic.pause();
  menuMusic.currentTime = 0;
  const game: Game = new Game();
  game.start();
});

// --- Helper para Pantalla Completa ---
function applyFullscreen(enabled: boolean) {
  const elem = document.documentElement;

  if (enabled) {
    if (!document.fullscreenElement && elem.requestFullscreen) {
      elem.requestFullscreen().catch((e) => {
        console.warn('No se pudo activar pantalla completa', e);
      });
    }
  } else {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((e) => {
        console.warn('No se pudo salir de pantalla completa', e);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  
  // A. Referencias a elementos del DOM
  const modalEl = document.getElementById('configModal');
  const saveBtn = document.getElementById('saveConfigBtn') as HTMLButtonElement | null;
  const volume = document.getElementById('volumeRange') as HTMLInputElement | null;
  const difficulty = document.getElementById('difficultySelect') as HTMLSelectElement | null;
  const fullscreen = document.getElementById('fullscreenToggle') as HTMLInputElement | null;
  const levelOverlay = document.getElementById('levelSelectionOverlay'); // Referencia al Overlay de Niveles

  // B. Lógica de Navegación (Overlay de Niveles)
  // Usamos delegación de eventos en el body para detectar clicks dinámicos
  document.body.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    // ABRIR: Si click en "Selección de Niveles" (botón del Hub)
    if (target.closest('[data-scene-id="angel-levels"]')) {
        if (levelOverlay) {
            levelOverlay.style.display = 'flex'; // 'flex' activa el centrado y el glass
        }
    }

    // CERRAR: Si click en "Volver al Menú" (dentro del overlay)
    if (target.closest('[data-action="navigate-back"]')) {
        if (levelOverlay) {
            levelOverlay.style.display = 'none';
        }
    }
    
    // JUGAR: Si click en "Jugar" (dentro del overlay)
    if (target.closest('[data-action="play-level"]')) {
        // Aquí puedes disparar el evento para iniciar el juego real
        const startEvent = new Event('startGame');
        window.dispatchEvent(startEvent);
        // Opcional: cerrar el overlay
        if (levelOverlay) levelOverlay.style.display = 'none';
    }
  });

  // C. Lógica del Modal de Configuración
  if (!modalEl || !saveBtn || !volume) return;

  const bootstrapGlobal = (window as any).bootstrap;
  const modal = bootstrapGlobal?.Modal?.getOrCreateInstance(modalEl);

  // Cargar configuración guardada
  const saved = localStorage.getItem('gameSettings');
  if (saved) {
    const persisted = JSON.parse(saved);
    if (typeof persisted.volume === 'number') {
      volume.value = String(persisted.volume);

      const normalized = persisted.volume / 100;
      const muted = persisted.volume === 0;

      // Apply saved volume to global audio
      menuMusic.volume = normalized;
      menuMusic.muted = muted;

      btnSound.volume = normalized;
      btnSound.muted = muted;
    }
    if (difficulty && typeof persisted.difficulty === 'string') {
      difficulty.value = persisted.difficulty;
    }
    if (fullscreen && typeof persisted.fullscreen === 'boolean') {
      fullscreen.checked = persisted.fullscreen;
      // Aplicar estado de pantalla completa guardado
      applyFullscreen(persisted.fullscreen);
    }
  }

  // Si el usuario sale con ESC, sincronizamos la casilla
  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    fullscreen.checked = isFs;
  });

  saveBtn.addEventListener('click', () => {
    const volumeValue = Number.parseInt(volume.value, 10);
    const normalized = volumeValue / 100;
    const muted = volumeValue === 0;

    const settings = {
      volume: volumeValue,
      difficulty: difficulty.value,
      fullscreen: fullscreen.checked,
    };

    localStorage.setItem('gameSettings', JSON.stringify(settings));

    // Si existe audio global de Phaser, aplicar también
    const gameAny = (window as any).game;
    if (gameAny?.sound) {
      gameAny.sound.volume = normalized;
      gameAny.sound.mute = muted;
    }

    // Update global audio volume (menú + click)
    menuMusic.volume = normalized;
    menuMusic.muted = muted;

    btnSound.volume = normalized;
    btnSound.muted = muted;

    // Aplicar / quitar pantalla completa según la casilla
    applyFullscreen(settings.fullscreen);

    if (modal) modal.hide();
  });
});
