import { LevelSelection } from '../ANGEL/levelScreen';
import type { SongDefinition } from '../../types';
import { initRhythmScreen } from './gameplayController';
import { beatMapLevel1 } from './beatMaps';
import { startPhaser } from '../../core/phaserBridge';

export function loadSongDefinition(selection: LevelSelection): SongDefinition {
    const beatmap = beatMapLevel1;

    if (!beatmap) {
        throw new Error(`Beatmap no encontrado para levelId=${selection.levelId}`);
    }

    return {
        idSong: beatmap.idSong,
        difficulty: beatmap.difficulty,
        tempos: beatmap.tempos,
        audioUrl: `/assets/audio/${beatmap.audioUrl}`, // viene del JSON, no del menú
    };
}

/**
 * Carga la 'ventana' del nivel dentro de la misma página.
 * - Crea un contenedor con `#phaser-root` para que `gameplayController` monte el juego.
 * - Llama a `initRhythmScreen` con el SongDefinition mapeado.
 * - Provee un botón "Volver" que limpia la vista y ejecuta `onClose` si se pasa.
 */
export function loadKarateKatLevel(
    selection: LevelSelection,
    onClose?: () => void
): void {
    const song = loadSongDefinition(selection);

    // Crear overlay modal (no tocamos #app-root)
    const overlay = document.createElement('div');
    overlay.id = 'karate-level-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.75)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const wrapper = document.createElement('div');
    wrapper.id = 'karate-level-window';
    wrapper.className = 'karate-level-window';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '800px';
    wrapper.style.height = '90vh';
    wrapper.style.maxHeight = '100%';
    wrapper.style.background = '#7c787e';
    wrapper.style.borderRadius = '8px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';

    wrapper.innerHTML = `
    <div class="karate-header" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#090909;border-bottom:1px solid rgba(255,255,255,0.04)">
      <h2 style="margin:0;color:#fff">${song.idSong.replace(/level_/i, 'Nivel ').replace(/_/g, ' ')}</h2>
      <div>
        <button id="karate-back-btn" class="btn-secondary" style="padding:8px 12px">Volver</button>
      </div>
    </div>
    <div id="karate-content" style="position:relative;flex:1;min-height:300px;">
    </div>
    <div id="karate-footer" style="padding:8px;text-align:center;background:#070707;border-top:1px solid rgba(255,255,255,0.02)"></div>
  `;

    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // Conectar el botón de volver y ESC
    const backBtn = wrapper.querySelector<HTMLButtonElement>('#karate-back-btn');
    const close = () => {
        try {
            // Stop level audio if playing
            const levelAudio = (window as any).currentLevelAudio as HTMLAudioElement | undefined;
            if (levelAudio) {
                try { levelAudio.pause(); levelAudio.currentTime = 0; } catch (e) { }
                try { delete (window as any).currentLevelAudio; } catch (e) { }
            }
            // Call gameplayController cleanup to stop loop, sfx clones and remove DOM
            try {
                const controller = (window as any).cleanupRhythmScreen as Function | undefined;
                if (controller) controller();
            } catch (e) { }

            // Destroy Phaser game instance that is attached to the phaser-root inside this overlay
            const phaserRoot = wrapper.querySelector('#phaser-root') as HTMLElement | null;
            const parentId = phaserRoot ? phaserRoot.id : 'phaser-root';
            const win = window as any;
            try {
                const g = win.__phaserGames && win.__phaserGames[parentId];
                if (g && typeof g.destroy === 'function') {
                    g.destroy(true);
                    try { delete win.__phaserGames[parentId]; } catch (e) { }
                    if (win.__phaserGame === g) delete win.__phaserGame;
                }
            } catch (e) { }

            // Optionally resume menu music if available
            try {
                const menu = (window as any).menuMusic as HTMLAudioElement | undefined;
                if (menu && menu.paused) {
                    // Try to play; if blocked browser will ignore
                    menu.play().catch(() => { });
                }
            } catch (e) { }

        } finally {
            if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
            window.removeEventListener('keydown', onKey);
            if (onClose) onClose();
        }
    };

    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
    };

    backBtn?.addEventListener('click', close);
    window.addEventListener('keydown', onKey);

    // Iniciar la pantalla de ritmo usando el song mapeado montando la vista dentro del wrapper
    initRhythmScreen(song, wrapper);

    // Reorganizar los elementos que renderRhythmView añadió dentro del wrapper
    // Queremos: header (nuestro h2), luego .stats, luego el game-area centrado dentro de #karate-content
    const rhythmContainer = wrapper.querySelector('#rhythm-game-container') as HTMLElement | null;
    const karateContent = wrapper.querySelector('#karate-content') as HTMLElement | null;

    if (rhythmContainer && karateContent) {
        const statsEl = rhythmContainer.querySelector('.stats') as HTMLElement | null;
        const gameArea = rhythmContainer.querySelector('.game-area') as HTMLElement | null;
        const feedback = rhythmContainer.querySelector('#feedback-log') as HTMLElement | null;
        const startBtn = rhythmContainer.querySelector('#start-button') as HTMLElement | null;

        // Move start button into our header buttons area BEFORE removing the injected container
        if (startBtn) {
            const headerButtons = wrapper.querySelector('.karate-header div') as HTMLElement | null;
            if (headerButtons) {
                headerButtons.appendChild(startBtn);
                // Make sure it's visible and styled
                startBtn.style.display = 'inline-block';
                startBtn.style.marginLeft = '8px';
                startBtn.classList.add('start-btn');
            }
        }

        // Remove the injected full container to avoid duplicate headers
        rhythmContainer.remove();

        // Insert stats right after our header (before karate-content)
        if (statsEl) {
            wrapper.insertBefore(statsEl, karateContent);
            // Ensure stats occupy full width
            statsEl.style.width = '100%';
            statsEl.style.display = 'flex';       // Aseguramos que sea flex
            statsEl.style.flexWrap = 'wrap';      // <--- IMPORTANTE: Si no caben, bajan
            statsEl.style.justifyContent = 'center'; // Centrado para que se vea bien
            statsEl.style.gap = '5px';
            statsEl.style.padding = '8px 16px';
            // Tweak individual stat-items to be smaller and horizontal
            const statItems = Array.from(statsEl.querySelectorAll('.stat-item')) as HTMLElement[];
            // PEGA ESTO:
            statItems.forEach(si => {
                // 1. Estilo de la cajita contenedora
                Object.assign(si.style, {
                    flex: '1 1 70px',       // Flexible
                    margin: '0',
                    padding: '6px 4px',
                    background: 'rgba(255, 255, 255, 0.1)', // Fondo semitransparente
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                });

                // 2. Estilo de la etiqueta (ej: SCORE)
                const lbl = si.querySelector('.label') as HTMLElement | null;
                if (lbl) {
                    Object.assign(lbl.style, {
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: '#ccc',       // Gris claro
                        marginBottom: '2px',
                        display: 'block'
                    });
                }

                // 3. Estilo del valor (ej: 1050)
                const val = si.querySelector('.value') as HTMLElement | null;
                if (val) {
                    Object.assign(val.style, {
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#fff',       // Blanco brillante
                        fontFamily: 'monospace'
                    });
                }
            });
        }

        // Place gameArea inside karate-content and center it
        if (gameArea) {
            // Clear placeholder content and append gameArea, stretching it to fill the karate-content
            karateContent.innerHTML = '';
            karateContent.appendChild(gameArea);

            // Make karate-content use full available space and allow the game area to stretch
            karateContent.style.display = 'block';
            karateContent.style.padding = '0';
            karateContent.style.flex = '1 1 auto';
            karateContent.style.width = '100%';
            karateContent.style.height = '100%';

            // Ensure gameArea fills the parent completely
            gameArea.style.width = '100%';
            gameArea.style.height = '100%';
            gameArea.style.margin = '0';
            gameArea.style.boxSizing = 'border-box';
            gameArea.style.position = 'relative';
            // Ensure phaser root inside gameArea fills the area
            const phaserRoot = gameArea.querySelector('#phaser-root') as HTMLElement | null;
            if (phaserRoot) {
                phaserRoot.style.width = '100%';
                phaserRoot.style.height = '100%';
                phaserRoot.style.margin = '0';
                phaserRoot.style.display = 'block';
            }
        }

        // Move feedback log to footer area
        // PEGA ESTO:
        if (feedback) {
            const footer = wrapper.querySelector('#karate-footer') as HTMLElement | null;

            // Estilos para que el texto de "Perfect/Miss" se vea profesional
            Object.assign(feedback.style, {
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                height: '24px',           // Altura fija para evitar saltos
                lineHeight: '24px',
                color: '#ffd700',         // Color dorado
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                margin: '0 auto',
                width: '100%'
            });

            if (footer) {
                footer.innerHTML = '';    // Limpia el footer antes de poner el feedback
                footer.appendChild(feedback);
            } else {
                wrapper.appendChild(feedback);
            }
        }
    }

    // Inicializar Phaser en el `phaser-root` que ahora está dentro del game-area
    try {
        const rect = wrapper.getBoundingClientRect();
        const usableHeight = rect.height - 300;
        const usableWidth = rect.width - 32;
        let dynamicScale = Math.floor(Math.min(usableWidth / 64, usableHeight / 64, 5));
        if (dynamicScale < 1) dynamicScale = 1;
        startPhaser({
            parentId: 'phaser-root',
            sprites: [
                { key: 'Kimu-Idle', path: '/assets/images/sprites/Kimu-Idle.png', frameWidth: 64, frameHeight: 64, frameRate: 8, loop: true },
                { key: 'Kimu-punch-right', path: '/assets/images/sprites/Kimu-punch-right.png', frameWidth: 64, frameHeight: 64, frameRate: 12, loop: false },
                { key: 'Kimu-punch-left', path: '/assets/images/sprites/Kimu-punch-left.png', frameWidth: 64, frameHeight: 64, frameRate: 12, loop: false },
                { key: 'throwable', path: '/assets/images/sprites/throwable.png', frameWidth: 32, frameHeight: 32, frameRate: 1, frameCount: 1, loop: false },
            ],
            frameWidth: 64,
            frameHeight: 64,
            frameRate: 10,
            scale: dynamicScale,
        });
    } catch (err) {
        console.error('Error starting Phaser for overlay:', err);
    }
}
