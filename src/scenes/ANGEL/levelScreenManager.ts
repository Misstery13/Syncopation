// src/levelSelectManager.ts
import { 
  createLevelSelectionView, 
  LevelSelection
} from './levelScreen.ts';

// Función para cargar el CSS dinámicamente
function loadLevelSelectionCSS(): void {
  // Verificar si el CSS global ya está cargado
  const existingLink = document.querySelector('link[href*="assets/css/style.css"]');
  if (existingLink) {
    return; // Ya está cargado
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Usar la hoja de estilos única ubicada en public/assets/css/style.css
  link.href = '/assets/css/style.css';
  document.head.appendChild(link);
}

// Interfaz para la instancia de la vista
interface LevelSelectViewInstance {
    show: () => void;
    hide: () => void;
    destroy: () => void;
}

/**
 * Gestiona la UI de selección de nivel.
 * Devuelve una promesa que:
 * - RESUELVE con { levelId, songFile } si el usuario elige "Jugar".
 * - RECHAZA si el usuario elige "Volver".
 */
export class LevelSelectManager {
    private view: LevelSelectViewInstance;
    
    private resolvePromise!: (selection: LevelSelection) => void;
    private rejectPromise!: (reason?: any) => void;

    constructor(playerLevel: number) {
        // Creamos la vista, pasándole nuestros métodos internos como callbacks
        this.view = createLevelSelectionView(
            playerLevel,
            {
              // Pasamos las funciones que la vista debe llamar
              onPlay: (selection) => this.onPlay(selection),
              onBack: () => this.onBack()
            }
        );
    }

    /**
     * Muestra la pantalla y devuelve una promesa.
     */
    public show(): Promise<LevelSelection> {
        return new Promise((resolve, reject) => {
            // Cargar el CSS antes de mostrar la vista
            loadLevelSelectionCSS();
            
            // Guarda las funciones de la promesa
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
            
            // Muestra la vista
            this.view.show();
        });
    }

    /**
     * Callback interno. Se llama cuando la VISTA notifica "Jugar".
     */
    private onPlay(selection: LevelSelection): void {
        this.view.hide();
        this.resolvePromise(selection); // Resuelve la promesa
    }

    /**
     * Callback interno. Se llama cuando la VISTA notifica "Volver".
     */
    private onBack(): void {
        this.view.hide();
        this.rejectPromise('User navigated back'); // Rechaza la promesa
    }
}