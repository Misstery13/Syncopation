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
}

// OPTIMIZACIÓN: Usaremos un Grupo para el Object Pooling
let throwablesGroup: Phaser.GameObjects.Group | null = null;

// --- FUNCIONES DE INICIALIZACIÓN ---

export function startPhaser(cfg: PhaserRendererConfig = {}) {
    const win = window as any;
    // Map de juegos por parentId para soportar múltiples contenedores
    if (!win.__phaserGames) win.__phaserGames = {};

    const parentId = cfg.parentId ?? 'phaser-root';
    // Si ya existe un juego para este parent, devolvemos esa instancia
    if (win.__phaserGames[parentId]) {
        // Keep a convenient reference for legacy code
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

    // Calcular tamaño desde el parent si no se provee
    const parentRect = parentEl.getBoundingClientRect();
    const width = cfg.width ?? Math.max(300, Math.round(parentRect.width));
    const height = cfg.height ?? Math.max(200, Math.round(parentRect.height));

    const centerX = cfg.x ?? Math.round(width / 2);
    const centerY = cfg.y ?? Math.round(height / 2);

    const scene: any = {
        key: `MainScene_${parentId}`,
        preload: function (this: Phaser.Scene) {
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            for (const s of sprites) {
                const fw = s.frameWidth ?? frameW;
                const fh = s.frameHeight ?? frameH;
                if (s.frameCount === 1) {
                    this.load.image(s.key, s.path);
                } else {
                    this.load.spritesheet(s.key, s.path, { frameWidth: fw, frameHeight: fh });
                }
            }
        },
        create: function (this: Phaser.Scene) {
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            // Crear animaciones
            for (const s of sprites) {
                let count = s.frameCount ?? frameCount;
                try {
                    if (count == null && this.textures.exists(s.key)) {
                        const src = this.textures.get(s.key).getSourceImage();
                        if (src && src.width && (s.frameWidth ?? frameW)) {
                            count = Math.floor(src.width / (s.frameWidth ?? frameW));
                        }
                    }
                } catch (e) { }

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

            // Crear Sprite Principal (Kimu) centrado en el parent
            const idle = sprites.find((x: any) => /idle/i.test(x.key));
            const main = idle ?? sprites[0];
            const sprite = this.add.sprite(centerX, centerY, main.key).setScale(cfg.scale ?? 1);
            if (this.anims.exists(`${main.key}-anim`)) {
                sprite.play(`${main.key}-anim`);
            }
            sprite.setName('character');

            sprite.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
                if (anim.key !== `${main.key}-anim`) {
                    sprite.play(`${main.key}-anim`);
                }
            });

            // Object pool: especificamos classType y un createCallback para inicializar correctamente
            throwablesGroup = this.add.group({
                classType: Phaser.GameObjects.Sprite as any,
                defaultKey: 'throwable',
                maxSize: 50,
                runChildUpdate: false,
                createCallback: (obj: Phaser.GameObjects.GameObject) => {
                    try {
                        const s = obj as Phaser.GameObjects.Sprite;
                        s.setActive(false).setVisible(false);
                        s.setScale(0.4);
                        s.setDepth(1000);
                    } catch (e) { }
                }
            });

            // Attach group to scene for easy lookup by spawn/handle functions
            try {
                (this as any).__throwablesGroup = throwablesGroup;
            } catch (e) { }
        },
        update: function (this: Phaser.Scene, _time: number, _delta: number) { },
    } as any;

    const phaserConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: parentId,
        pixelArt: true,
        backgroundColor: '#000000',
        scene,
        transparent: true,
    };

    const game = new Phaser.Game(phaserConfig);
    win.__phaserGames[parentId] = game;
    // Also set a default reference for older callers expecting a single game
    win.__phaserGame = game;
    return game;
}

export function playCharacterAnimation(animKey: string) {
    const win = window as any;
    // Try legacy single-game pointer first
    if (win.__phaserGame) {
        try {
            const game: Phaser.Game = win.__phaserGame;
            for (const k of Object.keys(game.scene.keys)) {
                const scene = game.scene.keys[k] as Phaser.Scene | undefined;
                if (!scene) continue;
                const spriteObj = scene.children.getByName('character') as Phaser.GameObjects.Sprite | undefined;
                if (spriteObj) {
                    const finalKey = animKey.endsWith('-anim') ? animKey : `${animKey}-anim`;
                    spriteObj.play(finalKey);
                    return true;
                }
            }
        } catch (e) { }
    }

    // Otherwise search across registered games
    if (win.__phaserGames) {
        for (const pid of Object.keys(win.__phaserGames)) {
            try {
                const game: Phaser.Game = win.__phaserGames[pid];
                if (!game) continue;
                for (const k of Object.keys(game.scene.keys)) {
                    const scene = game.scene.keys[k] as Phaser.Scene | undefined;
                    if (!scene) continue;
                    const spriteObj = scene.children.getByName('character') as Phaser.GameObjects.Sprite | undefined;
                    if (spriteObj) {
                        const finalKey = animKey.endsWith('-anim') ? animKey : `${animKey}-anim`;
                        spriteObj.play(finalKey);
                        return true;
                    }
                }
            } catch (e) { }
        }
    }

    return false;
}

// --- MÓDULOS DE FÍSICA Y REACCIÓN ---

/**
 * 1. SPAWN (Aproximación)
 * Utiliza Object Pooling para obtener una bola disponible.
 */
export function spawnThrowable(duration: number = 600) {
    const win = window as any;
    // Find the active scene that contains our character sprite. Prefer scenes that have the 'character' child.
    let scene: Phaser.Scene | undefined;
    if (win.__phaserGame) {
        const g: Phaser.Game = win.__phaserGame;
        for (const k of Object.keys(g.scene.keys)) {
            const s = g.scene.keys[k] as Phaser.Scene | undefined;
            if (!s) continue;
            if (s.children.getByName('character')) { scene = s; break; }
            if (!scene) scene = s;
        }
    }
    if (!scene && win.__phaserGames) {
        for (const pid of Object.keys(win.__phaserGames)) {
            try {
                const g: Phaser.Game = win.__phaserGames[pid];
                for (const k of Object.keys(g.scene.keys)) {
                    const s = g.scene.keys[k] as Phaser.Scene | undefined;
                    if (!s) continue;
                    if (s.children.getByName('character')) { scene = s; break; }
                    if (!scene) scene = s;
                }
                if (scene) break;
            } catch (e) { }
        }
    }
    if (!scene) return;

    // Configuración de posiciones
    const startX = scene.scale.width + 100; // Fuera derecha
    const character = scene.children.getByName('character') as Phaser.GameObjects.Sprite;
    const endX = character ? character.x : scene.scale.width / 2;
    const baseY = character ? character.y : scene.scale.height / 2;

    // --- OBTENER DEL POOL ---
    // Prefer group attached to the scene; otherwise create and attach one
    let sceneGroup: Phaser.GameObjects.Group | undefined = (scene as any).__throwablesGroup as Phaser.GameObjects.Group | undefined;
    if (!sceneGroup) {
        sceneGroup = scene.add.group({
            classType: Phaser.GameObjects.Sprite as any,
            defaultKey: 'throwable',
            maxSize: 50,
            runChildUpdate: false,
        });
        try { (scene as any).__throwablesGroup = sceneGroup; } catch (e) { }
    }

    // 'get' busca uno inactivo o crea uno nuevo si no hay libres y no excedimos el maxSize
    const sprite = sceneGroup.get(startX, baseY) as Phaser.GameObjects.Sprite | undefined;

    // Debug info: ayuda a diagnosticar aparición/posición de los throwables
    try {
        // eslint-disable-next-line no-console
        console.debug('spawnThrowable', { startX, baseY, endX, activePoolSize: sceneGroup ? (sceneGroup.getLength ? sceneGroup.getLength() : undefined) : undefined });
    } catch (e) { }

    if (!sprite) {
        console.warn('Pool de throwables lleno o no inicializado');
        return;
    }

    // Asegurar que el sprite tenga la textura correcta
    try {
        if (!sprite.texture || sprite.texture.key !== 'throwable') {
            sprite.setTexture('throwable');
        }
        sprite.setOrigin(0.5, 0.5);
    } catch (e) { }

    // --- RESETEO PROFUNDO DE ESTADO ---
    // Como el sprite es reciclado, puede tener propiedades "sucias" de su vida anterior (hit/miss)
    sprite.setActive(true).setVisible(true);
    sprite.setAlpha(1);
    sprite.setScale(0.4);
    sprite.setRotation(0);
    sprite.clearTint(); // Importante: quitar el color del 'Hit' anterior
    sprite.setDepth(1001);

    // Matar cualquier tween viejo que pudiera haber quedado colgado (safety check)
    scene.tweens.killTweensOf(sprite);

    // Iniciar animación visual loop
    const animKey = `${sprite.texture.key}-anim`;
    if (scene.anims.exists(animKey)) sprite.play(animKey);

    // Tween de aproximación (Parábola simple)
    scene.tweens.add({
        targets: sprite,
        x: endX,
        duration: duration,
        // Rotación completa 2 Vueltas (2 PI * 2)
        rotation: { from: 0, to: Math.PI * 4 },
        onUpdate: (tween) => {
            const t = tween.progress;
            const height = -100;
            // Ecuación parabólica
            const offsetY = height * (4 * t * (1 - t));
            if (sprite.active) {
                sprite.y = baseY + offsetY;
            }
        },
        onComplete: () => {
            // Si llega al final sin ser golpeada (el jugador no presionó nada)
            // Simplemente la devolvemos al pool silenciosamente (o aplicamos fade out)
            if (sprite.active) {
                // Opción: Ocultar y matar inmediatamente
                throwablesGroup?.killAndHide(sprite);
            }
        }
    });
}

/**
 * 2. REACTION (Resultado)
 * Busca la bola ACTIVA más cercana y aplica la física.
 */
export function handleThrowableReaction(result: 'hit' | 'delay' | 'miss') {
    // Similar to spawnThrowable: find the scene that contains the character and use its group
    const win = window as any;
    let scene: Phaser.Scene | undefined;
    if (win.__phaserGame) {
        const g: Phaser.Game = win.__phaserGame;
        for (const k of Object.keys(g.scene.keys)) {
            const s = g.scene.keys[k] as Phaser.Scene | undefined;
            if (!s) continue;
            if (s.children.getByName('character')) { scene = s; break; }
            if (!scene) scene = s;
        }
    }
    if (!scene && win.__phaserGames) {
        for (const pid of Object.keys(win.__phaserGames)) {
            try {
                const g: Phaser.Game = win.__phaserGames[pid];
                for (const k of Object.keys(g.scene.keys)) {
                    const s = g.scene.keys[k] as Phaser.Scene | undefined;
                    if (!s) continue;
                    if (s.children.getByName('character')) { scene = s; break; }
                    if (!scene) scene = s;
                }
                if (scene) break;
            } catch (e) { }
        }
    }
    if (!scene) return;

    // Obtener todas las bolas activas del grupo del scene
    const sceneGroup: Phaser.GameObjects.Group | undefined = (scene as any).__throwablesGroup as Phaser.GameObjects.Group | undefined;
    if (!sceneGroup) return;

    // getChildren() devuelve array de GameObjects, filtramos los activos y visibles
    const activeThrowables = sceneGroup.getChildren().filter(
        (t: any) => t.active && t.visible
    ) as Phaser.GameObjects.Sprite[];

    if (activeThrowables.length === 0) return;

    // Escoger el throwable más cercano al personaje
    const character = scene.children.getByName('character') as Phaser.GameObjects.Sprite | undefined;
    const refX = character ? character.x : (scene.scale.width / 2);

    // Ordenar por distancia absoluta al personaje
    activeThrowables.sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX));

    // El objetivo es el más cercano
    const target = activeThrowables[0];

    // Detener el movimiento de llegada
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

// --- Helpers para reciclar ---

function recycleSprite(sprite: Phaser.GameObjects.Sprite) {
    if (throwablesGroup) {
        throwablesGroup.killAndHide(sprite);
    } else {
        sprite.setVisible(false).setActive(false);
    }
}

// --- Lógica Privada de Reacciones ---

function performDelayReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    // "Delay": Brinco y caída libre
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
                y: scene.scale.height + 100, // Fuera pantalla abajo
                x: sprite.x - 80,
                duration: 500,
                ease: 'Quad.In',
                onComplete: () => recycleSprite(sprite) // DEVOLVER AL POOL
            }
        ]
    });
}

function performMissReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    // "Miss": Cae por gravedad
    scene.tweens.add({
        targets: sprite,
        y: scene.scale.height + 100,
        x: sprite.x - 30,
        rotation: sprite.rotation + 0.5,
        duration: 600,
        ease: 'Bounce.Out',
        onComplete: () => recycleSprite(sprite) // DEVOLVER AL POOL
    });
}

function performHitReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    // "Hit": Rebote hacia la derecha

    const directionY = Math.random() > 0.5 ? -1 : 1;
    const distanceX = 600 + Math.random() * 200;
    const distanceY = 300 + Math.random() * 200;

    const targetX = sprite.x + distanceX;
    const targetY = sprite.y + (distanceY * directionY);

    // Efecto visual
    sprite.setTint(0xffaa00);
    // Nota: No usamos setTimeout aquí porque puede ejecutarse después de que el sprite se haya reciclado
    // Mejor usar un tween de color o un timer de escena, pero por simplicidad:
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
        onComplete: () => recycleSprite(sprite) // DEVOLVER AL POOL
    });
}