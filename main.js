/* ========================================
   MAIN.JS — Phaser 3 Game Configuration
   Entry point that initializes the game.
   Higher resolution for sharp text rendering.
   ======================================== */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#0a0a0f',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
        pixelArt: false,
        antialias: true,
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene, WinScene],
    audio: {
        disableWebAudio: false,
    },
};

const game = new Phaser.Game(config);
