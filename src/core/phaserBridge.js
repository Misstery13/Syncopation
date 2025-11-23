// This module avoids bare `import 'phaser'` so it can be loaded directly by the browser.
// It will try to use `window.Phaser` (if loaded via CDN) or inject the CDN script automatically.

function ensurePhaserLoaded() {
    const win = window;
    if (win.Phaser) return Promise.resolve(win.Phaser);
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-phaser-cdn]');
        if (existing) {
            existing.addEventListener('load', () => resolve(win.Phaser));
            existing.addEventListener('error', (e) => reject(e));
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js';
        s.async = true;
        s.setAttribute('data-phaser-cdn', 'true');
        s.onload = () => {
            if (win.Phaser) resolve(win.Phaser);
            else reject(new Error('Phaser loaded but window.Phaser not found'));
        };
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
    });
}

export async function startPhaser(cfg = {}) {
    const Phaser = await ensurePhaserLoaded();
    const win = window;
    if (win.__phaserGame) return win.__phaserGame;

    const parentId = cfg.parentId || 'phaser-root';
    let parentEl = document.getElementById(parentId);
    if (!parentEl) {
        parentEl = document.createElement('div');
        parentEl.id = parentId;
        parentEl.style.position = 'relative';
        document.body.appendChild(parentEl);
    }

    const existingCanvas = document.getElementById('gameCanvas');
    if (existingCanvas) existingCanvas.style.display = 'none';

    const spriteKey = cfg.spriteKey || 'player';
    const spritePath = cfg.spritePath || '/assets/images/sprites/Kimu-Idle.png';
    const frameW = cfg.frameWidth || 64;
    const frameH = cfg.frameHeight || 64;
    const frameCount = cfg.frameCount || 8;
    const frameRate = cfg.frameRate || 10;

    const scene = {
        key: 'MainScene',
        preload: function () {
            const sprites = cfg.sprites || [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];
            for (const s of sprites) {
                const fw = s.frameWidth || frameW;
                const fh = s.frameHeight || frameH;
                this.load.spritesheet(s.key, s.path, { frameWidth: fw, frameHeight: fh });
            }
        },
        create: function () {
            const sprites = cfg.sprites || [
                { key: spriteKey, path: spritePath, frameWidth: frameW, frameHeight: frameH, frameCount, frameRate }
            ];
            for (const s of sprites) {
                const tex = this.textures.get(s.key);
                let count = s.frameCount;
                if (!count && tex && tex.getSourceImage) {
                    try {
                        const img = tex.getSourceImage();
                        count = Math.floor(img.width / (s.frameWidth || frameW));
                    } catch (e) {
                        count = frameCount;
                    }
                }
                const rate = s.frameRate || frameRate;
                const animKey = `${s.key}-anim`;
                this.anims.create({ key: animKey, frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: (count || frameCount) - 1 }), frameRate: rate, repeat: s.loop === false ? 0 : -1 });
            }
            const idle = sprites.find(x => /idle/i.test(x.key));
            const main = idle || sprites[0];
            const x = cfg.x || this.scale.width / 2;
            const y = cfg.y || this.scale.height / 2;
            this.add.sprite(x, y, main.key).setScale(cfg.scale || 1).play(`${main.key}-anim`);
        },
        update: function () { }
    };

    const phaserConfig = {
        type: Phaser.AUTO,
        width: cfg.width || window.innerWidth,
        height: cfg.height || window.innerHeight,
        parent: parentId,
        backgroundColor: '#000000',
        scene
    };

    const game = new Phaser.Game(phaserConfig);
    win.__phaserGame = game;
    return game;
}

export function playSpriteAnimation(spriteKey, animName) {
    const win = window;
    const game = win.__phaserGame;
    if (!game) return false;
    const scene = game.scene.keys['MainScene'];
    if (!scene) return false;
    const spriteObj = scene.children.list.find(c => c.texture && c.texture.key === spriteKey);
    if (!spriteObj) return false;
    const animToPlay = animName || `${spriteKey}-anim`;
    try {
        spriteObj.play(animToPlay);
        return true;
    } catch (e) {
        console.warn('Could not play animation', animToPlay, e);
        return false;
    }
}
