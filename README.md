# Syncopation Game / Juego Syncopation

> English — Arcade rhythm-fighting playground built with Phaser 3, TypeScript, and original audiovisual assets.  
> Español — Juego web de ritmo y combate estilo arcade creado con Phaser 3, TypeScript y assets originales.

## Repository Description / Descripción del Repositorio
**English:** Syncopation mixes syncopated beats with karate-inspired combat so players punch, dodge, and counter right on the musical grid while enjoying handcrafted sprites, UI, and music.  
**Español:** Syncopation combina patrones sincopados con combate tipo karate para que las jugadoras reaccionen al ritmo, acompañadas por sprites, UI y música creados exclusivamente para este proyecto.

> Need a quick snippet for the GitHub description? Copy the first paragraph above or check `DESCRIPTION.md`.

## Contents / Contenido
1. [🎯 Overview / Descripción General](#overview--descripción-general)
2. [🎮 Play Now / Jugar Ahora](#play-now--jugar-ahora)
3. [🛠️ Tech Stack / Tecnologías](#tech-stack--tecnologías)
4. [⚡ Quick Start / Guía Rápida](#quick-start--guía-rápida)
5. [🚀 Production & Deployment / Producción y Despliegue](#production--deployment--producción-y-despliegue)
6. [🗂️ Project Structure / Estructura](#project-structure--estructura)
7. [✅ Testing & Quality / Pruebas y Calidad](#testing--quality--pruebas-y-calidad)
8. [🎨 Assets & Credits / Assets y Créditos](#assets--credits--assets-y-créditos)
9. [💖 Support the Project / Apoya el Proyecto](#support-the-project--apoya-el-proyecto)
10. [🤝 Community Standards / Estándares de la Comunidad](#community-standards--estándares-de-la-comunidad)
11. [📄 License / Licencia](#license--licencia)

## Overview / Descripción General
- 🇬🇧 **English:** Syncopation is a browser-based rhythm-action experience where every punch, dodge, and special ability is tied to syncopated cues rendered through a custom UI and layered music stems. Built on Phaser 3 and Vite, it is optimized for quick iteration and short gameplay experiments.  
- 🇪🇸 **Español:** Syncopation es una experiencia de ritmo y acción en el navegador donde cada golpe, esquive y habilidad responde a señales sincopadas. La interfaz y el audio multicapa son propios del proyecto y el stack con Phaser 3 + Vite permite iterar y probar niveles rápidamente.

## Play Now / Jugar Ahora
- 🇬🇧 **English:** Scan the QR code below or open the hosted build. Works on desktop browsers and modern mobile devices.  
- 🇪🇸 **Español:** Escanea el QR o visita la versión publicada; funciona en navegadores de escritorio y móviles modernos.

![QR Code](public/assets/images/qr-code.png)

- 🌐 URL: [https://syncopation-eight.vercel.app/](https://syncopation-eight.vercel.app/)

## Tech Stack / Tecnologías
- 🕹️ **Phaser 3** – 2D rendering & physics. *Motor 2D para lógica y físicas.*
- 🧠 **TypeScript** – Strong typing across gameplay systems. *Tipado fuerte en toda la lógica de juego.*
- ⚡ **Vite** – Fast dev server plus optimized build pipeline. *Servidor rápido y empaquetado optimizado.*
- 🎨 **Bootstrap 5** – UI overlays, menus, and HUD widgets. *Capas de UI, menús y HUD.*
- 📦 **Node.js scripts** – Asset automation (QR, copy steps). *Scripts para automatizar copias y utilidades.*

## Quick Start / Guía Rápida
1. **Clone / Clonar** 📥
   ```bash
   git clone https://github.com/Misstery13/Syncopation.git
   cd Syncopation
   ```
2. **Install / Instalar** 🧰
   ```bash
   npm install
   ```
3. **Run dev server / Servidor de desarrollo** 🚀
   ```bash
   npm run dev
   ```
   - 🇬🇧 **English:** App serves at `http://localhost:3000`.  
   - 🇪🇸 **Español:** La app queda disponible en `http://localhost:3000`.

### Helpful scripts / Scripts útiles
- 👀 `npm run preview` – Production preview server. *Servidor de vista previa.*
- 🧪 `npm run type-check` – Validates TypeScript contracts. *Valida contratos TS.*
- 🛡️ `npm run test` – Runs Vitest suite under `tests/`. *Ejecuta pruebas Vitest.*

## Production & Deployment / Producción y Despliegue
- 🚢 `npm run build` executes `tsc --noEmit && vite build && node scripts/copy-assets.js`.
  - 🇬🇧 **English:** The custom `copy-assets` script guarantees audio & sprite parity on Windows, Linux, and serverless hosts.  
  - 🇪🇸 **Español:** El script `copy-assets` asegura que los assets lleguen completos en Windows, Linux y plataformas serverless.
- 🎯 Deploy targets:
  - 🌥️ **Vercel / Netlify:** Detect Vite automatically.  
  - 🗂️ **Static hosting:** Serve the `dist/` folder contents.
- 🧰 Troubleshooting tip: Clear browser cache if an updated asset does not load after deployment. *Tip: limpia la caché si un asset no se actualiza tras el despliegue.*

## Project Structure / Estructura
🗂️ Directory snapshot:
```plaintext
syncopation-game/
├── public/                # Static entry (QR, audio, sprites)
├── src/
│   ├── core/              # Game bootstrap & Phaser bridge
│   ├── scenes/            # Gameplay flows (Carlos, Diana, etc.)
│   ├── services/          # Auth & persistence helpers
│   ├── ui/                # HUD components (stars, login)
│   └── utils/             # Shared helpers
├── scripts/               # build/post-build utilities
├── tests/                 # Vitest suites
└── vite.config.ts
```
- 🇬🇧 **English:** Each scene folder owns its controller, view, audio cues, and data loader to keep experimentation isolated.  
- 🇪🇸 **Español:** Cada carpeta de escena maneja su controlador, vista, audio y carga de datos para aislar experimentos de gameplay.

## Testing & Quality / Pruebas y Calidad
- ✅ `npm run test` – Runs deterministic Vitest specs. *Ejecuta pruebas unitarias.*
- 👀 `npm run test:watch` – Watch mode for rapid iteration. *Modo observador.*
- 🧠 `npm run type-check` – Ensures cross-scene contracts stay aligned. *Verifica contratos compartidos.*
- 📦 Recommended: run `npm run build` before pushing to catch asset-copy regressions. *Recomendado ejecutar build antes de subir cambios.*

## Assets & Credits / Assets y Créditos
- 🇬🇧 **English:** All visual sprites (e.g., Kimu animations) and musical stems were handcrafted for Syncopation and are not part of the MIT grant. Please request permission before reusing them.  
- 🇪🇸 **Español:** Todos los sprites (incluyendo las animaciones de Kimu) y las pistas musicales se crearon exclusivamente para Syncopation y quedan fuera del permiso MIT. Solicita autorización antes de reutilizarlos.

## Support the Project / Apoya el Proyecto
- 💖 **English:** If you enjoy Syncopation and want to keep new levels, music, and polish coming, you can tip the dev team through PayPal. Every contribution goes toward art, audio gear, and hosting.  
- 💛 **Español:** Si te gusta Syncopation y deseas apoyar la creación de nuevos niveles, música y mejoras, puedes dejar una propina al equipo por PayPal. Cada aporte ayuda con arte, equipo de audio y costos de hosting.

<a href="https://www.paypal.me/misstery13" target="_blank" rel="noopener noreferrer">
  <img alt="Donate with PayPal" src="https://img.shields.io/badge/PayPal-Donate-00457C?logo=paypal&logoColor=white">
</a>

## Community Standards / Estándares de la Comunidad
- 📘 `CODE_OF_CONDUCT.md` – Bilingual expectations & reporting flow. *Expectativas y canal de reporte bilingüe.*
- 🧭 `CONTRIBUTING.md` – How to set up the stack, branch, test, and submit PRs. *Guía de contribución en inglés y español.*
- 🛡️ `SECURITY.md` – Responsible vulnerability disclosure steps. *Proceso de reporte responsable.*
- 🗒️ `.github/ISSUE_TEMPLATE/` – Bug & feature templates in both languages. *Plantillas bilingües.*
- ✅ `.github/pull_request_template.md` – Checklist to align reviews. *Checklist para PR.*

Please read those documents before opening an issue or pull request. *Por favor revísalos antes de abrir issues o PRs.*

## License / Licencia
- 🇬🇧 **English:** Source code is released under the MIT License (see `LICENSE`). Game art, music, and audio remain proprietary unless you obtain explicit permission.  
- 🇪🇸 **Español:** El código se publica bajo MIT (ver `LICENSE`). El arte, música y audio siguen siendo propietarios excepto con permiso explícito.
