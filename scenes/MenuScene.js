/* ========================================
   MENU SCENE — Title screen with full map
   background, player preview, start button,
   and music toggle. Designed for 1280x720.
   ======================================== */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const mapW = GAME_CONFIG.MAP_WIDTH;
        const mapH = GAME_CONFIG.MAP_HEIGHT;
        const screenW = this.cameras.main.width;   // 1280
        const screenH = this.cameras.main.height;   // 720

        // ---- Camera: zoomed out, centered on map ----
        this.cameras.main.setZoom(GAME_CONFIG.ZOOM_MENU);
        this.cameras.main.setBackgroundColor(0x050510);
        this.cameras.main.centerOn(mapW / 2, mapH / 2);

        // ---- Draw world-space elements ----
        this._drawMapBackground(mapW, mapH);
        this._drawGrid(mapW, mapH);

        // ---- Player preview at center of map ----
        this.playerPreview = this.add.graphics();
        this.playerPreview.setDepth(10);
        this._drawPlayerAt(this.playerPreview, mapW / 2, mapH / 2);

        this.tweens.add({
            targets: this.playerPreview,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Floating particles ----
        this._createParticles();

        // ==================================================================
        // UI ELEMENTS — All use scrollFactor(0) so they're screen-fixed.
        // Positions are in SCREEN coordinates (1280x720).
        // ==================================================================

        // ---- Title ----
        this.titleText = this.add.text(screenW / 2, 120, 'ACADEMIC\nSURVIVOR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '52px',
            color: '#ff4444',
            align: 'center',
            lineSpacing: 16,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#8b0000',
                blur: 0,
                fill: true,
            },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- Subtitle ----
        this.subtitleText = this.add.text(screenW / 2, 250, 'A SEMESTER ESCAPE SIMULATOR', {
            fontFamily: '"Orbitron"',
            fontSize: '16px',
            color: '#ffcc00',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- Tagline ----
        this.add.text(screenW / 2, 290, 'Draw boundaries. Claim territory. Don\'t get crushed by deadlines.', {
            fontFamily: '"VT323"',
            fontSize: '26px',
            color: '#999999',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- START button ----
        this.startBtn = this.add.text(screenW / 2, 400, '▶  START SEMESTER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#0a0a0f',
            backgroundColor: '#ff4444',
            padding: { x: 36, y: 20 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });

        this.startBtn.on('pointerover', () => {
            this.startBtn.setStyle({ backgroundColor: '#ff6666', color: '#000000' });
            this.startBtn.setScale(1.05);
        });
        this.startBtn.on('pointerout', () => {
            this.startBtn.setStyle({ backgroundColor: '#ff4444', color: '#0a0a0f' });
            this.startBtn.setScale(1.0);
        });
        this.startBtn.on('pointerdown', () => {
            this._startGame();
        });

        this.tweens.add({
            targets: this.startBtn,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Controls hint ----
        this.add.text(screenW / 2, 480, 'WASD / Arrow Keys to move', {
            fontFamily: '"VT323"',
            fontSize: '24px',
            color: '#666666',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- GLOBAL MUSIC MANAGEMENT ----
        let music = this.sound.get("bgMusic");
        if (!music) {
            music = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
        }
        
        this.musicBtn = this.add.text(screenW - 30, 30, music.isPlaying ? '🔊' : '🔇', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: music.isPlaying ? '#44ff88' : '#ff4444',
            backgroundColor: '#111111',
            padding: { x: 14, y: 10 },
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });

        this.musicBtn.on("pointerdown", () => {
            if (music.isPlaying) {
                music.pause();
                this.registry.set('musicMuted', true);
                this.musicBtn.setText("🔇");
                this.musicBtn.setStyle({ color: '#ff4444' });
            } else {
                this.registry.set('musicMuted', false);
                if (music.isPaused) {
                    music.resume();
                } else {
                    music.play();
                }
                this.musicBtn.setText("🔊");
                this.musicBtn.setStyle({ color: '#44ff88' });
            }
        });

        // ---- Badges ----
        const badgeY = 560;
        const badges = [
            { text: 'GENRE: ROGUELIKE HORROR', color: '#ff6b6b' },
            { text: 'DIFFICULTY: IMPOSSIBLE', color: '#44ff88' },
            { text: 'LIVES: 1 (CGPA)', color: '#00d4ff' },
        ];
        const badgeSpacing = 240;
        let bx = screenW / 2 - badgeSpacing;
        badges.forEach(b => {
            this.add.text(bx, badgeY, b.text, {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: b.color,
                backgroundColor: '#0a0a0f',
                padding: { x: 10, y: 6 },
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100)
              .setStroke(b.color, 1);
            bx += badgeSpacing;
        });

        // ---- Footer ----
        this.add.text(screenW / 2, screenH - 35, 'Built under pressure, powered by caffeine and the fear of detention.', {
            fontFamily: '"VT323"',
            fontSize: '20px',
            color: '#333333',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- Title flicker ----
        this.time.addEvent({
            delay: 4000,
            loop: true,
            callback: () => {
                this.tweens.add({
                    targets: this.titleText,
                    alpha: 0.6,
                    duration: 50,
                    yoyo: true,
                    repeat: 1,
                });
            },
        });
    }

    _drawMapBackground(w, h) {
        const bg = this.add.graphics();
        bg.setDepth(0);
        bg.fillStyle(0x0d0d18, 1);
        bg.fillRect(0, 0, w, h);
        bg.lineStyle(4, GAME_CONFIG.BORDER_COLOR, 0.8);
        bg.strokeRect(2, 2, w - 4, h - 4);
        bg.lineStyle(1, 0x331111, 0.5);
        bg.strokeRect(10, 10, w - 20, h - 20);
    }

    _drawGrid(w, h) {
        const gridGfx = this.add.graphics();
        gridGfx.setDepth(0);
        gridGfx.lineStyle(1, 0x111122, 0.3);
        const step = GAME_CONFIG.CELL_SIZE * 5;
        for (let x = 0; x <= w; x += step) {
            gridGfx.moveTo(x, 0);
            gridGfx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += step) {
            gridGfx.moveTo(0, y);
            gridGfx.lineTo(w, y);
        }
        gridGfx.strokePath();
    }

    _drawPlayerAt(gfx, x, y) {
        gfx.fillStyle(0x00ff88, 0.15);
        gfx.fillCircle(x, y, 24);
        gfx.fillStyle(0x00ff88, 0.9);
        gfx.fillCircle(x, y, GAME_CONFIG.PLAYER_SIZE);
        gfx.fillStyle(0xffffff, 0.4);
        gfx.fillCircle(x - 4, y - 4, 5);
    }

    _createParticles() {
        const mapW = GAME_CONFIG.MAP_WIDTH;
        const mapH = GAME_CONFIG.MAP_HEIGHT;
        for (let i = 0; i < 40; i++) {
            const dot = this.add.circle(
                Phaser.Math.Between(0, mapW),
                Phaser.Math.Between(0, mapH),
                Phaser.Math.Between(1, 3),
                0xff4444,
                Phaser.Math.FloatBetween(0.05, 0.2)
            ).setDepth(2);
            this.tweens.add({
                targets: dot,
                y: dot.y + Phaser.Math.Between(-80, 80),
                x: dot.x + Phaser.Math.Between(-80, 80),
                alpha: { from: dot.alpha, to: 0 },
                duration: Phaser.Math.Between(3000, 8000),
                repeat: -1,
                yoyo: true,
            });
        }
    }

    _startGame() {
        let music = this.sound.get("bgMusic");
        let isMuted = this.registry.get('musicMuted');
        if (music && !music.isPlaying && !isMuted) {
            music.play();
        }

        this.startBtn.disableInteractive();
        this.startBtn.setAlpha(0.5);

        const cx = GAME_CONFIG.MAP_WIDTH / 2;
        const cy = GAME_CONFIG.MAP_HEIGHT / 2;

        this.cameras.main.pan(cx, cy, 1500, 'Sine.easeInOut');
        this.cameras.main.zoomTo(GAME_CONFIG.ZOOM_GAME_START, 1500, 'Sine.easeInOut');

        this.tweens.add({
            targets: [this.titleText, this.subtitleText, this.startBtn],
            alpha: 0,
            duration: 800,
        });

        this.time.delayedCall(1600, () => {
            this.scene.start('GameScene');
        });
    }
}
