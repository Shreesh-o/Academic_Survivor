/* ========================================
   GAME SCENE — Core gameplay with:
   - Sprite-based player
   - Background image
   - Global music (persists across scenes)
   ======================================== */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const mapW = GAME_CONFIG.MAP_WIDTH;
        const mapH = GAME_CONFIG.MAP_HEIGHT;

        // ---- State ----
        this.currentLevel = 1;
        this.isDrawingTrail = false;
        this.trailPoints = [];
        this.gameActive = true;
        this.lastCapturePercent = 0;
        this.levelUpThreshold = GAME_CONFIG.LEVEL_UP_PERCENT;
        this.maxLevel = ENEMY_TYPES.length;

        // ---- World bounds ----
        this.physics.world.setBounds(0, 0, mapW, mapH);

        // ---- Background image ----
        this.bg = this.add.image(mapW / 2, mapH / 2, 'bg');
        this.bg.setDisplaySize(mapW, mapH);
        this.bg.setDepth(-1);

        // ---- Map border ----
        const border = this.add.graphics();
        border.setDepth(0);
        border.lineStyle(4, GAME_CONFIG.BORDER_COLOR, 0.8);
        border.strokeRect(2, 2, mapW - 4, mapH - 4);

        // ---- Grid lines ----
        this._drawGrid(mapW, mapH);

        // ---- Grid manager for area capture ----
        this.gridManager = new GridManager(this);

        // ---- Trail graphics ----
        this.trailGraphics = this.add.graphics();
        this.trailGraphics.setDepth(5);

        // ---- Player sprite ----
        this._createPlayer(mapW / 2, mapH / 2);

        // ---- Enemy manager ----
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.spawnForLevel(1);

        // ---- Main camera ----
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(GAME_CONFIG.ZOOM_GAME_START);
        this.cameras.main.setBackgroundColor(0x050510);

        // ---- Input ----
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // ---- HUD setup ----
        this._createHUD();

        // ---- Initial state ----
        this.lastCapturePercent = this.gridManager.getCapturePercent();
        this._updateHUD();
        this.trailSampleTimer = 0;

        // ---- Ensure Music Plays ----
        let music = this.sound.get('bgMusic');
        let isMuted = this.registry.get('musicMuted');
        if (music && !music.isPlaying && !isMuted) {
            music.play();
            if (this.gameMusicBtn) { // Visual toggle state match
                this.gameMusicBtn.setText('🔊');
                this.gameMusicBtn.setStyle({ color: '#44ff88' });
            }
        }

        // ---- Shutdown handler ----
        this.events.on('shutdown', this._onShutdown, this);
    }

    /** Create player as a physics sprite */
    _createPlayer(x, y) {
        this.player = this.physics.add.sprite(x, y, 'player');
        this.player.setScale(0.15); // Scale down the massive hero sprite
        this.player.setDepth(10);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(
            GAME_CONFIG.PLAYER_SIZE * 2 / 0.08,
            GAME_CONFIG.PLAYER_SIZE * 2 / 0.08
        );
        this.player.body.setOffset(
            (this.player.width - (GAME_CONFIG.PLAYER_SIZE * 2 / 0.08)) / 2,
            (this.player.height - (GAME_CONFIG.PLAYER_SIZE * 2 / 0.08)) / 2
        );
    }

    _createHUD() {
        // Dark semi-transparent background box
        this.hudBg = this.add.graphics();
        this.hudBg.setScrollFactor(0).setDepth(200);
        this.hudBg.fillStyle(0x0a0a0f, 0.9);
        this.hudBg.fillRoundedRect(10, 10, 320, 95, 8);

        // Dot 1 (Area)
        this.add.circle(28, 30, 6, 0x44ff88).setScrollFactor(0).setDepth(201);
        
        // AREA Text
        this.areaText = this.add.text(45, 23, "AREA: 1.0%", {
            fontSize: "14px",
            fontFamily: '"Press Start 2P"',
            color: "#44ff88"
        }).setScrollFactor(0).setDepth(201);

        // LEVEL Text
        this.levelText = this.add.text(22, 50, "LEVEL 1: ASSIGNMENTS", {
            fontSize: "12px",
            fontFamily: '"Press Start 2P"',
            color: "#ffcc00"
        }).setScrollFactor(0).setDepth(201);

        // Dot 2 (Safe Zone)
        this.safeZoneDot = this.add.circle(28, 83, 6, 0x44ff88).setScrollFactor(0).setDepth(201);

        // SAFE ZONE Text
        this.safeZoneText = this.add.text(45, 76, "SAFE ZONE", {
            fontSize: "14px",
            fontFamily: '"Press Start 2P"',
            color: "#44ff88"
        }).setScrollFactor(0).setDepth(201);

        const screenW = this.cameras.main.width;
        const screenH = this.cameras.main.height;

        this.levelUpText = this.add.text(
            screenW / 2,
            screenH / 2 - 40,
            '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#ffcc00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 5,
        }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(202).setAlpha(0);

        // ---- Music Toggle ----
        let music = this.sound.get('bgMusic');
        this.gameMusicBtn = this.add.text(screenW - 30, 30, (music && music.isPlaying) ? '🔊' : '🔇', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: (music && music.isPlaying) ? '#44ff88' : '#ff4444',
            backgroundColor: '#111111',
            padding: { x: 14, y: 10 },
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });

        this.gameMusicBtn.on('pointerdown', () => {
            let m = this.sound.get('bgMusic');
            if (m) {
                if (m.isPlaying) {
                    m.pause();
                    this.registry.set('musicMuted', true);
                    this.gameMusicBtn.setText('🔇');
                    this.gameMusicBtn.setStyle({ color: '#ff4444' });
                } else {
                    this.registry.set('musicMuted', false);
                    if (m.isPaused) {
                        m.resume();
                    } else {
                        m.play();
                    }
                    this.gameMusicBtn.setText('🔊');
                    this.gameMusicBtn.setStyle({ color: '#44ff88' });
                }
            }
        });
    }



    /** Update HUD text using the specific template provided */
    _updateHUD() {
        const areaCaptured = this.gridManager.getCapturePercent();
        this.areaText.setText(`AREA: ${areaCaptured.toFixed(1)}%`);

        const enemyType = ENEMY_TYPES.find(t => t.level === this.currentLevel);
        const label = enemyType ? enemyType.label : 'UNKNOWN';
        this.levelText.setText(`LEVEL ${this.currentLevel}: ${label}`);

        // Dynamic Safe zone checking purely for visual immersion (matches screenshot style)
        const px = this.player.x;
        const py = this.player.y;
        const inCaptured = this.gridManager.isCaptured(px, py);

        if (inCaptured && !this.isDrawingTrail) {
            this.safeZoneText.setText("SAFE ZONE");
            this.safeZoneText.setColor("#44ff88");
            this.safeZoneDot.setFillStyle(0x44ff88);
        } else {
            this.safeZoneText.setText("DANGER ZONE");
            this.safeZoneText.setColor("#ff4444");
            this.safeZoneDot.setFillStyle(0xff4444);
        }
    }

    /** Grid lines */
    _drawGrid(w, h) {
        const gridGfx = this.add.graphics();
        gridGfx.setDepth(0);
        gridGfx.lineStyle(1, 0x111122, 0.2);
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

    // =========================================================================
    // UPDATE LOOP
    // =========================================================================

    update(time, delta) {
        if (!this.gameActive) return;

        this._handleMovement();
        this._handleTrail(delta);
        this._renderTrail();
        this.enemyManager.update(this.player.x, this.player.y);
        this._checkCollisions();
        this._updateHUD();
    }
    /** WASD / Arrow movement */
    _handleMovement() {
        const speed = GAME_CONFIG.PLAYER_SPEED;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

        this.player.setVelocity(vx, vy);

        // Flip player sprite based on direction
        if (vx < 0) this.player.setFlipX(true);
        else if (vx > 0) this.player.setFlipX(false);
    }

    /** Trail drawing and area capture */
    _handleTrail(delta) {
        const px = this.player.x;
        const py = this.player.y;
        const inCaptured = this.gridManager.isCaptured(px, py);
        const isMoving = (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0);

        if (this.isDrawingTrail) {
            this.trailSampleTimer += delta;
            if (this.trailSampleTimer > 50 && isMoving) {
                this.trailSampleTimer = 0;
                const lastPt = this.trailPoints[this.trailPoints.length - 1];
                const dist = lastPt ? Phaser.Math.Distance.Between(px, py, lastPt.x, lastPt.y) : Infinity;
                if (dist > 8) {
                    this.trailPoints.push({ x: px, y: py });
                }
            }
            if (inCaptured && this.trailPoints.length > 6) {
                this._captureArea();
            }
        } else {
            if (!inCaptured && isMoving) {
                this.isDrawingTrail = true;
                this.trailPoints = [{ x: px, y: py }];
                this.trailSampleTimer = 0;
            }
        }
    }

    /** Render trail line */
    _renderTrail() {
        this.trailGraphics.clear();
        if (this.trailPoints.length < 2) return;

        // Glow
        this.trailGraphics.lineStyle(GAME_CONFIG.TRAIL_WIDTH + 4, GAME_CONFIG.TRAIL_COLOR, 0.15);
        this.trailGraphics.beginPath();
        this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        for (let i = 1; i < this.trailPoints.length; i++) {
            this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
        this.trailGraphics.strokePath();

        // Core
        this.trailGraphics.lineStyle(GAME_CONFIG.TRAIL_WIDTH, GAME_CONFIG.TRAIL_COLOR, 0.8);
        this.trailGraphics.beginPath();
        this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        for (let i = 1; i < this.trailPoints.length; i++) {
            this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
        this.trailGraphics.strokePath();

        // Dots
        this.trailGraphics.fillStyle(GAME_CONFIG.TRAIL_COLOR, 1);
        for (let i = 0; i < this.trailPoints.length; i += 3) {
            this.trailGraphics.fillCircle(this.trailPoints[i].x, this.trailPoints[i].y, 2);
        }
    }

    /** Capture area */
    _captureArea() {
        const gained = this.gridManager.captureFromTrail(this.trailPoints);
        this.isDrawingTrail = false;
        this.trailPoints = [];
        this.trailGraphics.clear();

        if (gained > 0) {
            this.cameras.main.flash(200, 0, 255, 100, false);
        }

        const currentPercent = this.gridManager.getCapturePercent();

        if (currentPercent >= GAME_CONFIG.WIN_PERCENT) {
            this._winGame(currentPercent);
            return;
        }

        const percentGained = currentPercent - this.lastCapturePercent;
        if (percentGained >= this.levelUpThreshold && this.currentLevel < this.maxLevel) {
            this._levelUp();
            this.lastCapturePercent = currentPercent;
        }
    }

    /** Level up */
    _levelUp() {
        this.currentLevel++;
        this.enemyManager.spawnForLevel(this.currentLevel);

        const newZoom = GAME_CONFIG.ZOOM_GAME_START - (this.currentLevel - 1) * GAME_CONFIG.ZOOM_LEVEL_STEP;
        this.cameras.main.zoomTo(Math.max(newZoom, 0.4), 1000, 'Sine.easeInOut');

        const enemyType = ENEMY_TYPES.find(t => t.level === this.currentLevel);
        const label = enemyType ? enemyType.label : '???';
        this.levelUpText.setText('⚠ LEVEL ' + this.currentLevel + ' ⚠\n' + label + ' INCOMING!');
        this.levelUpText.setAlpha(1);
        this.cameras.main.shake(400, 0.008);

        this.tweens.add({
            targets: this.levelUpText,
            alpha: 0,
            duration: 800,
            delay: 2000,
        });
    }

    /** Collision checks */
    _checkCollisions() {
        const px = this.player.x;
        const py = this.player.y;
        const inCaptured = this.gridManager.isCaptured(px, py);

        if (!inCaptured || this.isDrawingTrail) {
            if (this.enemyManager.checkPlayerCollision(px, py, GAME_CONFIG.PLAYER_SIZE)) {
                this._gameOver();
                return;
            }
        }

        if (this.isDrawingTrail && this.enemyManager.checkTrailCollision(this.trailPoints)) {
            this._gameOver();
            return;
        }
    }

    _gameOver() {
        this.gameActive = false;
        this.player.setVelocity(0, 0);

        // Stop music when losing
        let music = this.sound.get('bgMusic');
        if (music) {
            music.stop();
        }

        this.cameras.main.flash(500, 255, 0, 0, false);
        this.cameras.main.shake(500, 0.02);

        const finalPercent = this.gridManager.getCapturePercent();
        this.time.delayedCall(800, () => {
            this.scene.start('GameOverScene', {
                percent: finalPercent.toFixed(1),
                level: this.currentLevel,
            });
        });
    }

    _winGame(percent) {
        this.gameActive = false;
        this.player.setVelocity(0, 0);

        let music = this.sound.get('bgMusic');
        if (music) {
            music.stop();
        }

        this.cameras.main.flash(800, 255, 200, 0, false);
        this.time.delayedCall(1000, () => {
            this.scene.start('WinScene', {
                percent: percent.toFixed(1),
                level: this.currentLevel,
            });
        });
    }

    _onShutdown() {

        if (this.gridManager) {
            this.gridManager.destroy();
            this.gridManager = null;
        }
        if (this.enemyManager) {
            this.enemyManager.destroy();
            this.enemyManager = null;
        }
        this.events.off('shutdown', this._onShutdown, this);
    }
}
