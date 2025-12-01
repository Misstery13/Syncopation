# Contributing Guide / Guía de Contribución

Thank you for helping Syncopation grow! / ¡Gracias por ayudar a que Syncopation crezca!

## 1. Prerequisites / Prerrequisitos
- **Node.js 18+** (LTS recommended) and npm 9+. *Usa Node.js 18+ (LTS recomendado) y npm 9+.*
- Enable **corepack** or use **pnpm**/**yarn** only if discussed first. *Activa corepack o consulta antes de usar otros gestores.*
- Install project deps with `npm install`. *Instala dependencias con `npm install`.*

## 2. Development Workflow / Flujo de Desarrollo
1. **Fork & Clone** / **Haz fork y clona**.
2. **Create a branch** / **Crea una rama**:
   ```bash
   git checkout -b feature/<short-title>
   # Ejemplos: feature/rhythm-offset, fix/audio-desync
   ```
3. **Keep main updated** – rebase or merge regularly. *Mantén `main` actualizado.*
4. **Use English in code, bilingual in docs**. *Código en inglés, docs bilingües cuando aplique.*

## 3. Coding Standards / Estándares de Código
- TypeScript strictness: prefer explicit types over `any`. *Prefiere tipos explícitos sobre `any`.*
- Pure gameplay logic goes inside `src/scenes/<team>/`. *La lógica pura de juego vive en `src/scenes/<team>/`.*
- UI assets belong in `public/assets` or `src/ui`. *Los assets de UI van en `public/assets` o `src/ui`.*
- Document complex functions with short comments. *Documenta funciones complejas con comentarios breves.*

## 4. Testing & Quality / Pruebas y Calidad
Run these before opening a PR / Ejecuta esto antes del PR:
```bash
npm run type-check
npm run test
npm run build    # asegura que el script copy-assets termina bien
```
If you add gameplay utilities, consider adding a Vitest spec under `tests/`. *Si agregas utilidades, crea pruebas en `tests/`.*

## 5. Commit & PR Style / Estilo de Commits y PRs
- Commits should be scoped, present-tense, e.g., `feat: add combo tutorial overlay`. *Commits pequeños, en presente.*
- Reference Issues using `Fixes #<id>` or `Refs #<id>` in PRs. *Menciona los Issues en el PR.*
- Complete the PR template checklist. *Llena el checklist del template.*
- Screenshots or clips help reviewers for visual/UI changes. *Incluye capturas o clips para cambios visuales.*

## 6. Opening Issues / Abrir Issues
- Use the provided templates for bugs and feature ideas. *Usa las plantillas de bug o feature.*
- Include reproduction steps, expected vs actual behavior, browser/device, and logs if applicable. *Incluye pasos, comportamiento esperado vs real, navegador/dispositivo y logs.*

## 7. Communication / Comunicación
- Preferred language: English for code reviews; feel free to add Spanish summaries when helpful. *Lenguaje preferido: inglés en revisiones; puedes agregar resúmenes en español.*
- Be respectful and follow the [Code of Conduct](CODE_OF_CONDUCT.md). *Respeta el [Código de Conducta](CODE_OF_CONDUCT.md).*
- Async-first: use GitHub comments, reference commits, and keep discussions in public threads when possible. *Comunicación asíncrona: usa comentarios y mantén conversaciones públicas cuando sea posible.*

## 8. Need Help? / ¿Necesitas ayuda?
- Start with existing Issues or Discussions. *Empieza revisando Issues o Discussions.*
- Tag maintainers if you are blocked on tooling or assets. *Menciona a las personas mantenedoras si necesitas ayuda con herramientas o assets.*

¡Felices contribuciones! Happy contributing!
