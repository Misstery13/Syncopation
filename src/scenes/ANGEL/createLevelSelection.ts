//PANTALLA DE ANGEL DEL JUEGO 

import { getLevels, isLevelUnlocked, Level } from './levelData';

// Esto es lo que exportamos para usar en otros archivos
export type LevelSelectionAPI = {
  open: (userData: any) => void;
  close: () => void;
};

/**
 * Crea la pantalla de selección de niveles
 * Sigue el mismo estilo que tu compañero
 */
export function createLevelSelection(): LevelSelectionAPI {
  // 1. Crear el overlay (ventana flotante)
  const overlay = document.createElement('div');
  overlay.id = 'level-selection-overlay';
  overlay.className = 'overlay';
  
  // 2. Poner el HTML de la pantalla
  overlay.innerHTML = `
    <div class="level-selection-window">
      <div class="header">
        <h2>🎵 Selecciona un Nivel</h2>
        <button class="back-btn">← Volver</button>
      </div>
      
      <div class="user-info">
        <div class="user-stat">
          <span>Nivel:</span>
          <strong id="user-level">1</strong>
        </div>
        <div class="user-stat">
          <span>Puntos:</span>
          <strong id="user-points">0</strong>
        </div>
      </div>
      
      <div class="levels-container" id="levels-container">
        <!-- Los niveles aparecen aquí -->
      </div>
      
      <div class="level-preview" id="level-preview">
        <h3 id="preview-title">Selecciona un nivel</h3>
        <p id="preview-desc">Usa las flechas o haz click</p>
        <button class="play-btn" id="play-btn" disabled>Jugar</button>
      </div>
    </div>
  `;

  // 3. Obtener elementos importantes
  const levelsContainer = overlay.querySelector('#levels-container')!;
  const backBtn = overlay.querySelector('.back-btn')!;
  const playBtn = overlay.querySelector('#play-btn')!;
  const previewTitle = overlay.querySelector('#preview-title')!;
  const previewDesc = overlay.querySelector('#preview-desc')!;
  const userLevelEl = overlay.querySelector('#user-level')!;
  const userPointsEl = overlay.querySelector('#user-points')!;

  let selectedLevel: Level | null = null;
  let levels: Level[] = [];

  // 4. Función para mostrar los niveles
  function renderLevels(userLevel: number) {
    levelsContainer.innerHTML = '';
    
    levels.forEach(level => {
      const levelElement = document.createElement('div');
      const unlocked = isLevelUnlocked(level, userLevel);
      
      levelElement.className = `level-card ${unlocked ? 'unlocked' : 'locked'}`;
      levelElement.innerHTML = `
        <div class="level-header">
          <span class="level-number">Nivel ${level.id}</span>
          ${unlocked ? '' : '<span class="lock">🔒</span>'}
        </div>
        <h4>${level.name}</h4>
        <p>${level.description}</p>
        <div class="level-details">
          <span class="difficulty ${level.difficulty}">${level.difficulty}</span>
          <span class="song">🎵 ${level.song}</span>
        </div>
      `;
      
      // Cuando hagan click en un nivel
      levelElement.addEventListener('click', () => {
        if (unlocked) {
          selectLevel(level);
        }
      });
      
      levelsContainer.appendChild(levelElement);
    });
  }

  // 5. Cuando seleccionan un nivel
  function selectLevel(level: Level) {
    selectedLevel = level;
    
    // Actualizar la vista previa
    previewTitle.textContent = level.name;
    previewDesc.textContent = level.description;
    playBtn.ariaDisabled = false;
    
    // Resaltar el nivel seleccionado
    document.querySelectorAll('.level-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Encontrar y resaltar la tarjeta del nivel seleccionado
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach((card, index) => {
      if (levels[index].id === level.id) {
        card.classList.add('selected');
      }
    });
  }

  // 6. Cuando hacen click en "Jugar"
  function onPlayClick() {
    if (!selectedLevel) return;
    
    console.log('🎵 Iniciando nivel:', selectedLevel.name);
    
    // Cerrar esta pantalla
    close();
    
    // Avísale al juego que inicie este nivel
    window.dispatchEvent(new CustomEvent('ui:levelSelected', {
      detail: {
        levelId: selectedLevel.id,
        levelData: selectedLevel
      }
    }));
  }

  // 7. Cuando presionan teclas
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  // 8. Función para ABRIR la pantalla
  function open(userData: any) {
    // Agregar al cuerpo si no está
    if (!document.body.contains(overlay)) {
      document.body.appendChild(overlay);
    }
    
    // Mostrar la pantalla
    overlay.style.display = 'flex';
    
    // Cargar datos
    levels = getLevels();
    const userLevel = userData?.progress?.level || 1;
    const userPoints = userData?.progress?.score || 0;
    
    // Actualizar UI
    userLevelEl.textContent = userLevel.toString();
    userPointsEl.textContent = userPoints.toString();
    renderLevels(userLevel);
    
    // Escuchar teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Seleccionar primer nivel por defecto
    if (levels.length > 0) {
      selectLevel(levels[0]);
    }
  }

  // 9. Función para CERRAR la pantalla
  function close() {
    overlay.style.display = 'none';
    document.removeEventListener('keydown', handleKeyPress);
    
    // Avísale al menú principal que volvemos
    window.dispatchEvent(new CustomEvent('ui:navigate', {
      detail: { to: 'main-menu' }
    }));
  }

  // 10. Conectar los botones
  backBtn.addEventListener('click', close);
  playBtn.addEventListener('click', onPlayClick);

  // 11. Devolver las funciones públicas
  return {
    open,
    close
  };
}