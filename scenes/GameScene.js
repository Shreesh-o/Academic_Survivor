/* ========================================
   GAME SCENE — Core gameplay:
   Player movement, trail drawing, area
   capture, enemy collisions, level progression.
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

        // ---- World bounds (physics) ----
        this.physics.world.setBounds(0, 0, mapW, mapH);

        // ---- Map background ----
        this._drawMapBackground(mapW, mapH);
        this._drawGrid(mapW, mapH);

        // ---- Grid manager for area capture ----
        this.gridManager = new GridManager(this);

        // ---- Trail graphics ----
        this.trailGraphics = this.add.graphics();
        this.trailGraphics.setDepth(5);

        // ---- Player ----
        this._createPlayer(mapW / 2, mapH / 2);

        // ---- Enemy manager ----
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.spawnForLevel(1);

        // ---- Camera ----
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

        // ---- HUD (scroll-factor 0 so it stays on screen) ----
        this._createHUD();

        // ---- Background Music ----
        this._setupMusic();

        // ---- Initial capture percent ----
        this.lastCapturePercent = this.gridManager.getCapturePercent();
        this._updateHUD();

        // ---- Level up announcement text (hidden) ----
        this.levelUpText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 40,
            '', {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#ffcc00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4,
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

        // ---- Trail point sampling timer ----
        this.trailSampleTimer = 0;

        // ---- Register shutdown handler to clean up properly ----
        this.events.on('shutdown', this._onShutdown, this);
    }

    /** Create player as physics-enabled graphics */
    _createPlayer(x, y) {
        // Use a small zone for physics
        this.player = this.add.zone(x, y, GAME_CONFIG.PLAYER_SIZE * 2, GAME_CONFIG.PLAYER_SIZE * 2);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setCircle(GAME_CONFIG.PLAYER_SIZE);
        this.player.body.setOffset(0, 0);

        // Player graphics
        this.playerGfx = this.add.graphics();
        this.playerGfx.setDepth(10);
    }

    /** Draw the player visual at current position */
    _drawPlayer() {
        this.playerGfx.clear();
        const x = this.player.x;
        const y = this.player.y;

        // Outer glow — changes when trail is active
        if (this.isDrawingTrail) {
            this.playerGfx.fillStyle(0xff4444, 0.2);
            this.playerGfx.fillCircle(x, y, 22);
        } else {
            this.playerGfx.fillStyle(0x00ff88, 0.15);
            this.playerGfx.fillCircle(x, y, 20);
        }

        // Body
        this.playerGfx.fillStyle(0x00ff88, 0.9);
        this.playerGfx.fillCircle(x, y, GAME_CONFIG.PLAYER_SIZE);

        // Inner highlight
        this.playerGfx.fillStyle(0xffffff, 0.4);
        this.playerGfx.fillCircle(x - 4, y - 4, 5);

        // Small directional indicator when trailing
        if (this.isDrawingTrail) {
            this.playerGfx.fillStyle(0xff4444, 0.6);
            this.playerGfx.fillCircle(x, y, 4);
        }
    }

    /** Create the HUD elements */
    _createHUD() {
        const pad = 16;

        // Area percentage
        this.hudAreaText = this.add.text(pad, pad, 'AREA: 0.0%', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#44ff88',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(200);

        // Level indicator
        this.hudLevelText = this.add.text(pad, pad + 24, 'LEVEL 1: ASSIGNMENTS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3,
        }).setScrollFactor(0).setDepth(200);

        // Status indicator (safe/danger)
        this.hudStatusText = this.add.text(pad, pad + 46, '● SAFE ZONE', {
            fontFamily: '"VT323"',
            fontSize: '18px',
            color: '#44ff88',
            stroke: '#000000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(200);

        // Music toggle in game
        const screenW = this.cameras.main.width;
        this.gameMusicBtn = this.add.text(screenW - 16, pad, '🔊', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#44ff88',
            backgroundColor: '#111111',
            padding: { x: 6, y: 6 },
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(200).setInteractive({ useHandCursor: true });

        this.gameMusicBtn.on('pointerdown', () => {
            const musicOn = this.registry.get('musicOn');
            this.registry.set('musicOn', !musicOn);
            if (this.bgMusic) {
                if (!musicOn) {
                    this.bgMusic.resume();
                    this.gameMusicBtn.setText('🔊');
                    this.gameMusicBtn.setStyle({ color: '#44ff88' });
                } else {
                    this.bgMusic.pause();
                    this.gameMusicBtn.setText('🔇');
                    this.gameMusicBtn.setStyle({ color: '#ff4444' });
                }
            }
        });
    }

    /** Setup background music */
    _setupMusic() {
        try {
            if (this.cache.audio.exists('bgmusic')) {
                this.bgMusic = this.sound.add('bgmusic', {
                    volume: 0.3,
                    loop: true,
                });
                const musicOn = this.registry.get('musicOn');
                if (musicOn) {
                    this.bgMusic.play();
                } else {
                    this.gameMusicBtn.setText('🔇');
                    this.gameMusicBtn.setStyle({ color: '#ff4444' });
                }
            }
        } catch (e) {
            console.warn('Music playback error:', e);
        }
    }

    /** Update HUD text */
    _updateHUD() {
        const pct = this.gridManager.getCapturePercent();
        this.hudAreaText.setText('AREA: ' + pct.toFixed(1) + '%');

        const enemyType = ENEMY_TYPES.find(t => t.level === this.currentLevel);
        const label = enemyType ? enemyType.label : '???';
        this.hudLevelText.setText('LEVEL ' + this.currentLevel + ': ' + label);

        if (this.isDrawingTrail) {
            this.hudStatusText.setText('● DANGER — TRAIL ACTIVE');
            this.hudStatusText.setColor('#ff4444');
        } else {
            this.hudStatusText.setText('● SAFE ZONE');
            this.hudStatusText.setColor('#44ff88');
        }
    }

    /** Draw map background */
    _drawMapBackground(w, h) {
        const bg = this.add.graphics();
        bg.setDepth(0);
        bg.fillStyle(0x0d0d18, 1);
        bg.fillRect(0, 0, w, h);
        bg.lineStyle(4, GAME_CONFIG.BORDER_COLOR, 0.8);
        bg.strokeRect(2, 2, w - 4, h - 4);
    }

    /** Grid lines */
    _drawGrid(w, h) {
        const gridGfx = this.add.graphics();
        gridGfx.setDepth(0);
        gridGfx.lineStyle(1, 0x111122, 0.15);
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

        // ---- Player movement ----
        this._handleMovement();

        // ---- Draw player graphic ----
        this._drawPlayer();

        // ---- Trail logic ----
        this._handleTrail(delta);

        // ---- Render trail ----
        this._renderTrail();

        // ---- Enemy update ----
        this.enemyManager.update();

        // ---- Collision checks ----
        this._checkCollisions();

        // ---- Update HUD ----
        this._updateHUD();
    }

    /** Handle WASD / Arrow key movement */
    _handleMovement() {
        const speed = GAME_CONFIG.PLAYER_SPEED;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

        if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

        // Normalize diagonal
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.player.body.setVelocity(vx, vy);
    }

    /** Handle trail drawing and area capture */
    _handleTrail(delta) {
        const px = this.player.x;
        const py = this.player.y;
        const inCaptured = this.gridManager.isCaptured(px, py);
        const isMoving = (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0);

        if (this.isDrawingTrail) {
            // Add points to trail as player moves
            this.trailSampleTimer += delta;
            if (this.trailSampleTimer > 50 && isMoving) {
                this.trailSampleTimer = 0;
                const lastPt = this.trailPoints[this.trailPoints.length - 1];
                const dist = lastPt
                    ? Phaser.Math.Distance.Between(px, py, lastPt.x, lastPt.y)
                    : Infinity;
                if (dist > 8) {
                    this.trailPoints.push({ x: px, y: py });
                }
            }

            // Check if player returned to captured territory → close loop
            if (inCaptured && this.trailPoints.length > 6) {
                this._captureArea();
            }
        } else {
            // Start trail when player leaves captured area while moving
            if (!inCaptured && isMoving) {
                this.isDrawingTrail = true;
                this.trailPoints = [{ x: px, y: py }];
                this.trailSampleTimer = 0;
            }
        }
    }

    /** Render the trail line */
    _renderTrail() {
        this.trailGraphics.clear();

        if (this.trailPoints.length < 2) return;

        // Trail glow
        this.trailGraphics.lineStyle(GAME_CONFIG.TRAIL_WIDTH + 4, GAME_CONFIG.TRAIL_COLOR, 0.15);
        this.trailGraphics.beginPath();
        this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        for (let i = 1; i < this.trailPoints.length; i++) {
            this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
        this.trailGraphics.strokePath();

        // Trail core
        this.trailGraphics.lineStyle(GAME_CONFIG.TRAIL_WIDTH, GAME_CONFIG.TRAIL_COLOR, 0.8);
        this.trailGraphics.beginPath();
        this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
        for (let i = 1; i < this.trailPoints.length; i++) {
            this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
        }
        this.trailGraphics.strokePath();

        // Dots at trail points for visual flair
        this.trailGraphics.fillStyle(GAME_CONFIG.TRAIL_COLOR, 1);
        for (let i = 0; i < this.trailPoints.length; i += 3) {
            this.trailGraphics.fillCircle(this.trailPoints[i].x, this.trailPoints[i].y, 2);
        }
    }

    /** Capture the enclosed area and check for level up / win */
    _captureArea() {
        const gained = this.gridManager.captureFromTrail(this.trailPoints);

        // Reset trail state
        this.isDrawingTrail = false;
        this.trailPoints = [];
        this.trailGraphics.clear();

        // Flash effect on capture
        if (gained > 0) {
            this.cameras.main.flash(200, 0, 255, 100, false);
        }

        const currentPercent = this.gridManager.getCapturePercent();

        // ---- Win check ----
        if (currentPercent >= GAME_CONFIG.WIN_PERCENT) {
            this._winGame(currentPercent);
            return;
        }

        // ---- Level up check ----
        const percentGainedSinceLastLevel = currentPercent - this.lastCapturePercent;
        if (percentGainedSinceLastLevel >= this.levelUpThreshold && this.currentLevel < 6) {
            this._levelUp();
            this.lastCapturePercent = currentPercent;
        }
    }

    /** Progress to next level */
    _levelUp() {
        this.currentLevel++;

        // Spawn new enemies
        this.enemyManager.spawnForLevel(this.currentLevel);

        // Zoom out slightly
        const newZoom = GAME_CONFIG.ZOOM_GAME_START - (this.currentLevel - 1) * GAME_CONFIG.ZOOM_LEVEL_STEP;
        const clampedZoom = Math.max(newZoom, 0.5);
        this.cameras.main.zoomTo(clampedZoom, 1000, 'Sine.easeInOut');

        // Show level up announcement
        const enemyType = ENEMY_TYPES.find(t => t.level === this.currentLevel);
        const label = enemyType ? enemyType.label : '???';
        this.levelUpText.setText('⚠ LEVEL ' + this.currentLevel + ' ⚠\n' + label + ' INCOMING!');
        this.levelUpText.setAlpha(1);

        // Camera shake
        this.cameras.main.shake(400, 0.008);

        // Fade out announcement
        this.tweens.add({
            targets: this.levelUpText,
            alpha: 0,
            duration: 800,
            delay: 2000,
        });
    }

    /** Check enemy collisions with player and trail */
    _checkCollisions() {
        const px = this.player.x;
        const py = this.player.y;
        const inCaptured = this.gridManager.isCaptured(px, py);

        // Enemy vs Player — only kill when player is outside safe zone or drawing trail
        if (!inCaptured || this.isDrawingTrail) {
            if (this.enemyManager.checkPlayerCollision(px, py, GAME_CONFIG.PLAYER_SIZE)) {
                this._gameOver();
                return;
            }
        }

        // Enemy vs Trail
        if (this.isDrawingTrail && this.enemyManager.checkTrailCollision(this.trailPoints)) {
            this._gameOver();
            return;
        }
    }

    /** Trigger game over */
    _gameOver() {
        this.gameActive = false;
        this.player.body.setVelocity(0, 0);

        // Stop music
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        // Camera red flash
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

    /** Trigger win */
    _winGame(percent) {
        this.gameActive = false;
        this.player.body.setVelocity(0, 0);

        // Stop music
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        // Gold flash
        this.cameras.main.flash(800, 255, 200, 0, false);

        this.time.delayedCall(1000, () => {
            this.scene.start('WinScene', {
                percent: percent.toFixed(1),
                level: this.currentLevel,
            });
        });
    }

    /** Cleanup on scene shutdown — called via events.on('shutdown') */
    _onShutdown() {
        if (this.bgMusic) {
            this.bgMusic.stop();
            this.bgMusic.destroy();
            this.bgMusic = null;
        }
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
