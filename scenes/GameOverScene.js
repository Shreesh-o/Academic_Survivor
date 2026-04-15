/* ========================================
   GAME OVER SCENE — Displayed when the
   player dies. Shows score and retry button.
   ======================================== */

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalPercent = data.percent || '0.0';
        this.finalLevel = data.level || 1;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.setBackgroundColor(0x0a0a0f);

        // ---- Play lose music ----
        let loseMusic = this.sound.add("loseMusic", { volume: 0.8 });
        loseMusic.play();

        // ---- Scanline overlay ----
        const scanlines = this.add.graphics();
        scanlines.setDepth(0);
        scanlines.fillStyle(0x000000, 0.03);
        for (let y = 0; y < h; y += 4) {
            scanlines.fillRect(0, y, w, 2);
        }

        // ---- Red vignette border ----
        const border = this.add.graphics();
        border.setDepth(1);
        border.lineStyle(3, 0xff0000, 0.6);
        border.strokeRect(10, 10, w - 20, h - 20);
        border.lineStyle(1, 0x330000, 0.4);
        border.strokeRect(20, 20, w - 40, h - 40);

        // ---- Skull icon ----
        this.add.text(w / 2, h * 0.18, '💀', {
            fontSize: '64px',
        }).setOrigin(0.5).setDepth(10);

        // ---- DETAINED text ----
        const detainedText = this.add.text(w / 2, h * 0.32, 'DETAINED', {
            fontFamily: '"Press Start 2P"',
            fontSize: '36px',
            color: '#ff0000',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#550000',
                blur: 0,
                fill: true,
            },
        }).setOrigin(0.5).setDepth(10);

        // Flicker effect on DETAINED
        this.tweens.add({
            targets: detainedText,
            alpha: { from: 1, to: 0.5 },
            duration: 200,
            yoyo: true,
            repeat: 3,
        });

        // ---- Death message ----
        const messages = [
            'Better luck next sem 💀',
            'Attendance insufficient. Semester failed.',
            'Your trail was broken. So was your GPA.',
            'The HOD sends his regards.',
            'Academic probation initiated.',
        ];
        const msg = messages[Phaser.Math.Between(0, messages.length - 1)];

        this.add.text(w / 2, h * 0.43, msg, {
            fontFamily: '"VT323"',
            fontSize: '22px',
            color: '#cc4444',
            align: 'center',
            wordWrap: { width: w * 0.7 },
        }).setOrigin(0.5).setDepth(10);

        // ---- Stats panel ----
        const panelY = h * 0.53;
        const panelBg = this.add.graphics();
        panelBg.setDepth(5);
        panelBg.fillStyle(0x111111, 0.9);
        panelBg.fillRoundedRect(w / 2 - 140, panelY, 280, 90, 4);
        panelBg.lineStyle(1, 0x330000, 0.8);
        panelBg.strokeRoundedRect(w / 2 - 140, panelY, 280, 90, 4);

        // Area captured
        this.add.text(w / 2 - 120, panelY + 16, 'AREA CAPTURED', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#666666',
        }).setDepth(10);

        this.add.text(w / 2 + 120, panelY + 16, this.finalPercent + '%', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ff4444',
        }).setOrigin(1, 0).setDepth(10);

        // Level reached
        this.add.text(w / 2 - 120, panelY + 44, 'LEVEL REACHED', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#666666',
        }).setDepth(10);

        const enemyType = ENEMY_TYPES.find(t => t.level === this.finalLevel);
        const levelLabel = enemyType ? enemyType.label : 'LV ' + this.finalLevel;

        this.add.text(w / 2 + 120, panelY + 44, 'LV' + this.finalLevel + ' — ' + levelLabel, {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            color: '#ffcc00',
        }).setOrigin(1, 0).setDepth(10);

        // Grade
        const grade = this._getGrade(parseFloat(this.finalPercent));
        this.add.text(w / 2 - 120, panelY + 68, 'GRADE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#666666',
        }).setDepth(10);

        this.add.text(w / 2 + 120, panelY + 68, grade.letter, {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: grade.color,
        }).setOrigin(1, 0).setDepth(10);

        // ---- Retry button ----
        const retryBtn = this.add.text(w / 2, h * 0.78, '🔁  REPEAT SEMESTER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#0a0a0f',
            backgroundColor: '#ff4444',
            padding: { x: 20, y: 12 },
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerover', () => {
            retryBtn.setStyle({ backgroundColor: '#ff6666' });
            retryBtn.setScale(1.05);
        });
        retryBtn.on('pointerout', () => {
            retryBtn.setStyle({ backgroundColor: '#ff4444' });
            retryBtn.setScale(1.0);
        });
        retryBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Pulse
        this.tweens.add({
            targets: retryBtn,
            alpha: { from: 1, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Back to menu ----
        this.add.text(w / 2, h * 0.88, '← BACK TO MENU', {
            fontFamily: '"VT323"',
            fontSize: '18px',
            color: '#555555',
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true })
          .on('pointerover', function () { this.setColor('#aaaaaa'); })
          .on('pointerout', function () { this.setColor('#555555'); })
          .on('pointerdown', () => {
              this.scene.start('MenuScene');
          });

        // ---- Footer ----
        this.add.text(w / 2, h - 20, 'One does not simply survive the semester.', {
            fontFamily: '"VT323"',
            fontSize: '14px',
            color: '#222222',
        }).setOrigin(0.5).setDepth(10);
    }

    /** Get letter grade from capture percentage */
    _getGrade(pct) {
        if (pct >= 90) return { letter: 'S', color: '#ffcc00' };
        if (pct >= 75) return { letter: 'A', color: '#44ff88' };
        if (pct >= 60) return { letter: 'B', color: '#00d4ff' };
        if (pct >= 45) return { letter: 'C', color: '#ff8c00' };
        if (pct >= 30) return { letter: 'D', color: '#ff4444' };
        return { letter: 'F', color: '#666666' };
    }
}
