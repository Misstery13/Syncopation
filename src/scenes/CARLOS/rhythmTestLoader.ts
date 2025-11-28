import { initRhythmScreen } from './gameplayController';

import { startPhaser } from '../../core/phaserBridge';

/**
 * Inserta en el DOM el layout y estilos que antes estaban en `public/rhythmGameplay-test.html`,
 * y arranca el gameplay + phaser para pruebas.
 */
export function mountRhythmTestPage(): void {
    // 1. Añadir estilos mínimos al head (copiados del HTML de prueba)
    const style = document.createElement('style');
    style.id = 'rhythm-test-styles';
    style.textContent = `
    body { background-color: #0b0b0b; color: white; margin: 0; font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
    .rhythm-container { padding: 20px; max-width: 1000px; margin: 0 auto; box-sizing: border-box; }
    .stats { display: flex; justify-content: center; margin-bottom: 12px; gap: 10px; }
    .stat-item { flex: 0 0 auto; width: 110px; text-align: center; background: rgba(255,255,255,0.02); padding:8px 6px; border-radius:8px; }
    .stat-item .label { display:block; font-size:12px; color:#bbb }
    .stat-item .value { display:block; font-size:18px; font-weight:700; color:#00ff7f }
    .game-area { position: relative; width: 900px; height: 900px; margin: 12px auto 24px auto; background: #050505; border-radius:6px; overflow:hidden }
    #target-indicator { width:100px; height:100px; background:transparent; margin:20px auto; border:5px solid #00ff7f; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; color:#ddd; background: rgba(255,255,255,0.03); padding:6px 10px }
    #feedback-log { height:80px; overflow-y:auto; text-align:center; margin-top:6px }
    .perfect { color:#ffd700 } .ok { color:#ffa500 } .miss { color:#ff4d4d }
  `;
    document.head.appendChild(style);

    // 2. Asegurar que exista un app-root
    let appRoot = document.getElementById('app-root');
    if (!appRoot) {
        appRoot = document.createElement('div');
        appRoot.id = 'app-root';
        document.body.appendChild(appRoot);
    }

    // 3. Crear phaser-root si no existe (phaser espera ese id)
    let phaserRoot = document.getElementById('phaser-root');
    if (!phaserRoot) {
        phaserRoot = document.createElement('div');
        phaserRoot.id = 'phaser-root';
        phaserRoot.style.width = '800px';
        phaserRoot.style.height = '600px';
        phaserRoot.style.margin = '20px auto';
        document.body.appendChild(phaserRoot);
    }

    // 4. Montar la UI y arrancar el gameplay + phaser
    try {
        initRhythmScreen();
    } catch (e) {
        console.error('Error calling initRhythmScreen from mountRhythmTestPage:', e);
    }

    try {
        startPhaser();
    } catch (e) {
        console.error('Error calling initPhaserForTest from mountRhythmTestPage:', e);
    }
}
