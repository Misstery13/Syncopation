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

// Variable interna para mantener la referencia al sprite
let throwableSprite: Phaser.GameObjects.Sprite | null = null;

// --- FUNCIONES DE INICIALIZACIÓN ---

export function startPhaser(cfg: PhaserRendererConfig = {}) {
    const win = window as any;
    if (win.__phaserGame) return win.__phaserGame;

    const parentId = cfg.parentId ?? 'phaser-root';
    let parentEl = document.getElementById(parentId);
    if (!parentEl) {
        parentEl = document.createElement('div');
        parentEl.id = parentId;
        parentEl.style.position = 'relative';
        parentEl.style.zIndex = '9999';
        document.body.appendChild(parentEl);
    }

    const existingCanvas = document.getElementById('gameCanvas');
    if (existingCanvas) existingCanvas.style.display = 'none';

    // Configuración de defaults
    const spriteKey = cfg.spriteKey ?? 'player';
    const spritePath = cfg.spritePath ?? '/assets/images/sprites/Kimu-Idle.png';
    const frameW = cfg.frameWidth ?? 64;
    const frameH = cfg.frameHeight ?? 64;
    const frameCount = cfg.frameCount ?? 8;
    const frameRate = cfg.frameRate ?? 10;

    const scene: any = {
        key: 'MainScene',
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
                // Intento de inferir frames si no se pasan
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

                if (finalCount > 1) {
                    this.anims.create({
                        key: animKey,
                        frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: finalCount - 1 }),
                        frameRate: rate,
                        repeat: s.loop === false ? 0 : -1,
                    });
                }
            }

            // Crear Sprite Principal (Kimu)
            const idle = sprites.find((x: any) => /idle/i.test(x.key));
            const main = idle ?? sprites[0];
            const x = cfg.x ?? this.scale.width / 2;
            const y = cfg.y ?? this.scale.height / 2;
            const sprite = this.add.sprite(x, y, main.key).setScale(cfg.scale ?? 1);
            sprite.play(`${main.key}-anim`);
            sprite.setName('character');

            sprite.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
                if (anim.key !== `${main.key}-anim`) {
                    sprite.play(`${main.key}-anim`);
                }
            });

            // Crear Sprite Throwable (oculto inicialmente fuera de pantalla)
            // Se asume que 'throwable' fue pasado en la config sprites
            const throwableStartX = this.scale.width + 100;
            throwableSprite = this.add.sprite(throwableStartX, y, 'throwable')
                .setScale(0.4)
                .setName('throwable')
                .setVisible(false) // Invisible hasta que spawnThrowable lo llame
                .setActive(false);

            try { throwableSprite.setDepth(1001); } catch (e) { }
        },
        update: function (this: Phaser.Scene, _time: number, _delta: number) { },
    } as any;

    const phaserConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: cfg.width ?? window.innerWidth,
        height: cfg.height ?? window.innerHeight,
        parent: parentId,
        backgroundColor: '#000000',
        scene,
        transparent: true,
    };

    const game = new Phaser.Game(phaserConfig);
    win.__phaserGame = game;
    return game;
}

export function playCharacterAnimation(animKey: string) {
    const win = window as any;
    const game: Phaser.Game | undefined = win.__phaserGame;
    if (!game) return false;
    const scene = game.scene.keys['MainScene'] as Phaser.Scene | undefined;
    if (!scene) return false;

    const spriteObj = scene.children.getByName('character') as Phaser.GameObjects.Sprite | undefined;
    if (!spriteObj) return false;

    const finalKey = animKey.endsWith('-anim') ? animKey : `${animKey}-anim`;
    try {
        spriteObj.play(finalKey);
        return true;
    } catch (e) {
        return false;
    }
}

// --- MÓDULOS DE FÍSICA Y REACCIÓN ---

/**
 * 1. SPAWN (Aproximación)
 * Esta función debe llamarse desde el gameLoop para lanzar el objeto hacia el jugador.
 */
export function spawnThrowable(duration: number = 600) {
    const win = window as any;
    const game: Phaser.Game | undefined = win.__phaserGame;
    if (!game || !throwableSprite || !throwableSprite.scene) return;

    const scene = throwableSprite.scene;

    // Matar tweens anteriores para reiniciar
    scene.tweens.killTweensOf(throwableSprite);

    // Configuración de posiciones
    const startX = scene.scale.width + 100; // Fuera derecha
    // Objetivo: Posición del personaje (centro)
    const character = scene.children.getByName('character') as Phaser.GameObjects.Sprite;
    const endX = character ? character.x : scene.scale.width / 2;
    const baseY = character ? character.y : scene.scale.height / 2;

    // Resetear estado del sprite
    throwableSprite.setPosition(startX, baseY);
    throwableSprite.setVisible(true);
    throwableSprite.setActive(true);
    throwableSprite.setAlpha(1);
    throwableSprite.setRotation(0);

    // Iniciar animación visual del sprite (girando, brillando, etc)
    const animKey = `${throwableSprite.texture.key}-anim`;
    if (scene.anims.exists(animKey)) throwableSprite.play(animKey);

    // Tween de aproximación (Parábola simple)
    scene.tweens.add({
        targets: throwableSprite,
        x: endX,
        duration: duration,
        // Rotación continua mientras se acerca
        rotation: { from: 0, to: Math.PI * 2 },
        onUpdate: (tween) => {
            const t = tween.progress;
            // Pequeña curva parabólica para que no se vea plano
            const height = -100; // Altura del arco
            const offsetY = height * (4 * t * (1 - t));
            throwableSprite!.y = baseY + offsetY;
        }
    });
}

/**
 * 2. REACTION (Resultado)
 * Esta función debe llamarse desde el controlador de Input (handleInput)
 * cuando se determina el resultado (Hit, Delay, Miss).
 */
export function handleThrowableReaction(result: 'hit' | 'delay' | 'miss') {
    if (!throwableSprite || !throwableSprite.scene) return;
    const scene = throwableSprite.scene;

    // IMPORTANTE: Detener el movimiento de aproximación inmediatamente
    scene.tweens.killTweensOf(throwableSprite);

    switch (result) {
        case 'delay':
            performDelayReaction(scene, throwableSprite);
            break;
        case 'miss':
            performMissReaction(scene, throwableSprite);
            break;
        case 'hit':
            performHitReaction(scene, throwableSprite);
            break;
    }
}

// --- Lógica Privada de Reacciones Específicas ---

function performDelayReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    // "Delay": Brinco y caída libre usando CHAIN (Phaser 3.60+)

    scene.tweens.chain({
        targets: sprite, // El objetivo por defecto para todos los tweens en la cadena
        tweens: [
            // 1. Brinco hacia arriba (corto y rápido)
            {
                y: sprite.y - 150,
                x: sprite.x - 50,
                duration: 200,
                ease: 'Power1',
                angle: sprite.angle + 45, // Usar angle en lugar de rotation para grados si prefieres, o rotation para radianes
            },
            // 2. Caída libre (Gravedad)
            {
                y: scene.scale.height + 100, // Cae fuera de la pantalla
                x: sprite.x - 80,
                duration: 500,
                ease: 'Quad.In', // Aceleración de gravedad
                onComplete: () => {
                    sprite.setVisible(false).setActive(false);
                }
            }
        ]
    });
}

function performMissReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    // "Miss": Simplemente cae por gravedad (triste)
    scene.tweens.add({
        targets: sprite,
        y: scene.scale.height + 100, // Suelo/Fuera
        x: sprite.x - 30, // Inercia residual mínima
        rotation: sprite.rotation + 0.5, // Rota perezosamente
        duration: 600,
        ease: 'Bounce.Out', // Puede rebotar un poco si definimos un suelo, o simplemente caer
        onComplete: () => {
            sprite.setVisible(false).setActive(false);
        }
    });
}

function performHitReaction(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    // "Hit": Sale disparada hacia la DERECHA (rebote)

    // Calcular vector aleatorio hacia arriba o abajo
    const directionY = Math.random() > 0.5 ? -1 : 1;

    // Fuerza horizontal positiva para ir a la derecha
    const distanceX = 600 + Math.random() * 200; // Agregué un poco de variación aleatoria también
    const distanceY = 300 + Math.random() * 200; // Fuerza vertical aleatoria

    // CORRECCIÓN AQUÍ: Sumamos (+) distanceX para ir a la derecha
    const targetX = sprite.x + distanceX;
    const targetY = sprite.y + (distanceY * directionY);

    // Efecto de impacto visual
    sprite.setTint(0xffaa00); // Flash amarillo momentáneo
    setTimeout(() => sprite.clearTint(), 100);

    scene.tweens.add({
        targets: sprite,
        x: targetX,
        y: targetY,
        angle: 720, // Giro rápido
        duration: 500, // Un poco más lento para verla volar de regreso
        ease: 'Cubic.Out', // Sale disparado rápido y desacelera
        onComplete: () => {
            sprite.setVisible(false).setActive(false);
        }
    });
}