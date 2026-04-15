/* ========================================
   MENU SCENE — Title screen with full map
   background, player preview, start button,
   and music toggle.
   ======================================== */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const mapW = GAME_CONFIG.MAP_WIDTH;
        const mapH = GAME_CONFIG.MAP_HEIGHT;

        // ---- Draw the map background ----
        this._drawMapBackground(mapW, mapH);

        // ---- Draw grid lines for visual texture ----
        this._drawGrid(mapW, mapH);

        // ---- Player preview at center ----
        this.playerPreview = this.add.graphics();
        this.playerPreview.setDepth(10);
        const cx = mapW / 2;
        const cy = mapH / 2;
        this._drawPlayerAt(this.playerPreview, cx, cy);

        // ---- Idle animation: gentle pulse ----
        this.tweens.add({
            targets: this.playerPreview,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Camera setup: zoomed out to show full map ----
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.cameras.main.centerOn(cx, cy);
        this.cameras.main.setZoom(GAME_CONFIG.ZOOM_MENU);
        this.cameras.main.setBackgroundColor(0x050510);

        // ---- UI layer (fixed to camera, ignores zoom) ----
        // Title
        const screenW = this.cameras.main.width;
        const screenH = this.cameras.main.height;

        this.titleText = this.add.text(screenW / 2, screenH * 0.28, 'ACADEMIC\nSURVIVOR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '32px',
            color: '#ff4444',
            align: 'center',
            lineSpacing: 12,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#8b0000',
                blur: 0,
                fill: true,
            },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // Subtitle
        this.subtitleText = this.add.text(screenW / 2, screenH * 0.28 + 90, 'A SEMESTER ESCAPE SIMULATOR', {
            fontFamily: '"Orbitron"',
            fontSize: '11px',
            color: '#ffcc00',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // Tagline
        this.add.text(screenW / 2, screenH * 0.28 + 120, 'Draw boundaries. Claim territory. Don\'t get crushed by deadlines.', {
            fontFamily: '"VT323"',
            fontSize: '18px',
            color: '#888888',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- START button ----
        this.startBtn = this.add.text(screenW / 2, screenH * 0.62, '▶  START SEMESTER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#0a0a0f',
            backgroundColor: '#ff4444',
            padding: { x: 24, y: 14 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });

        // Button hover effects
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

        // Button pulse animation
        this.tweens.add({
            targets: this.startBtn,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Controls hint ----
        this.add.text(screenW / 2, screenH * 0.74, 'WASD / Arrow Keys to move', {
            fontFamily: '"VT323"',
            fontSize: '16px',
            color: '#555555',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- Music toggle button (top-right) ----
        this.musicOn = true;
        this.musicBtn = this.add.text(screenW - 20, 20, '🔊 MUSIC: ON', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: '#44ff88',
            backgroundColor: '#111111',
            padding: { x: 10, y: 8 },
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });

        this.musicBtn.on('pointerdown', () => {
            this.musicOn = !this.musicOn;
            this.musicBtn.setText(this.musicOn ? '🔊 MUSIC: ON' : '🔇 MUSIC: OFF');
            this.musicBtn.setStyle({ color: this.musicOn ? '#44ff88' : '#ff4444' });

            // Store preference globally
            this.registry.set('musicOn', this.musicOn);
        });

        // Initialize music preference
        this.registry.set('musicOn', this.musicOn);

        // ---- Badges ----
        const badgeY = screenH * 0.82;
        const badges = [
            { text: 'GENRE: ROGUELIKE HORROR', color: '#ff6b6b' },
            { text: 'DIFFICULTY: IMPOSSIBLE', color: '#44ff88' },
            { text: 'LIVES: 1 (CGPA)', color: '#00d4ff' },
        ];
        const totalBadgeWidth = badges.length * 170;
        let bx = screenW / 2 - totalBadgeWidth / 2 + 85;
        badges.forEach(b => {
            this.add.text(bx, badgeY, b.text, {
                fontFamily: '"Press Start 2P"',
                fontSize: '7px',
                color: b.color,
                backgroundColor: '#0a0a0f',
                padding: { x: 8, y: 5 },
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100)
              .setStroke(b.color, 1);
            bx += 170;
        });

        // ---- Footer ----
        this.add.text(screenW / 2, screenH - 25, 'Built under pressure, powered by caffeine and the fear of detention.', {
            fontFamily: '"VT323"',
            fontSize: '14px',
            color: '#333333',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ---- Floating particles for ambiance ----
        this._createParticles();

        // ---- Title flicker effect ----
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

    /** Draw the dark map background with border */
    _drawMapBackground(w, h) {
        const bg = this.add.graphics();
        bg.setDepth(0);

        // Dark fill
        bg.fillStyle(0x0d0d18, 1);
        bg.fillRect(0, 0, w, h);

        // Border glow
        bg.lineStyle(4, GAME_CONFIG.BORDER_COLOR, 0.8);
        bg.strokeRect(2, 2, w - 4, h - 4);

        // Inner border
        bg.lineStyle(1, 0x331111, 0.5);
        bg.strokeRect(10, 10, w - 20, h - 20);
    }

    /** Subtle grid lines */
    _drawGrid(w, h) {
        const gridGfx = this.add.graphics();
        gridGfx.setDepth(0);
        gridGfx.lineStyle(1, 0x111122, 0.3);

        const step = GAME_CONFIG.CELL_SIZE * 5; // every 5 cells
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

    /** Draw player icon */
    _drawPlayerAt(gfx, x, y) {
        // Outer glow
        gfx.fillStyle(0x00ff88, 0.15);
        gfx.fillCircle(x, y, 24);
        // Body
        gfx.fillStyle(0x00ff88, 0.9);
        gfx.fillCircle(x, y, GAME_CONFIG.PLAYER_SIZE);
        // Inner highlight
        gfx.fillStyle(0xffffff, 0.4);
        gfx.fillCircle(x - 4, y - 4, 5);
    }

    /** Floating dot particles */
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

    /** Transition: zoom into player, then start GameScene */
    _startGame() {
        // Disable button
        this.startBtn.disableInteractive();
        this.startBtn.setAlpha(0.5);

        const cx = GAME_CONFIG.MAP_WIDTH / 2;
        const cy = GAME_CONFIG.MAP_HEIGHT / 2;

        // Smooth zoom in
        this.cameras.main.pan(cx, cy, 1500, 'Sine.easeInOut');
        this.cameras.main.zoomTo(GAME_CONFIG.ZOOM_GAME_START, 1500, 'Sine.easeInOut');

        // Fade out UI
        this.tweens.add({
            targets: [this.titleText, this.subtitleText, this.startBtn, this.musicBtn],
            alpha: 0,
            duration: 800,
        });

        // Transition after zoom
        this.time.delayedCall(1600, () => {
            this.scene.start('GameScene');
        });
    }
}
