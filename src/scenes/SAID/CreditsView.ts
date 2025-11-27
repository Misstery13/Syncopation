import { CreditEntry, getCredits, filterCredits } from './creditsDomain';

export type CreditsViewAPI = {
  open: () => void;
  close: () => void;
  destroy: () => void;
};

/**
 * Vista impura: crea/remueve nodos, escucha teclado, dispara eventos de navegación.
 * No guarda estado del juego, no toca localStorage. Solo UI.
 */
export function createCreditsView(): CreditsViewAPI {
  const overlay = document.createElement('div');
  overlay.id = 'credits-overlay';
  overlay.innerHTML = `
    <div class="credits-wrap" role="dialog" aria-modal="true" aria-labelledby="credits-title">
      <div class="credits-header">
        <h2 id="credits-title" class="credits-title">Créditos</h2>
        <div class="credits-actions">
          <button class="credits-btn" data-action="back">Volver</button>
        </div>
      </div>

      <input class="credits-search" type="search" placeholder="Buscar por rol o nombre..." aria-label="Buscar en créditos" />

      <div class="credits-body" id="credits-body"></div>
    </div>
  `;

  let all: CreditEntry[] = getCredits();
  const bodyEl = overlay.querySelector<HTMLDivElement>('#credits-body')!;
  const searchEl = overlay.querySelector<HTMLInputElement>('.credits-search')!;
  const backBtn = overlay.querySelector<HTMLButtonElement>('[data-action="back"]')!;

  function render(list: CreditEntry[]) {
    bodyEl.innerHTML = list.map(e => `
      <section class="credits-section">
        <div class="credits-role">${e.role}</div>
        <p class="credits-names">${e.names.join(', ')}</p>
      </section>
    `).join('');
  }

  function onSearch() {
    const filtered = filterCredits(all, searchEl.value);
    render(filtered);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function open() {
    if (!document.body.contains(overlay)) document.body.appendChild(overlay);
    overlay.classList.add('is-open');
    render(all);
    document.addEventListener('keydown', onKey);
    // Accesibilidad: enfocar búsqueda
    setTimeout(() => searchEl.focus(), 0);
  }

  function close() {
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
    // Emite un evento para que el "router" (pantalla principal) pueda volver
    window.dispatchEvent(new CustomEvent('ui:navigate', { detail: { to: 'main-menu' }}));
  }

  function destroy() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }

  // listeners DOM
  backBtn.addEventListener('click', close);
  searchEl.addEventListener('input', onSearch);

  return { open, close, destroy };
}
