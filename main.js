/* ========================================
   MAIN.JS — Phaser 3 Game Configuration
   Entry point that initializes the game.
   ======================================== */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
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
    scene: [BootScene, MenuScene, GameScene, GameOverScene, WinScene],
    audio: {
        disableWebAudio: false,
    },
};

// Create and start the game
const game = new Phaser.Game(config);
