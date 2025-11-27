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

// Intentar reproducir inmediatamente (con fallback si el navegador bloquea autoplay)
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
    soundClone.play().catch(e => console.warn('Sonido bloqueado', e));
  }
});

// Evento global para iniciar el juego
window.addEventListener('startGame', () => {
  menuMusic.pause();
  menuMusic.currentTime = 0;
  const game: Game = new Game();
  game.start();
});

// --- 3. LÓGICA DEL DOM (Configuración y Navegación UI) ---
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
      menuMusic.volume = persisted.volume / 100;
      btnSound.volume = persisted.volume / 100;
    }
    if (difficulty && typeof persisted.difficulty === 'string') {
      difficulty.value = persisted.difficulty;
    }
    if (fullscreen && typeof persisted.fullscreen === 'boolean') {
      fullscreen.checked = persisted.fullscreen;
    }
  }

  // Guardar configuración
  saveBtn.addEventListener('click', () => {
    const settings = {
      volume: Number.parseInt(volume.value, 10),
      difficulty: difficulty ? difficulty.value : 'normal',
      fullscreen: fullscreen ? fullscreen.checked : false,
    };

    localStorage.setItem('gameSettings', JSON.stringify(settings));

    // Actualizar volumen del juego si ya existe la instancia
    if ((window as any).game?.sound) {
      (window as any).game.sound.volume = settings.volume / 100;
    }

    // Actualizar volumen del menú actual
    menuMusic.volume = settings.volume / 100;
    btnSound.volume = settings.volume / 100;

    if (modal) modal.hide();
  });
});