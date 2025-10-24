Estructura del proyecto 
syncopation-game/
├── public/                     # Archivos estáticos públicos
│   ├── index.html             # Página principal del juego
│   ├── icono.ico              # Icono del juego
│   └── assets/                # Recursos del juego
│       ├── images/
│       │   ├── sprites/       # Sprites de personajes y objetos
│       │   ├── backgrounds/   # Fondos de niveles y escenas
│       │   └── ui/           # Elementos de interfaz de usuario
│       └── audio/
│           ├── music/         # Música de fondo y ambientación
│           └── sfx/          # Efectos de sonido y audio
│
├── src/                       # Código fuente principal
│   ├── core/                  # Sistema central del juego
│   │   ├── game.js           # Clase principal que controla todo el juego
│   │   ├── gameLoop.js       # Bucle principal de actualización y renderizado
│   │   ├── inputManager.js   # Manejo de teclado, mouse y controles
│   │   └── stateManager.js   # Gestión de estados (menú, juego, pausa)
│   │
│   ├── entities/              # Entidades del juego
│   │   ├── player.js         # Jugador principal con lógica de movimiento
│   │   └── iAPlayer.js       # Jugador controlado por IA
│   │
│   ├── scenes/                # Escenas y niveles
│   │   └── gameScene.js      # Escena principal donde ocurre la acción
│   │
│   ├── systems/               # Sistemas del juego
│   │   ├── physics.js        # Sistema de física y movimiento   | FALTA POR AGREGAR 
│   │   ├── audio.js          # Gestión de música y efectos de sonido | FALTA POR AGREGAR
│   │   └── renderer.js       # Sistema de renderizado y dibujado | FALTA POR AGREGAR
│   │
│   ├── utils/                 # Utilidades y funciones auxiliares
│   │   └── utils.js          # Funciones matemáticas y utilidades generales
│   │
│   └── main.js               # Punto de entrada que inicializa el juego
│
├── config/                    # Configuraciones del juego
│   ├── gameConfig.js         # Configuración general (velocidad, dificultad)
│   └── levels/               # Configuraciones específicas de cada nivel
│
├── tests/                     # Pruebas unitarias
│   ├── entities/             # Tests de entidades del juego
│   ├── systems/              # Tests de sistemas
│   └── utils/                # Tests de utilidades
│
├── docs/                      # Documentación del proyecto
│   ├── README.md             # Documentación principal del proyecto
│   └── GAMEDESIGN.md         # Documentación del diseño del juego
│
├── build/                     # Archivos compilados durante desarrollo
├── dist/                      # Versión final optimizada para producción
│
├── package.json              # Dependencias y scripts de npm
├── webpack.config.js         # Configuración del bundler
└── README.md                 # Documentación del repositorio