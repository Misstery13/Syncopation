import { startPhaser } from '../../core/phaserBridge';

export function initPhaserForTest() {
    console.log('Initializing Phaser for Test...');
    try {
        startPhaser({
            parentId: 'phaser-root',
            sprites: [
                { key: 'Kimu-Idle', path: '/assets/images/sprites/Kimu-Idle.png', frameWidth: 64, frameHeight: 64, frameRate: 8, loop: true },
                { key: 'Kimu-punch-right', path: '/assets/images/sprites/Kimu-punch-right.png', frameWidth: 64, frameHeight: 64, frameRate: 12, loop: false },
                { key: 'Kimu-punch-left', path: '/assets/images/sprites/Kimu-punch-left.png', frameWidth: 64, frameHeight: 64, frameRate: 12, loop: false },

                { key: 'throwable', path: '/assets/images/sprites/throwable.png', frameWidth: 64, frameHeight: 64, frameRate: 1, loop: true },
            ],
            frameWidth: 64,
            frameHeight: 64,
            frameRate: 10,
            scale: 2,
            x: 400, // Center in 800x600 container
            y: 300
        });
        console.log('Phaser initialized successfully.');
    } catch (err) {
        console.error('Error initializing Phaser:', err);
    }
}
