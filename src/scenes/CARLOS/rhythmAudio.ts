let sfxHit: HTMLAudioElement | null = null;
let sfxDelay: HTMLAudioElement | null = null;
let sfxMiss: HTMLAudioElement | null = null;
let sfxSpawn: HTMLAudioElement | null = null;
const activeSfxClones = new Set<HTMLAudioElement>();

export function loadSfx() {
    try {
        sfxHit = new Audio('/assets/audio/Cymatics - Deluxe Lofi Clap.wav'); sfxHit.volume = 0.7;
        sfxDelay = new Audio('/assets/audio/Cymatics - Tooth Hihat.wav'); sfxDelay.volume = 0.8;
        sfxMiss = new Audio('/assets/audio/Cymatics - Leaves Open Hihat.wav'); sfxMiss.volume = 0.7;
        // sfxSpawn = new Audio('/assets/audio/kick-yarn-ball.mp3'); sfxSpawn.volume = 0.5;
    } catch (e) { console.warn('Audio Error', e); }
}

export function playSfx(type: 'hit' | 'delay' | 'miss' | 'spawn') {
    try {
        let sound: HTMLAudioElement | null = null;
        if (type === 'hit') sound = sfxHit;
        else if (type === 'delay') sound = sfxDelay;
        else if (type === 'miss') sound = sfxMiss;
        else if (type === 'spawn') sound = sfxSpawn;

        if (sound) {
            const clone = sound.cloneNode() as HTMLAudioElement;
            clone.volume = sound.volume;
            activeSfxClones.add(clone);
            const removeClone = () => {
                activeSfxClones.delete(clone);
                clone.removeEventListener('ended', removeClone);
            };
            clone.addEventListener('ended', removeClone);
            clone.play().catch(() => { });
        }
    } catch (e) { }
}

export function cleanupAudio() {
    try {
        for (const a of Array.from(activeSfxClones)) {
            try { a.pause(); a.currentTime = 0; } catch (e) { }
            activeSfxClones.delete(a);
        }
        if (sfxHit) { sfxHit.pause(); sfxHit = null; }
        if (sfxDelay) { sfxDelay.pause(); sfxDelay = null; }
        if (sfxMiss) { sfxMiss.pause(); sfxMiss = null; }
        if (sfxSpawn) { sfxSpawn.pause(); sfxSpawn = null; }
    } catch (e) { console.warn('cleanupAudio failed', e); }
}
