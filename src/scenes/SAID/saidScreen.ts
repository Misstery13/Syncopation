// Punto de entrada de la “pantalla de Créditos”.
// Registra eventos para abrir/cerrar desde la pantalla principal.

import { createCreditsView } from './CreditsView';

let api = createCreditsView();

/**
 * Llama esto una sola vez al boot del juego o cuando se inicializa la UI principal.
 * Queda LISTO para que el menú principal dispare el evento y abra Créditos.
 */
export function registerCreditsNavigation() {
  // Abrir créditos cuando alguien emita: window.dispatchEvent(new CustomEvent('ui:open-credits'))
  window.addEventListener('ui:open-credits', () => {
    api.open();
  });

  //  permitir el cierre desde fuera si quisieras:
  window.addEventListener('ui:close-credits', () => {
    api.close();
  });
}

// Export opcional si laintegración quiere abrir créditos por código directo:
export function openCredits() { api.open(); }
export function closeCredits() { api.close(); }
