import Phaser from 'phaser';

// --- CONFIGURACIÓN E INTERFACES ---
export interface PhaserRendererConfig {
    parentId?: string;
    spriteKey?: string;
    spritePath?: string;
    frameWidth?: number;
    frameHeight?: number;
    frameCount?: number;
    frameRate?: number;
    sprites?: Array<{
        key: string;
        path: string;
        frameWidth?: number;
        frameHeight?: number;
        frameCount?: number;
        frameRate?: number;
        loop?: boolean;
    }>;
    x?: number;
    y?: number;
    scale?: number;
    width?: number;
    height?: number;
    pixelArt?: boolean;
}

// NOTA: Hemos eliminado la variable global 'throwablesGroup' para evitar memory leaks 
// y referencias a escenas destruidas al reiniciar el juego.

// --- FUNCIONES DE INICIALIZACIÓN ---

export function startPhaser(cfg: PhaserRendererConfig = {}) {
    const win = window as any;
    if (!win.__phaserGames) win.__phaserGames = {};

    const parentId = cfg.parentId ?? 'phaser-root';

    // Si ya existe y está corriendo, lo devolvemos
    if (win.__phaserGames[parentId]) {
        win.__phaserGame = win.__phaserGames[parentId];
        return win.__phaserGames[parentId];
    }

    let parentEl = document.getElementById(parentId);
    if (!parentEl) {
        parentEl = document.createElement('div');
        parentEl.id = parentId;
        parentEl.style.position = 'relative';
        parentEl.style.zIndex = '9999';
        document.body.appendChild(parentEl);
    }

    // Defaults
    const spriteKey = cfg.spriteKey ?? 'player';
    const spritePath = cfg.spritePath ?? '/assets/images/sprites/Kimu-Idle.png';
    const frameW = cfg.frameWidth ?? 64;
    const frameH = cfg.frameHeight ?? 64;
    const frameCount = cfg.frameCount ?? 8;
    const frameRate = cfg.frameRate ?? 10;

    const parentRect = parentEl.getBoundingClientRect();
    const width = cfg.width ?? Math.max(300, Math.round(parentRect.width));
    const height = cfg.height ?? Math.max(200, Math.round(parentRect.height));

    const centerX = cfg.x ?? Math.round(width / 2);
    const centerY = cfg.y ?? Math.round(height / 2);

    const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
        key: `MainScene_${parentId}`,
        active: true,
        visible: true,
    };

    const scene = class MainScene extends Phaser.Scene {
        constructor() {
            super(sceneConfig);
        }

        preload() {
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            for (const s of sprites) {
                const fw = s.frameWidth ?? frameW;
                const fh = s.frameHeight ?? frameH;
                // Carga inteligente: si frameCount es 1, es imagen estática
                if (s.frameCount === 1) {
                    this.load.image(s.key, s.path);
                } else {
                    this.load.spritesheet(s.key, s.path, { frameWidth: fw, frameHeight: fh });
                }
            }
            // Aseguramos tener la textura del throwable
            if (!this.textures.exists('throwable')) {
                // Si no hay textura definida, creamos un placeholder o cargamos una por defecto si tienes path
                // this.load.image('throwable', 'path/to/ball.png'); 
            }
        }

        create() {
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            // 1. Crear Animaciones
            for (const s of sprites) {
                let count = s.frameCount ?? frameCount;

                // Intento automático de calcular frames si no se proveen
                if (count == null && this.textures.exists(s.key)) {
                    const tex = this.textures.get(s.key);
                    const src = tex.getSourceImage();
                    if (src && src.width && (s.frameWidth ?? frameW)) {
                        count = Math.floor(src.width / (s.frameWidth ?? frameW));
                    }
                }

                const finalCount = count ?? 1;
                const rate = s.frameRate ?? frameRate;
                const animKey = `${s.key}-anim`;

                if (finalCount > 1 && !this.anims.exists(animKey)) {
                    this.anims.create({
                        key: animKey,
                        frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: finalCount - 1 }),
                        frameRate: rate,
                        repeat: s.loop === false ? 0 : -1,
                    });
                }
            }

            // 2. Crear Personaje Principal
            const idle = sprites.find((x: any) => /idle/i.test(x.key));
            const main = idle ?? sprites[0];

            const sprite = this.add.sprite(centerX, centerY, main.key)
                .setScale(cfg.scale ?? 1)
                .setName('character');

            const animKey = `${main.key}-anim`;
            if (this.anims.exists(animKey)) {
                sprite.play(animKey);
            }

            // Listener para volver a Idle/Loop si la animación no es loop
            sprite.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
                if (anim.key !== animKey && this.anims.exists(animKey)) {
                    sprite.play(animKey);
                }
            });

            // 3. Inicializar Object Pool en la Escena
            // Guardamos la referencia DENTRO de la instancia de la escena (registry o propiedad custom)
            const group = this.add.group({
                classType: Phaser.GameObjects.Sprite,
                defaultKey: 'throwable',
                maxSize: 50,
                runChildUpdate: false,
                createCallback: (obj: Phaser.GameObjects.GameObject) => {
                    const s = obj as Phaser.GameObjects.Sprite;
                    s.setActive(false).setVisible(false);
                    s.setScale(0.4);
                    s.setDepth(1000);
                }
            });

            // Asignamos al registro de la escena para recuperarlo fácil desde fuera
            this.registry.set('throwablesGroup', group);
        }
    };

    const phaserConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: parentId,
        backgroundColor: '#000000',
        scene: scene, // Pasamos la clase de la escena
        transparent: true,
        // CONFIGURACIÓN PIXEL ART CRÍTICA
        pixelArt: cfg.pixelArt ?? true, // Por defecto true para este tipo de juegos
        roundPixels: true, // Importante para evitar sub-pixel blurring
    };

    const game = new Phaser.Game(phaserConfig);
    win.__phaserGames[parentId] = game;
    win.__phaserGame = game;
    return game;
}

export function playCharacterAnimation(animKey: string) {
    const scene = getActiveScene();
    if (!scene) return false;

    const sprite = scene.children.getByName('character') as Phaser.GameObjects.Sprite;
    if (sprite) {
        const finalKey = animKey.endsWith('-anim') ? animKey : `${animKey}-anim`;
        if (scene.anims.exists(finalKey)) {
            sprite.play(finalKey);
            return true;
        }
    }
    return false;
}

// --- MÓDULOS DE FÍSICA Y REACCIÓN ---

/**
 * Helper para encontrar la escena activa de forma robusta
 */
function getActiveScene(): Phaser.Scene | undefined {
    const win = window as any;
    // Buscar en el juego legacy
    if (win.__phaserGame) {
        const scenes = win.__phaserGame.scene.scenes;
        if (scenes && scenes.length > 0) return scenes[0];
    }
    // Buscar en el mapa de juegos
    if (win.__phaserGames) {
        for (const key in win.__phaserGames) {
            const g = win.__phaserGames[key];
            if (g && g.scene && g.scene.scenes.length > 0) {
                return g.scene.scenes[0];
            }
        }
    }
    return undefined;
}

/**
 * 1. SPAWN
 */
export function spawnThrowable(duration: number = 600) {
    const scene = getActiveScene();
    if (!scene) return;

    // Configuración de posiciones
    const character = scene.children.getByName('character') as Phaser.GameObjects.Sprite;
    // Si no hay personaje, usamos el centro
    const endX = character ? character.x : scene.scale.width / 2;
    const baseY = character ? character.y : scene.scale.height / 2;
    const startX = scene.scale.width + 100; // Nacer fuera a la derecha

    // --- OBTENER DEL POOL DESDE EL REGISTRO DE LA ESCENA ---
    let group = scene.registry.get('throwablesGroup') as Phaser.GameObjects.Group;

    // Fallback de seguridad: si el grupo no existe (ej. reinicio raro), crearlo
    if (!group || !group.scene) {
        group = scene.add.group({
            classType: Phaser.GameObjects.Sprite,
            defaultKey: 'throwable',
            maxSize: 50,
            runChildUpdate: false
        });
        scene.registry.set('throwablesGroup', group);
    }

    const sprite = group.get(startX, baseY) as Phaser.GameObjects.Sprite | undefined;

    if (!sprite) {
        // Pool lleno
        return;
    }

    // Asegurar textura y propiedades
    if (!sprite.texture || sprite.texture.key === '__MISSING') {
        // Intentar ponerle la textura del objeto si existe, sino un color
        if (scene.textures.exists('throwable')) sprite.setTexture('throwable');
    }

    // RESETEO DE ESTADO
    sprite.setActive(true).setVisible(true);
    sprite.setAlpha(1);
    sprite.setScale(0.4);
    sprite.setRotation(0);
    sprite.clearTint();
    sprite.setDepth(1001);
    sprite.setOrigin(0.5, 0.5);

    // Matar tweens viejos
    scene.tweens.killTweensOf(sprite);

    // Tween Parabólico
    scene.tweens.add({
        targets: sprite,
        x: endX,
        duration: duration,
        rotation: { from: 0, to: Math.PI * 4 },
        onUpdate: (tween) => {
            const t = tween.progress;
            const height = -100; // Altura del arco
            const offsetY = height * (4 * t * (1 - t));
            if (sprite.active) {
                sprite.y = baseY + offsetY;
            }
        },
        onComplete: () => {
            if (sprite.active) {
                // Si llega al final sin interacción, reciclar
                recycleSprite(scene, sprite);
            }
        }
    });
}

/**
 * 2. REACTION
 */
export function handleThrowableReaction(result: 'hit' | 'delay' | 'miss') {
    const scene = getActiveScene();
    if (!scene) return;

    const group = scene.registry.get('throwablesGroup') as Phaser.GameObjects.Group;
    if (!group) return;

    // Filtrar activos y visibles
    const activeThrowables = group.getChildren().filter(
        (t: any) => t.active && t.visible
    ) as Phaser.GameObjects.Sprite[];

    if (activeThrowables.length === 0) return;

    const character = scene.children.getByName('character') as Phaser.GameObjects.Sprite;
    const refX = character ? character.x : (scene.scale.width / 2);

    // Ordenar: el que tenga menor distancia X al personaje es el objetivo
    activeThrowables.sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX));

    const target = activeThrowables[0];

    // Detener movimiento actual
    scene.tweens.killTweensOf(target);

    switch (result) {
        case 'delay':
            performDelayReaction(scene, target);
            break;
        case 'miss':
            performMissReaction(scene, target);
            break;
        case 'hit':
            performHitReaction(scene, target);
            break;
    }
}

// --- Control de Cooldown para golpes (para evitar penalización global / permitir spam configurado) ---
// Tiempo mínimo entre golpes por escena (ms). Por defecto permisivo pero configurable.
let defaultHitCooldownMs = 0;
// Permitir spam globalmente (si true, se ignora cooldown)
let allowHitSpamGlobal = false;
// Mapa de timestamps por escena.key para mantener independencia entre escenas/juegos
const lastHitTimestampByScene: Map<string, number> = new Map();

/**
 * Configura el tiempo de cooldown (ms) entre golpes.
 * Si se establece a 0 permitirá golpes inmediatos (sin restricción).
 */
export function setHitCooldown(ms: number) {
    // Normalizar
    defaultHitCooldownMs = Math.max(0, Math.floor(ms));
}

/**
 * Habilita o deshabilita la restricción de cooldown globalmente.
 * true = permite spam (ignora cooldown), false = aplica cooldown configurado.
 */
export function setAllowHitSpam(enabled: boolean) {
    allowHitSpamGlobal = !!enabled;
}

/**
 * Intentar procesar una reacción de "hit/delay/miss" respetando cooldown por escena.
 * Devuelve true si la acción fue ejecutada, false si fue bloqueada por cooldown.
 *
 * Uso recomendado: en lugar de llamar handleThrowableReaction(...) directamente,
 * usar tryHandleHit(...) desde el input handler (por ejemplo respuesta al espacio).
 */
export function tryHandleHit(result: 'hit' | 'delay' | 'miss'): boolean {
    // Si el spam está permitido globalmente, procesar siempre
    if (allowHitSpamGlobal) {
        handleThrowableReaction(result);
        return true;
    }

    const scene = getActiveScene();
    if (!scene) return false;

    const sceneKey = (scene.sys && scene.sys.settings && (scene.sys.settings.key as string)) || `scene@unknown`;
    const now = Date.now();
    const last = lastHitTimestampByScene.get(sceneKey) ?? 0;
    const elapsed = now - last;

    if (elapsed >= defaultHitCooldownMs) {
        // Permitir y actualizar timestamp
        lastHitTimestampByScene.set(sceneKey, now);
        handleThrowableReaction(result);
        return true;
    }

    // Bloqueado por cooldown
    return false;
}

// --- Helpers Internos ---

function recycleSprite(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    const group = scene.registry.get('throwablesGroup') as Phaser.GameObjects.Group;
    if (group) {
        group.killAndHide(sprite);
    } else {
        sprite.setVisible(false).setActive(false);
    }
}

function performDelayReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    scene.tweens.chain({
        targets: sprite,
        tweens: [
            {
                y: sprite.y - 150,
                x: sprite.x - 50,
                duration: 200,
                ease: 'Power1',
                angle: sprite.angle + 45,
            },
            {
                y: scene.scale.height + 100,
                x: sprite.x - 80,
                duration: 500,
                ease: 'Quad.In',
                onComplete: () => recycleSprite(scene, sprite)
            }
        ]
    });
}

function performMissReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    scene.tweens.add({
        targets: sprite,
        y: scene.scale.height + 100,
        x: sprite.x - 30,
        rotation: sprite.rotation + 0.5,
        duration: 600,
        ease: 'Bounce.Out',
        onComplete: () => recycleSprite(scene, sprite)
    });
}

function performHitReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    const directionY = Math.random() > 0.5 ? -1 : 1;
    const distanceX = 600 + Math.random() * 200;
    const distanceY = 300 + Math.random() * 200;

    const targetX = sprite.x + distanceX;
    const targetY = sprite.y + (distanceY * directionY);

    sprite.setTint(0xffaa00);

    scene.time.delayedCall(100, () => {
        if (sprite.active) sprite.clearTint();
    });

    scene.tweens.add({
        targets: sprite,
        x: targetX,
        y: targetY,
        angle: 720,
        duration: 500,
        ease: 'Cubic.Out',
        onComplete: () => recycleSprite(scene, sprite)
    });
}