/* ========================================
   BOOT SCENE — Preload all assets:
   sprites, background, and audio.
   ======================================== */

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // ---- Loading bar ----
        const barW = 400;
        const barH = 24;
        const barX = (w - barW) / 2;
        const barY = h / 2;

        const bgBar = this.add.graphics();
        bgBar.fillStyle(0x222222, 1);
        bgBar.fillRect(barX, barY, barW, barH);

        const fillBar = this.add.graphics();

        const loadText = this.add.text(w / 2, barY - 40, 'LOADING SEMESTER...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#ff4444',
        }).setOrigin(0.5);

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

        // ---- Load sprite assets ----
        this.load.image('player', 'Assets/Hero.png');
        this.load.image('bg', 'Assets/background.jpg');
        this.load.image('assignments', 'Assets/Level1-Assignmets.png');
        this.load.image('practicals', 'Assets/Level 2-Practicals.png');
        this.load.image('ise', 'Assets/Level 3-ISE.png');
        this.load.image('mse', 'Assets/Level-4-MSE.png');
        this.load.image('ese', 'Assets/Level-5-ESE.png');
        this.load.image('hod', 'Assets/Final boss.png');
        this.load.audio('loseMusic', 'Assets/faaa.mp3');
        this.load.audio('bgMusic', 'Assets/bg_music.mp3');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
