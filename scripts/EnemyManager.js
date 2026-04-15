/* ========================================
   ENEMY MANAGER — Spawns and manages enemies
   Enemies bounce around the map, collide with
   player/trail for game over.
   ======================================== */

class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];      // Array of enemy game objects
        this.enemyData = [];    // Parallel array of metadata
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

        // Spawn at random position away from center
        let x, y;
        do {
            x = Phaser.Math.Between(margin, mapW - margin);
            y = Phaser.Math.Between(margin, mapH - margin);
        } while (
            Math.abs(x - mapW / 2) < 200 &&
            Math.abs(y - mapH / 2) < 200
        );

        // Create enemy as a graphics-drawn circle added to physics
        const gfx = this.scene.add.graphics();
        gfx.setDepth(8);

        // Draw the enemy shape
        this._drawEnemy(gfx, typeDef);

        // Add physics body via a zone
        const zone = this.scene.add.zone(x, y, typeDef.size * 2, typeDef.size * 2);
        this.scene.physics.add.existing(zone);
        zone.body.setCircle(typeDef.size);
        zone.body.setOffset(0, 0);

        // Random velocity direction
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        zone.body.setVelocity(
            Math.cos(angle) * typeDef.speed,
            Math.sin(angle) * typeDef.speed
        );

        // Bounce off world bounds
        zone.body.setBounce(1, 1);
        zone.body.setCollideWorldBounds(true);

        const enemyObj = {
            gfx,
            zone,
            typeDef,
            size: typeDef.size,
        };

        this.enemies.push(enemyObj);
        this.enemyData.push(typeDef);
    }

    /** Draw the enemy visual */
    _drawEnemy(gfx, typeDef) {
        // Outer glow
        gfx.fillStyle(typeDef.color, 0.2);
        gfx.fillCircle(0, 0, typeDef.size + 4);
        // Core
        gfx.fillStyle(typeDef.color, 0.85);
        gfx.fillCircle(0, 0, typeDef.size);
        // Inner highlight
        gfx.fillStyle(0xffffff, 0.3);
        gfx.fillCircle(-typeDef.size * 0.25, -typeDef.size * 0.25, typeDef.size * 0.35);
    }

    /** Update enemy graphics positions to follow physics zones */
    update() {
        for (const enemy of this.enemies) {
            enemy.gfx.x = enemy.zone.x;
            enemy.gfx.y = enemy.zone.y;
        }
    }

    /**
     * Check collision between enemies and a point (player position).
     * Returns true if any enemy is within collision range.
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
     * Check collision between enemies and trail points.
     * Returns true if any enemy touches any trail segment.
     */
    checkTrailCollision(trailPoints) {
        if (trailPoints.length < 2) return false;

        for (const enemy of this.enemies) {
            const ex = enemy.zone.x;
            const ey = enemy.zone.y;
            const er = enemy.size + 2; // small buffer

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
