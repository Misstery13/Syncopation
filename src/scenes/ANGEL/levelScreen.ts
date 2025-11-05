import { LevelDefinition, LEVEL_DATABASE } from './levelData';

/**
 * Helper robusto para buscar elementos en el DOM.
 */
function query<T extends HTMLElement>(scope: HTMLElement, selector: string): T {
  const el = scope.querySelector(selector) as T | null;
  if (!el) {
    throw new Error(`[LevelSelectionView] Selector crítico no encontrado: ${selector}`);
  }
  return el;
}

// Tipo para la selección de nivel
export type LevelSelection = {
    levelId: string;
    songFile: string;
};

// Tipo para los callbacks
type LevelViewCallbacks = {
  onPlay: (selection: LevelSelection) => void;
  onBack: () => void;
};

/**
 * Crea la vista de selección de nivel (Overlay HTML).
 * @param currentUserLevel El nivel actual del jugador.
 * @param callbacks Un objeto con las funciones onPlay y onBack.
 */
export function createLevelSelectionView(
  currentUserLevel: number,
  callbacks: LevelViewCallbacks
) {
  
  // --- 1. Crear el elemento raíz y su HTML interno ---
  const overlay = document.createElement('div');
  overlay.className = 'level-selection-overlay';
  overlay.tabIndex = -1; 
  
  overlay.innerHTML = `
    <div class="level-selection-content">
      <div class="level-list-container">
        <h2>Seleccionar Nivel</h2>
        <ul class="level-list">
          </ul>
        <button class="level-back-button" data-action="navigate-back">Volver al Menú</button>
      </div>
      
      <div class="level-details-container">
        <h3 id="level-title"></h3>
        <p id="level-description"></p>
        <div class="difficulty" id="level-difficulty"></div>
        <div id="level-requirement"></div>
        <button class="level-play-button" data-action="play-level">¡Jugar!</button>
      </div>
    </div>
  `;

  // --- 2. Obtener referencias robustas a los elementos ---
  const listUl = query<HTMLUListElement>(overlay, '.level-list');
  const backButton = query<HTMLButtonElement>(overlay, '.level-back-button');
  const playButton = query<HTMLButtonElement>(overlay, '.level-play-button');
  
  const titleEl = query<HTMLHeadingElement>(overlay, '#level-title');
  const descEl = query<HTMLParagraphElement>(overlay, '#level-description');
  const diffEl = query<HTMLDivElement>(overlay, '#level-difficulty');
  const reqEl = query<HTMLDivElement>(overlay, '#level-requirement');
  
  // --- 3. Estado Interno de la Vista ---
  let selectedIndex = 0;
  const currentLevels = LEVEL_DATABASE; 

  // --- 4. Lógica de Renderizado Interno ---

  function renderDetails(level: LevelDefinition, isLocked: boolean) {
    titleEl.textContent = level.title;
    descEl.textContent = level.description;
    diffEl.textContent = `Dificultad: ${level.difficulty}`;
    diffEl.className = 'difficulty'; 
    diffEl.classList.add(`difficulty-${level.difficulty.toLowerCase()}`);

    if (isLocked) {
      reqEl.textContent = `Requiere Nivel: ${level.requiresLevel}`;
      reqEl.className = 'locked';
      playButton.disabled = true;
      playButton.textContent = 'Bloqueado';
    } else {
      reqEl.textContent = `¡Desbloqueado!`;
      reqEl.className = 'unlocked';
      playButton.disabled = false;
      playButton.textContent = '¡Jugar!';
    }
  }

  function renderList() {
    listUl.innerHTML = ''; 
    
    currentLevels.forEach((level, index) => {
      const isLocked = level.requiresLevel > currentUserLevel;
      const li = document.createElement('li');
      li.className = 'level-item';
      li.dataset.index = index.toString();
      li.textContent = level.title;
      if (isLocked) li.classList.add('locked');
      if (index === selectedIndex) li.classList.add('selected');
      listUl.appendChild(li);
    });
    
    const initialLevel = currentLevels[selectedIndex];
    if (initialLevel) {
      const isLocked = initialLevel.requiresLevel > currentUserLevel;
      renderDetails(initialLevel, isLocked);
    }
  }

  function selectLevel(newIndex: number) {
    if (newIndex === selectedIndex) return; 

    const oldLi = query<HTMLLIElement>(overlay, `.level-item[data-index="${selectedIndex}"]`);
    oldLi.classList.remove('selected');

    selectedIndex = newIndex;

    const newLi = query<HTMLLIElement>(overlay, `.level-item[data-index="${selectedIndex}"]`);
    newLi.classList.add('selected');

    const level = currentLevels[selectedIndex];
    const isLocked = level.requiresLevel > currentUserLevel;
    renderDetails(level, isLocked);
  }

  // --- 5. Lógica de Acciones y Eventos ---

  function playSelectedLevel() {
    const level = currentLevels[selectedIndex];
    const isLocked = level.requiresLevel > currentUserLevel;
    
    if (level && !isLocked) {
      // ¡Ahora 'callbacks' existe y esto funciona!
      callbacks.onPlay({ 
        levelId: level.id,
        songFile: level.songFile 
      });
    }
  }

  function navigateBack() {
    // ¡Ahora 'callbacks' existe y esto funciona!
    callbacks.onBack();
  }
  
  // --- 6. Conexión de Event Listeners ---
  
  backButton.addEventListener('click', navigateBack);
  playButton.addEventListener('click', playSelectedLevel);

  listUl.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const item = target.closest('.level-item') as HTMLLIElement | null;
    if (item && item.dataset.index) {
      const index = parseInt(item.dataset.index, 10);
      selectLevel(index);
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case 'ArrowUp':
        const newIndexUp = (selectedIndex - 1 + currentLevels.length) % currentLevels.length;
        selectLevel(newIndexUp);
        break;
      case 'ArrowDown':
        const newIndexDown = (selectedIndex + 1) % currentLevels.length;
        selectLevel(newIndexDown);
        break;
      case 'Enter':
        playSelectedLevel();
        break;
      case 'Escape':
        navigateBack();
        break;
    }
  };

  // --- 7. API Pública de la Vista ---
  
  function show() {
    renderList(); 
    document.body.appendChild(overlay);
    window.addEventListener('keydown', handleKeyDown);
    overlay.focus();
  }

  function hide() {
    window.removeEventListener('keydown', handleKeyDown);
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  }

  function destroy() {
    hide();
  }
  
  return {
    show,
    hide,
    destroy
  };
}