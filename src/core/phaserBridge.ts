import Phaser from 'phaser';

export interface PhaserRendererConfig {
    parentId?: string;
    spriteKey?: string;
    spritePath?: string; // e.g. '/assets/images/sprites/player.png'
    frameWidth?: number;
    frameHeight?: number;
    frameCount?: number;
    frameRate?: number;
    // permitir pasar múltiples sprites (key/path/size)
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

let throwableSprite: Phaser.GameObjects.Sprite | null = null;

export function startPhaser(cfg: PhaserRendererConfig = {}) {
    const win = window as any;
    if (win.__phaserGame) return win.__phaserGame; // already running

    const parentId = cfg.parentId ?? 'phaser-root';
    let parentEl = document.getElementById(parentId);
    if (!parentEl) {
        parentEl = document.createElement('div');
        parentEl.id = parentId;
        // make sure it sits above other UI if needed
        parentEl.style.position = 'relative';
        document.body.appendChild(parentEl);
    }

    // hide existing canvas used by the old renderer if present
    const existingCanvas = document.getElementById('gameCanvas');
    if (existingCanvas) existingCanvas.style.display = 'none';

    const spriteKey = cfg.spriteKey ?? 'player';
    const spritePath = cfg.spritePath ?? '/assets/images/sprites/Kimu-Idle.png';
    const frameW = cfg.frameWidth ?? 64;
    const frameH = cfg.frameHeight ?? 64;
    const frameCount = cfg.frameCount ?? 8;
    const frameRate = cfg.frameRate ?? 10;

    // Use a permissive type for the scene object to avoid mismatches with Phaser's exported types
    const scene: any = {
        key: 'MainScene',
        preload: function (this: Phaser.Scene) {
            // support either a single spriteKey/spritePath or a list of sprites via cfg.sprites
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            for (const s of sprites) {
                const fw = s.frameWidth ?? frameW;
                const fh = s.frameHeight ?? frameH;
                // If the sprite is a single-frame image, load as image instead of spritesheet
                if (s.frameCount === 1) {
                    this.load.image(s.key, s.path);
                } else {
                    this.load.spritesheet(s.key, s.path, { frameWidth: fw, frameHeight: fh });
                }
            }

            // Debug: listar claves que se están precargando
            try {
                // eslint-disable-next-line no-console
                console.log('[startPhaser] Preloading sprites:', sprites.map((s: any) => s.key));
            } catch (e) { }
        },
        create: function (this: Phaser.Scene) {
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            for (const s of sprites) {
                // Determine frame count safely
                let count = s.frameCount ?? frameCount;
                try {
                    if (count == null && this.textures.exists(s.key)) {
                        const src = this.textures.get(s.key).getSourceImage();
                        if (src && src.width && (s.frameWidth ?? frameW)) {
                            count = Math.floor(src.width / (s.frameWidth ?? frameW));
                        }
                    }
                } catch (e) {
                    // ignore and fall back
                }

                const finalCount = count ?? 1;
                const rate = s.frameRate ?? frameRate;
                const animKey = `${s.key}-anim`;

                // Only create animations if there are multiple frames
                if (finalCount > 1) {
                    this.anims.create({
                        key: animKey,
                        frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: finalCount - 1 }),
                        frameRate: rate,
                        repeat: s.loop === false ? 0 : -1,
                    });
                    try {
                        // eslint-disable-next-line no-console
                        console.log(`[startPhaser] Created anim: ${animKey} (frames=${finalCount}, rate=${rate})`);
                        // eslint-disable-next-line no-console
                        console.log(`[startPhaser] Texture exists for ${s.key}:`, !!this.textures.exists(s.key));
                    } catch (e) { }
                } else {
                    try {
                        // eslint-disable-next-line no-console
                        console.log(`[startPhaser] Skipping anim for ${s.key} (single frame)`);
                        // eslint-disable-next-line no-console
                        console.log(`[startPhaser] Texture exists for ${s.key}:`, !!this.textures.exists(s.key));
                    } catch (e) { }
                }
            }

            // By default create the idle sprite in the center if present
            const idle = sprites.find((x: any) => /idle/i.test(x.key));
            const main = idle ?? sprites[0];
            const x = cfg.x ?? this.scale.width / 2;
            const y = cfg.y ?? this.scale.height / 2;
            const sprite = this.add.sprite(x, y, main.key).setScale(cfg.scale ?? 1);
            sprite.play(`${main.key}-anim`);
            sprite.setName('character'); // Give it a name to find it later

            // Listen for animation complete to return to idle
            sprite.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
                if (anim.key !== `${main.key}-anim`) {
                    sprite.play(`${main.key}-anim`);
                }
            });

            //Se crea una instancia de throwable fuera de la pantalla del lado derecho
            throwableSprite = this.add.sprite(this.scale.width, y + 50, 'throwable').setScale(1).setName('throwable');
            try {
                // eslint-disable-next-line no-console
                console.log('[startPhaser] throwable sprite created at', throwableSprite.x, throwableSprite.y, 'visible?', throwableSprite.visible);
                // eslint-disable-next-line no-console
                console.log('[startPhaser] throwable texture exists:', !!this.textures.exists('throwable'));
                // eslint-disable-next-line no-console
                console.log('[startPhaser] throwable anim exists:', this.anims.exists('throwable-anim'));
            } catch (e) { }
        },
        update: function (this: Phaser.Scene, _time: number, _delta: number) {
            // placeholder for future updates
        },
    } as any;

    const phaserConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: cfg.width ?? window.innerWidth,
        height: cfg.height ?? window.innerHeight,
        parent: parentId,
        backgroundColor: '#000000',
        scene,
        transparent: true, // Allow transparency if needed
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

    // If the animation key doesn't end with -anim, append it (helper)
    const finalKey = animKey.endsWith('-anim') ? animKey : `${animKey}-anim`;

    try {
        spriteObj.play(finalKey);
        return true;
    } catch (e) {
        console.warn('Could not play animation', finalKey, e);
        return false;
    }
}
// Force recompile 2
export function launchThrowable(timingWindow: 'hit' | 'delay' | 'miss') {
    // 1. CORRECCIÓN: Renombrar el parámetro a 'timingWindow' para evitar conflicto con la variable global 'window'.
    const win = window as any;
    const game: Phaser.Game | undefined = win.__phaserGame;
    // Debug: indicar que la función fue llamada
    try {
        // eslint-disable-next-line no-console
        console.log('[launchThrowable] invoked');
    } catch (e) { }

    // También añadimos una comprobación para asegurar que la escena existe
    if (!game || !throwableSprite || !throwableSprite.scene) {
        try {
            // eslint-disable-next-line no-console
            console.log('[launchThrowable] aborting — game or throwableSprite missing', { hasGame: !!game, hasThrowable: !!throwableSprite });
        } catch (e) { }
        return;
    }

    // Usamos el objeto scene asociado al sprite (ya que un Sprite sabe a qué escena pertenece)
    const scene = throwableSprite.scene;

    try {
        // eslint-disable-next-line no-console
        console.log('[launchThrowable] called with', timingWindow, 'throwable state:', {
            x: throwableSprite.x,
            y: throwableSprite.y,
            visible: throwableSprite.visible,
            texture: throwableSprite.texture ? throwableSprite.texture.key : null,
            animExists: scene.anims ? scene.anims.exists(`${throwableSprite.texture.key}-anim`) : false,
        });
    } catch (e) { }

    // Obtenemos la posición X del personaje (que está centrado)
    const characterSprite = scene.children.getByName('character') as Phaser.GameObjects.Sprite | undefined;
    const endX = characterSprite ? characterSprite.x : scene.scale.width / 2;

    // Obtenemos la posición Y base del sprite
    const startX = scene.scale.width + 50;
    const baseY = throwableSprite.y;

    // Reset posición antes de cada lanzamiento
    throwableSprite.setPosition(startX, baseY);
    throwableSprite.setAlpha(1);
    throwableSprite.setActive(true); // Asegurar que está activo
    throwableSprite.setVisible(true); // Asegurar que es visible

    // Asegurar que no haya tweens previos que interfieran
    try {
        scene.tweens.killTweensOf(throwableSprite);
    } catch (e) {
        // no-op
    }

    // Reset rotación
    throwableSprite.rotation = 0;

    // Reproducir la animación del throwable si existe
    const throwableAnimKey = `${throwableSprite.texture.key}-anim`;
    if (scene.anims.exists(throwableAnimKey)) {
        try {
            throwableSprite.play(throwableAnimKey);
        } catch (e) {
            console.warn('No se pudo reproducir la animación del throwable', throwableAnimKey, e);
        }
    }

    // Diferentes duraciones/alturas según hit/delay/miss
    const configByWindow = {
        hit: { duration: 600, height: -150 },
        delay: { duration: 800, height: -100 },
        miss: { duration: 900, height: -50 },
    }[timingWindow]; // 2. CORRECCIÓN: Usar el nuevo nombre del parámetro

    scene.tweens.add({
        targets: throwableSprite,
        x: endX,
        duration: configByWindow.duration,
        // 3. MEJORA: Añadir rotación para un mejor efecto visual
        rotation: {
            from: 0,
            to: 2 * Math.PI, // 2 vueltas completas
        },
        onUpdate: (tween) => {
            const t = tween.progress; // 0..1
            // parábola simple: y = baseY + a*t*(1-t)
            const a = configByWindow.height;
            const offsetY = a * (4 * t * (1 - t)); // campana suave
            throwableSprite!.y = baseY + offsetY; // Usar '!' para decirle a TS que no es nulo aquí
        },
        onComplete: () => {
            // detener animación al completar
            try {
                if (throwableSprite && throwableSprite.anims) throwableSprite.anims.stop();
            } catch (e) {
                // no-op
            }
            if (timingWindow === 'hit') {
                // desaparece al impactar
                scene.tweens.add({
                    targets: throwableSprite,
                    alpha: 0,
                    duration: 150,
                    onComplete: () => {
                        // Resetear posición fuera de la pantalla al finalizar para evitar interacciones accidentales
                        throwableSprite!.setPosition(startX, baseY).setVisible(false).setActive(false);
                    }
                });
            } else {
                // Resetear posición fuera de la pantalla si no es 'hit' (pasa a través o falla)
                throwableSprite!.setPosition(startX, baseY).setVisible(false).setActive(false);
            }
        },
    });
}