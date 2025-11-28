# Syncopation Game

**Syncopation** es un juego de ritmo y acción desarrollado con **Phaser 3**, **TypeScript** y **Vite**. Combina mecánicas de juegos de ritmo con acción de combate estilo karate.

## 🚀 Tecnologías

Este proyecto utiliza un stack moderno para desarrollo de juegos web:

- **[Phaser 3](https://phaser.io/)**: Framework de juegos 2D.
- **[TypeScript](https://www.typescriptlang.org/)**: Lenguaje principal para un código robusto y tipado.
- **[Vite](https://vitejs.dev/)**: Build tool ultrarrápido para desarrollo y producción.
- **[Bootstrap 5](https://getbootstrap.com/)**: Para la interfaz de usuario (UI) y menús.
- **Node.js**: Para scripts de automatización de assets.

## � Jugar Ahora

¡Escanea este código QR para jugar directamente en tu móvil!

![QR Code](public/assets/images/qr-code.png)

O visita: [https://syncopation-eight.vercel.app/](https://syncopation-eight.vercel.app/)

## �🛠️ Instalación y Desarrollo

Asegúrate de tener **Node.js** instalado (versión 16+ recomendada).

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/Misstery13/Syncopation.git
   cd Syncopation
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   El juego estará disponible en `http://localhost:3000`.

## 📦 Construcción para Producción

Para generar la versión optimizada para producción:

```bash
npm run build
```

### Nota sobre Assets en Producción

Este proyecto utiliza un script personalizado (`scripts/copy-assets.js`) que se ejecuta automáticamente después del build. Esto es necesario para asegurar que los assets (imágenes, audio) se copien correctamente en todas las plataformas (Windows, Linux, Vercel), ya que herramientas estándar como `cp` o `xcopy` tienen problemas de compatibilidad cruzada.

El comando de build ejecuta: `tsc --noEmit && vite build && node scripts/copy-assets.js`

## ☁️ Despliegue

El proyecto está configurado para desplegarse fácilmente en **Vercel**:

1. Conecta tu repositorio de GitHub a Vercel.
2. Vercel detectará automáticamente `vite` y usará la configuración por defecto.
3. El script de build se encargará de todo.

Si encuentras problemas con assets que no cargan (404) después de un despliegue, asegúrate de limpiar la caché de tu navegador.

## 📂 Estructura del Proyecto

```plaintext
syncopation-game/
├── public/                     # Archivos estáticos (root en dev)
│   ├── assets/                 # Recursos del juego (imágenes, audio)
│   └── index.html              # Punto de entrada HTML
│
├── src/                        # Código fuente TypeScript
│   ├── core/                   # Lógica central (Game, PhaserBridge)
│   ├── scenes/                 # Escenas de Phaser
│   │   ├── CARLOS/             # Gameplay, carga de niveles
│   │   └── DIANA/              # Menús, UI, autenticación
│   ├── ui/                     # Componentes de UI (estrellas, etc.)
│   ├── utils/                  # Utilidades generales
│   └── main.ts                 # Punto de entrada de la aplicación
│
├── scripts/                    # Scripts de utilidad
│   └── copy-assets.js          # Script para copiar assets en build
│
├── dist/                       # Salida de producción (generado por build)
├── vite.config.ts              # Configuración de Vite
└── package.json                # Dependencias y scripts
```

## 🧪 Tests

Para ejecutar las pruebas unitarias (Vitest):

```bash
npm run test
```

## 🎨 Créditos y Assets Originales

Este proyecto se destaca por su contenido original:

- **Sprites y Animaciones**: Todos los sprites, incluyendo el personaje "Kimu" y las animaciones de combate, fueron **creados desde cero** específicamente para este juego.
- **Música y Efectos de Sonido**: La banda sonora y los efectos de audio son composiciones originales, diseñadas para sincronizarse perfectamente con la jugabilidad rítmica.

*El uso de estos assets (imágenes y audio) está reservado exclusivamente para este proyecto, a menos que se otorgue permiso explícito.*

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar el juego:

1. Haz un **Fork** del repositorio.
2. Crea una nueva rama para tu feature (`git checkout -b feature/AmazingFeature`).
3. Realiza tus cambios y haz **Commit** (`git commit -m 'Add some AmazingFeature'`).
4. Haz **Push** a la rama (`git push origin feature/AmazingFeature`).
5. Abre un **Pull Request**.

Por favor, asegúrate de que tu código siga el estilo existente (TypeScript, ESLint) y que las pruebas pasen.

## 📄 Licencia

El código fuente de este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

> **Nota**: La licencia MIT aplica al código fuente. Los assets artísticos (música, sprites, imágenes) conservan su copyright original y no deben ser reutilizados sin permiso.
