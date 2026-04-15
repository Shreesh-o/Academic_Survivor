/* ========================================
   BOOT SCENE — Preload assets & show loader
   ======================================== */

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a simple loading bar
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        const barW = 300;
        const barH = 20;
        const barX = (w - barW) / 2;
        const barY = h / 2;

        // Background of progress bar
        const bgBar = this.add.graphics();
        bgBar.fillStyle(0x222222, 1);
        bgBar.fillRect(barX, barY, barW, barH);

        // Fill bar
        const fillBar = this.add.graphics();

        // Loading text
        const loadText = this.add.text(w / 2, barY - 30, 'LOADING...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ff4444',
        }).setOrigin(0.5);

        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            fillBar.clear();
            fillBar.fillStyle(0xff4444, 1);
            fillBar.fillRect(barX, barY, barW * value, barH);
        });

        this.load.on('complete', () => {
            bgBar.destroy();
            fillBar.destroy();
            loadText.destroy();
        });

        // ---- Generate placeholder audio as a data blob ----
        // We create a tiny silent audio buffer to use as placeholder music
        // This avoids needing external audio files
        this._generatePlaceholderAudio();
    }

    /**
     * Generate a simple procedural audio tone as placeholder background music.
     * Creates a short looping tone using the Web Audio API and registers it with Phaser.
     */
    _generatePlaceholderAudio() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const sampleRate = audioCtx.sampleRate;
            const duration = 4; // 4 seconds of audio, will loop
            const numSamples = sampleRate * duration;
            const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
            const data = buffer.getChannelData(0);

            // Generate a mellow ambient tone
            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                // Mix of low-frequency sine waves for ambient feel
                const val =
                    Math.sin(2 * Math.PI * 110 * t) * 0.08 +
                    Math.sin(2 * Math.PI * 165 * t) * 0.05 +
                    Math.sin(2 * Math.PI * 220 * t) * 0.03 +
                    Math.sin(2 * Math.PI * 82.5 * t) * 0.06;

                // Apply fade in/out envelope
                let envelope = 1;
                if (t < 0.1) envelope = t / 0.1;
                if (t > duration - 0.1) envelope = (duration - t) / 0.1;

                data[i] = val * envelope;
            }

            // Convert AudioBuffer to WAV blob and add to Phaser cache
            const wavBlob = this._audioBufferToWav(buffer);
            const url = URL.createObjectURL(wavBlob);

            this.load.audio('bgmusic', url);
        } catch (e) {
            console.warn('Could not generate placeholder audio:', e);
        }
    }

    /** Convert an AudioBuffer to a WAV Blob */
    _audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const data = buffer.getChannelData(0);
        const dataLength = data.length * (bitDepth / 8);
        const headerLength = 44;
        const totalLength = headerLength + dataLength;

        const arrayBuffer = new ArrayBuffer(totalLength);
        const view = new DataView(arrayBuffer);

        // WAV header
        this._writeString(view, 0, 'RIFF');
        view.setUint32(4, totalLength - 8, true);
        this._writeString(view, 8, 'WAVE');
        this._writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
        view.setUint16(32, numChannels * (bitDepth / 8), true);
        view.setUint16(34, bitDepth, true);
        this._writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Write PCM samples
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    _writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    create() {
        // Proceed to menu
        this.scene.start('MenuScene');
    }
}
