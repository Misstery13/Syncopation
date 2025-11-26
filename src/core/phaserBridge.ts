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
                this.load.spritesheet(s.key, s.path, { frameWidth: fw, frameHeight: fh });
            }
        },
        create: function (this: Phaser.Scene) {
            const sprites = (cfg as any).sprites ?? [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];

            for (const s of sprites) {
                const count = s.frameCount ?? frameCount ?? Math.floor((this.textures.get(s.key).getSourceImage()!.width) / (s.frameWidth ?? frameW));
                const rate = s.frameRate ?? frameRate;
                const animKey = `${s.key}-anim`;
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: count - 1 }),
                    frameRate: rate,
                    repeat: s.loop === false ? 0 : -1,
                });
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
