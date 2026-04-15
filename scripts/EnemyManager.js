/* ========================================
   ENEMY MANAGER — Spawns and manages enemies
   Supports two behaviors:
   - 'bounce': random bouncing off walls
   - 'chase': actively follows the player
   ======================================== */

class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.enemyData = [];
    }

    /**
     * Spawn enemies for a given level.
     * Keeps all previous enemies alive.
     */
    spawnForLevel(level) {
        const typeDef = ENEMY_TYPES.find(t => t.level === level);
        if (!typeDef) return;

        for (let i = 0; i < typeDef.count; i++) {
            this._spawnEnemy(typeDef);
        }
    }

    _spawnEnemy(typeDef) {
        const mapW = GAME_CONFIG.MAP_WIDTH;
        const mapH = GAME_CONFIG.MAP_HEIGHT;
        const margin = 100;

        // Spawn away from player (center)
        let x, y;
        do {
            x = Phaser.Math.Between(margin, mapW - margin);
            y = Phaser.Math.Between(margin, mapH - margin);
        } while (
            Math.abs(x - mapW / 2) < 250 &&
            Math.abs(y - mapH / 2) < 250
        );

        // Graphics for enemy visual
        const gfx = this.scene.add.graphics();
        gfx.setDepth(8);
        this._drawEnemy(gfx, typeDef);

        // Physics zone
        const zone = this.scene.add.zone(x, y, typeDef.size * 2, typeDef.size * 2);
        this.scene.physics.add.existing(zone);
        zone.body.setCircle(typeDef.size);
        zone.body.setOffset(0, 0);

        if (typeDef.behavior === 'bounce') {
            // Random bounce behavior
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            zone.body.setVelocity(
                Math.cos(angle) * typeDef.speed,
                Math.sin(angle) * typeDef.speed
            );
            zone.body.setBounce(1, 1);
            zone.body.setCollideWorldBounds(true);
        } else {
            // Chase enemies don't bounce — they steer toward the player
            zone.body.setCollideWorldBounds(true);
            zone.body.setBounce(0.5, 0.5);
        }

        const enemyObj = {
            gfx,
            zone,
            typeDef,
            size: typeDef.size,
            behavior: typeDef.behavior || 'bounce',
        };

        this.enemies.push(enemyObj);
        this.enemyData.push(typeDef);
    }

    /** Draw the enemy visual */
    _drawEnemy(gfx, typeDef) {
        // Outer glow
        gfx.fillStyle(typeDef.color, 0.2);
        gfx.fillCircle(0, 0, typeDef.size + 6);
        // Core
        gfx.fillStyle(typeDef.color, 0.85);
        gfx.fillCircle(0, 0, typeDef.size);
        // Inner highlight
        gfx.fillStyle(0xffffff, 0.3);
        gfx.fillCircle(-typeDef.size * 0.25, -typeDef.size * 0.25, typeDef.size * 0.35);

        // Eye-like indicators for chase enemies (menacing look)
        if (typeDef.behavior === 'chase') {
            gfx.fillStyle(0xffffff, 0.9);
            gfx.fillCircle(-typeDef.size * 0.22, -typeDef.size * 0.15, typeDef.size * 0.18);
            gfx.fillCircle(typeDef.size * 0.22, -typeDef.size * 0.15, typeDef.size * 0.18);
            gfx.fillStyle(0x000000, 1);
            gfx.fillCircle(-typeDef.size * 0.22, -typeDef.size * 0.12, typeDef.size * 0.09);
            gfx.fillCircle(typeDef.size * 0.22, -typeDef.size * 0.12, typeDef.size * 0.09);
        }
    }

    /**
     * Update enemy graphics positions and apply chase AI.
     * Must be called with player position for chase enemies.
     */
    update(playerX, playerY) {
        for (const enemy of this.enemies) {
            // Update graphics position
            enemy.gfx.x = enemy.zone.x;
            enemy.gfx.y = enemy.zone.y;

            // Chase behavior: steer toward the player
            if (enemy.behavior === 'chase' && playerX !== undefined) {
                const dx = playerX - enemy.zone.x;
                const dy = playerY - enemy.zone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0) {
                    const speed = enemy.typeDef.speed;
                    // Normalized direction toward player
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Smoothly steer toward player (lerp current velocity toward target)
                    const currentVx = enemy.zone.body.velocity.x;
                    const currentVy = enemy.zone.body.velocity.y;
                    const targetVx = nx * speed;
                    const targetVy = ny * speed;

                    // Steering factor — how aggressively they turn
                    // HOD steers fastest (0.04), ESE (0.03), MSE (0.02)
                    let steerFactor = 0.02;
                    if (enemy.typeDef.name === 'ESE') steerFactor = 0.03;
                    if (enemy.typeDef.name === 'HOD') steerFactor = 0.04;

                    const newVx = currentVx + (targetVx - currentVx) * steerFactor;
                    const newVy = currentVy + (targetVy - currentVy) * steerFactor;

                    enemy.zone.body.setVelocity(newVx, newVy);
                }
            }
        }
    }

    /**
     * Check collision between enemies and player.
     */
    checkPlayerCollision(playerX, playerY, playerRadius) {
        for (const enemy of this.enemies) {
            const dist = Phaser.Math.Distance.Between(
                playerX, playerY, enemy.zone.x, enemy.zone.y
            );
            if (dist < playerRadius + enemy.size) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check collision between enemies and trail.
     */
    checkTrailCollision(trailPoints) {
        if (trailPoints.length < 2) return false;

        for (const enemy of this.enemies) {
            const ex = enemy.zone.x;
            const ey = enemy.zone.y;
            const er = enemy.size + 2;

            for (let i = 0; i < trailPoints.length - 1; i++) {
                const p1 = trailPoints[i];
                const p2 = trailPoints[i + 1];
                const dist = this._pointToSegmentDist(ex, ey, p1.x, p1.y, p2.x, p2.y);
                if (dist < er) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Distance from point to line segment */
    _pointToSegmentDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;

        if (lenSq === 0) {
            return Phaser.Math.Distance.Between(px, py, x1, y1);
        }

        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Phaser.Math.Clamp(t, 0, 1);

        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        return Phaser.Math.Distance.Between(px, py, projX, projY);
    }

    /** Clean up all enemies */
    destroy() {
        for (const enemy of this.enemies) {
            enemy.gfx.destroy();
            enemy.zone.destroy();
        }
        this.enemies = [];
        this.enemyData = [];
    }
}
