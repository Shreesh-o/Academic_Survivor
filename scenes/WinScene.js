/* ========================================
   WIN SCENE — Displayed when player captures
   75%+ of the map. Celebration screen.
   ======================================== */

class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    init(data) {
        this.finalPercent = data.percent || '75.0';
        this.finalLevel = data.level || 1;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.setBackgroundColor(0x0a0a0f);

        // ---- Gold border ----
        const border = this.add.graphics();
        border.setDepth(1);
        border.lineStyle(3, 0xffcc00, 0.8);
        border.strokeRect(10, 10, w - 20, h - 20);
        border.lineStyle(1, 0x554400, 0.4);
        border.strokeRect(20, 20, w - 40, h - 40);

        // ---- Trophy icon ----
        this.add.text(w / 2, h * 0.14, '🎓', {
            fontSize: '72px',
        }).setOrigin(0.5).setDepth(10);

        // ---- SEMESTER SURVIVED ----
        const titleText = this.add.text(w / 2, h * 0.28, 'SEMESTER\nSURVIVED', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            color: '#ffcc00',
            align: 'center',
            lineSpacing: 8,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#665500',
                blur: 0,
                fill: true,
            },
        }).setOrigin(0.5).setDepth(10);

        // Glow pulse on title
        this.tweens.add({
            targets: titleText,
            alpha: { from: 1, to: 0.8 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Victory message ----
        this.add.text(w / 2, h * 0.44, 'Congrats on surviving the semester,\nHOD will be waiting for u next sem', {
            fontFamily: '"VT323"',
            fontSize: '22px',
            color: '#ccaa44',
            align: 'center',
            lineSpacing: 6,
        }).setOrigin(0.5).setDepth(10);

        // ---- Stats panel ----
        const panelY = h * 0.55;
        const panelBg = this.add.graphics();
        panelBg.setDepth(5);
        panelBg.fillStyle(0x111100, 0.8);
        panelBg.fillRoundedRect(w / 2 - 150, panelY, 300, 100, 4);
        panelBg.lineStyle(1, 0x554400, 0.8);
        panelBg.strokeRoundedRect(w / 2 - 150, panelY, 300, 100, 4);

        // Area captured
        this.add.text(w / 2 - 130, panelY + 16, 'AREA CAPTURED', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#888866',
        }).setDepth(10);

        this.add.text(w / 2 + 130, panelY + 16, this.finalPercent + '%', {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#44ff88',
        }).setOrigin(1, 0).setDepth(10);

        // Level reached
        this.add.text(w / 2 - 130, panelY + 44, 'FINAL LEVEL', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#888866',
        }).setDepth(10);

        this.add.text(w / 2 + 130, panelY + 44, 'LEVEL ' + this.finalLevel, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffcc00',
        }).setOrigin(1, 0).setDepth(10);

        // Grade
        const grade = this._getGrade(parseFloat(this.finalPercent));
        this.add.text(w / 2 - 130, panelY + 72, 'FINAL GRADE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#888866',
        }).setDepth(10);

        const gradeText = this.add.text(w / 2 + 130, panelY + 68, grade.letter, {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: grade.color,
        }).setOrigin(1, 0).setDepth(10);

        // Grade glow
        this.tweens.add({
            targets: gradeText,
            alpha: { from: 1, to: 0.6 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // ---- Celebration particles ----
        this._createCelebration(w, h);

        // ---- Play again button ----
        const playBtn = this.add.text(w / 2, h * 0.8, '🎮  NEXT SEMESTER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#0a0a0f',
            backgroundColor: '#ffcc00',
            padding: { x: 20, y: 12 },
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });

        playBtn.on('pointerover', () => {
            playBtn.setStyle({ backgroundColor: '#ffdd44' });
            playBtn.setScale(1.05);
        });
        playBtn.on('pointerout', () => {
            playBtn.setStyle({ backgroundColor: '#ffcc00' });
            playBtn.setScale(1.0);
        });
        playBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        this.tweens.add({
            targets: playBtn,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ---- Back to menu ----
        this.add.text(w / 2, h * 0.9, '← BACK TO MENU', {
            fontFamily: '"VT323"',
            fontSize: '18px',
            color: '#777755',
        }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true })
          .on('pointerover', function () { this.setColor('#cccc88'); })
          .on('pointerout', function () { this.setColor('#777755'); })
          .on('pointerdown', () => {
              this.scene.start('MenuScene');
          });

        // ---- Footer ----
        this.add.text(w / 2, h - 20, 'Built under pressure, powered by caffeine and the fear of detention.', {
            fontFamily: '"VT323"',
            fontSize: '14px',
            color: '#222211',
        }).setOrigin(0.5).setDepth(10);
    }

    /** Floating gold particles */
    _createCelebration(w, h) {
        const colors = [0xffcc00, 0xffdd44, 0xff8c00, 0x44ff88, 0x00d4ff];

        for (let i = 0; i < 30; i++) {
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            const particle = this.add.circle(
                Phaser.Math.Between(30, w - 30),
                Phaser.Math.Between(30, h - 30),
                Phaser.Math.Between(2, 5),
                color,
                Phaser.Math.FloatBetween(0.2, 0.6)
            ).setDepth(3);

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(40, 120),
                x: particle.x + Phaser.Math.Between(-60, 60),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 5000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000),
            });
        }
    }

    _getGrade(pct) {
        if (pct >= 90) return { letter: 'S', color: '#ffcc00' };
        if (pct >= 75) return { letter: 'A', color: '#44ff88' };
        if (pct >= 60) return { letter: 'B', color: '#00d4ff' };
        if (pct >= 45) return { letter: 'C', color: '#ff8c00' };
        if (pct >= 30) return { letter: 'D', color: '#ff4444' };
        return { letter: 'F', color: '#666666' };
    }
}
