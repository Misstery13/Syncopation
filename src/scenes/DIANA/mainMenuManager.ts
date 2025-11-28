import { LevelSelectManager } from '../ANGEL/levelScreenManager';
import { initStatsScreen } from '../CARLOS/statsController';
import { registerCreditsNavigation, openCredits } from '../SAID/saidScreen';
// import { initRhythmScreen } from '../CARLOS/gameplayController';
// import { SONG_TEST_LEVEL } from '../CARLOS/gameplayTypes';
import { loadKarateKatLevel } from '../CARLOS/karateLevelLoader';
import type { User } from '../../types';

// Nota: El CSS se carga desde public/assets/css/style.css (index.html).
// Se removieron imports relativos a CSS para evitar que el bundler intente resolver archivos dentro de src.

type SceneId =
  | 'start-game'
  | 'angel-levels'
  | 'carlos-stats'
  | 'diana-screen'
  | 'paulo-screen'
  | 'said-credits';

type MenuItemData = {
  id: SceneId;
  label: string;
  description: string;
};

type AuthMode = 'login' | 'register' | 'guest';

type AuthContext = {
  mode: AuthMode;
  user?: User | null;
};

type MainMenuCallbacks = {
  onLogout?: () => void;
};

function createSceneMenuItems(): MenuItemData[] {
  return [
    {
      id: 'angel-levels',
      label: 'Selección de Niveles (Ángel)',
      description: 'Explora los niveles creados por Ángel y elige una canción para jugar.',
    },
    {
      id: 'carlos-stats',
      label: 'Estadísticas del Jugador (Carlos)',
      description: 'Consulta tu progreso, puntajes y logros recopilados por Carlos.',
    },
    {
      id: 'said-credits',
      label: 'Créditos Interactivos (Said)',
      description: 'Agradece a todo el equipo con la experiencia de créditos de Said.',
    },
  ];
}

export class MainMenuManager {
  private readonly screen: HTMLElement;
  private readonly optionsList: HTMLUListElement;
  private readonly description: HTMLElement;
  private readonly subtitle: HTMLElement;
  private readonly appRoot: HTMLElement;
  private readonly logoutBtn: HTMLButtonElement;
  private readonly gameCanvas: HTMLCanvasElement;
  private readonly menuPanel: HTMLElement;

  private readonly items: MenuItemData[] = createSceneMenuItems();
  private readonly optionElements: HTMLLIElement[] = [];

  private currentIndex = 0;
  private isActive = false;
  private authContext: AuthContext | null = null;
  private readonly callbacks: MainMenuCallbacks;

  private readonly handleKeyDownBound = (event: KeyboardEvent) => this.handleKeyDown(event);
  private readonly handleNavigateToMenuBound = () => this.resumeFromExternalNavigation();
  private readonly handleUiNavigateBound = (event: Event) => this.handleUiNavigate(event);

  constructor(callbacks?: MainMenuCallbacks) {
    const screen = document.getElementById('mainMenuScreen');
    const optionsList = document.getElementById('mainMenuOptions') as HTMLUListElement | null;
    const description = document.getElementById('mainMenuDescription');
    const subtitle = document.getElementById('mainMenuSubtitle');
    const appRoot = document.getElementById('app-root');
    const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement | null;
    const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
    const menuPanel = document.querySelector('.main-menu-panel') as HTMLElement | null;

    if (!screen || !optionsList || !description || !subtitle || !appRoot || !logoutBtn || !gameCanvas || !menuPanel) {
      throw new Error('[MainMenuManager] Elementos críticos del DOM no encontrados');
    }

    this.screen = screen;
    this.optionsList = optionsList;
    this.description = description;
    this.subtitle = subtitle;
    this.appRoot = appRoot;
    this.logoutBtn = logoutBtn;
    this.gameCanvas = gameCanvas;
    this.menuPanel = menuPanel;
    this.callbacks = callbacks ?? {};

    registerCreditsNavigation();
    this.renderMenu();
    this.logoutBtn.addEventListener('click', () => this.handleLogout());

    document.addEventListener('navigateToMenu', this.handleNavigateToMenuBound);
    window.addEventListener('ui:navigate', this.handleUiNavigateBound);
  }

  public show(context: AuthContext): void {
    this.authContext = context;
    this.isActive = true;
    this.screen.style.display = 'flex';
    this.screen.classList.remove('hidden');
    this.gameCanvas.style.display = 'none';

    // Asegurar que el panel del menú esté visible
    this.menuPanel.style.display = 'flex';
    // Restaurar los estilos del contenido
    this.appRoot.style.width = '';
    this.appRoot.style.maxWidth = '';
    this.appRoot.style.display = '';
    this.appRoot.style.alignItems = '';
    this.appRoot.style.justifyContent = '';
    this.appRoot.style.padding = '';
    // Remover clase de estadísticas
    this.appRoot.classList.remove('stats-view');

    this.renderSubtitle();
    this.highlightOption(0);
    this.clearContent();
    this.renderPlaceholder('Selecciona una experiencia para comenzar.');
    this.attachKeyboard();
  }

  public hide(): void {
    this.isActive = false;
    this.screen.style.display = 'none';
    this.screen.classList.add('hidden');
    this.detachKeyboard();
  }

  private renderMenu(): void {
    this.optionsList.innerHTML = '';
    this.optionElements.length = 0;

    this.items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'menu-option';
      li.dataset.sceneId = item.id;
      li.textContent = item.label;
      li.tabIndex = 0;

      li.addEventListener('click', () => {
        this.highlightOption(index);
        this.activateSelection();
      });

      li.addEventListener('mouseenter', () => this.highlightOption(index));
      li.addEventListener('focus', () => this.highlightOption(index));

      this.optionsList.appendChild(li);
      this.optionElements.push(li);
    });
  }

  private renderSubtitle(): void {
    if (!this.authContext) {
      this.subtitle.textContent = '';
      return;
    }

    const username = this.authContext.user?.username ?? 'Invitado';
    const modeLabel =
      this.authContext.mode === 'guest'
        ? 'Sesión como invitado'
        : this.authContext.mode === 'register'
          ? 'Cuenta recién creada'
          : 'Sesión iniciada';

    this.subtitle.textContent = `${modeLabel}: ${username}`;
  }

  private highlightOption(index: number): void {
    if (index < 0 || index >= this.optionElements.length) return;

    this.optionElements[this.currentIndex]?.classList.remove('selected');
    this.currentIndex = index;
    this.optionElements[this.currentIndex]?.classList.add('selected');
    this.updateDescription();
  }

  private updateDescription(): void {
    const currentItem = this.items[this.currentIndex];
    this.description.textContent = currentItem?.description ?? '';
  }

  private attachKeyboard(): void {
    document.addEventListener('keydown', this.handleKeyDownBound);
  }

  private detachKeyboard(): void {
    document.removeEventListener('keydown', this.handleKeyDownBound);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive) return;

    if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowUp':
        this.moveSelection(-1);
        break;
      case 'ArrowDown':
        this.moveSelection(1);
        break;
      case 'Enter':
        this.activateSelection();
        break;
      case 'Escape':
        this.handleLogout();
        break;
      default:
        break;
    }
  }

  private moveSelection(direction: number): void {
    const total = this.optionElements.length;
    if (total === 0) return;
    const nextIndex = (this.currentIndex + direction + total) % total;
    this.highlightOption(nextIndex);
  }

  private activateSelection(): void {
    const item = this.items[this.currentIndex];
    if (!item) return;

    switch (item.id) {
      case 'start-game':
        this.launchBaseGame();
        break;
      case 'angel-levels':
        this.openAngelLevels();
        break;
      case 'carlos-stats':
        this.openCarlosStats();
        break;
      case 'diana-screen':
        this.showPlaceholder(
          'La experiencia de Diana está en preparación. ¡Pronto descubrirás su mundo!'
        );
        break;
      case 'paulo-screen':
        this.showPlaceholder(
          'Paulo está ajustando los últimos detalles sonoros. ¡Mantente atento!'
        );
        break;
      case 'said-credits':
        this.openSaidCredits();
        break;
      default:
        break;
    }
  }

  private launchBaseGame(): void {
    this.hide();
    this.detachKeyboard();
    this.gameCanvas.style.display = 'block';
    window.dispatchEvent(new CustomEvent('startGame'));
  }

  private openAngelLevels(): void {
    this.detachKeyboard();
    // Ocultar el panel del menú principal para evitar superposición
    this.menuPanel.style.display = 'none';

    const level = this.authContext?.user?.progress?.level ?? 1;
    const manager = new LevelSelectManager(level);

    manager
      .show()
      .then((selection) => {
        // Al seleccionar "Jugar" abrimos la pantalla de gameplay dentro de la app
        try {
          this.clearContent();
          // Hacer que el contenido ocupe todo el espacio y centre el contenido
          this.appRoot.style.width = '100%';
          this.appRoot.style.maxWidth = '100%';
          this.appRoot.style.display = 'flex';
          this.appRoot.style.alignItems = 'center';
          this.appRoot.style.justifyContent = 'center';

          // Abrir la ventana del nivel dentro de la misma página
          loadKarateKatLevel(selection, () => this.resumeFromExternalNavigation());
        } catch (e) {
          this.showPlaceholder(`No se pudo cargar la pantalla de prueba para ${selection.levelId}.`);
        }
      })
      .catch(() => {
        // Selección cancelada, simplemente volvemos al menú principal
        console.debug('[MainMenuManager] Level selection cancelled');
      })
      .finally(() => {
        // Restaurar el panel del menú principal
        this.menuPanel.style.display = 'flex';
        if (this.isActive) this.attachKeyboard();
      });
  }

  private openCarlosStats(): void {
    this.detachKeyboard();
    this.clearContent();
    // Ocultar sólo los elementos del panel lateral (dejar `#app-root` visible)
    try {
      Array.from(this.menuPanel.children).forEach((child) => {
        const el = child as HTMLElement;
        if (el.id === 'app-root') {
          el.style.display = ''; // mantener visible
        } else {
          el.style.display = 'none';
        }
      });
    } catch (err) {
      console.warn('[MainMenuManager] Could not selectively hide children of menuPanel, falling back to hide whole panel', err);
      this.menuPanel.style.display = 'none';
    }
    // Hacer que el contenido ocupe todo el espacio y centre el contenido
    this.appRoot.style.width = '100%';
    this.appRoot.style.maxWidth = '100%';
    this.appRoot.style.display = 'flex';
    this.appRoot.style.alignItems = 'center';
    this.appRoot.style.justifyContent = 'center';
    // Padding responsivo - se maneja mejor con CSS media queries
    this.appRoot.style.padding = '';
    // Agregar clase para estilos CSS específicos
    this.appRoot.classList.add('stats-view');
    try {
      console.debug('[MainMenuManager] Opening Carlos stats screen');
      initStatsScreen();
      console.debug('[MainMenuManager] initStatsScreen() completed');
    } catch (err) {
      console.error('[MainMenuManager] Error calling initStatsScreen', err);
    }
  }

  private openSaidCredits(): void {
    this.detachKeyboard();
    openCredits();
  }

  private clearContent(): void {
    this.appRoot.innerHTML = '';
  }

  private showPlaceholder(message: string): void {
    this.clearContent();
    const wrapper = document.createElement('div');
    wrapper.className = 'main-menu-placeholder';
    wrapper.innerHTML = `
      <p>${message}</p>
      <button class="btn-secondary" type="button">Volver al menú</button>
    `;

    const backBtn = wrapper.querySelector('button') as HTMLButtonElement;
    backBtn.addEventListener('click', () => this.resumeFromExternalNavigation());

    this.appRoot.appendChild(wrapper);
  }

  private renderPlaceholder(message: string): void {
    this.clearContent();
    const text = document.createElement('p');
    text.className = 'main-menu-helper';
    text.textContent = message;
    this.appRoot.appendChild(text);
  }

  private handleLogout(): void {
    this.hide();
    this.clearContent();
    this.callbacks.onLogout?.();
  }

  private resumeFromExternalNavigation(): void {
    if (!this.authContext) return;
    // Restaurar el panel del menú cuando se regresa
    // Restaurar visibilidad de los elementos del panel lateral
    try {
      Array.from(this.menuPanel.children).forEach((child) => {
        const el = child as HTMLElement;
        el.style.display = '';
      });
    } catch (err) {
      this.menuPanel.style.display = 'flex';
    }
    // Restaurar los estilos del contenido
    this.appRoot.style.width = '';
    this.appRoot.style.maxWidth = '';
    this.appRoot.style.display = '';
    this.appRoot.style.alignItems = '';
    this.appRoot.style.justifyContent = '';
    this.appRoot.style.padding = '';
    // Remover clase de estadísticas
    this.appRoot.classList.remove('stats-view');
    this.show(this.authContext);
  }

  private handleUiNavigate(event: Event): void {
    const customEvent = event as CustomEvent;
    const target = customEvent.detail?.to;
    if (target === 'main-menu') {
      this.resumeFromExternalNavigation();
    }
  }
}