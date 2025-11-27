export type Difficulty = 'Fácil' | 'Normal' | 'Difícil' | 'Experto';

/**
 * Define la estructura de un nivel en el juego.
 */
export interface LevelDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  songFile: string; // Ruta al archivo de la canción
  requiresLevel: number; // Nivel de jugador necesario para desbloquear
}

/**
 * Base de datos central de todos los niveles del juego.
 * En el futuro, esto podría cargarse desde un JSON.
 */
export const LEVEL_DATABASE: LevelDefinition[] = [
  { 
    id: 'level_1', 
    title: 'Ritmo y Estambre', 
    description: 
    'El héroe felino KIMU, conocido por sus ágiles ataques de kárate y su inquebrantable sentido del swing, necesita de tu ayuda para su entrenamiento con estambres', 
    difficulty: 'Normal', 
    songFile: 'songs/amanecer.mp3',
    requiresLevel: 0 // Desbloqueado desde el inicio
  },
  { 
    id: 'level_2', 
    title: 'Contratiempo', 
    description: 'Prepárate para notas inesperadas fuera de tiempo.', 
    difficulty: 'Normal', 
    songFile: 'songs/contratiempo.mp3',
    requiresLevel: 2 // Requiere que el jugador sea nivel 2
  },
  { 
    id: 'level_3', 
    title: 'Frenesí de Síncopa', 
    description: 'Un reto de velocidad y precisión. ¿Podrás mantener el ritmo?', 
    difficulty: 'Difícil', 
    songFile: 'songs/frenesi.mp3',
    requiresLevel: 5 // Requiere nivel 5
  },
  { 
    id: 'level_4_expert', 
    title: 'Pesadilla Polirrítmica', 
    description: 'Solo para maestros del ritmo. Requiere total independencia.', 
    difficulty: 'Experto', 
    songFile: 'songs/pesadilla.mp3',
    requiresLevel: 10 // Requiere nivel 10
  },
];