/* ========================================
   ENEMY MANAGER — Sprite-based enemies
   Replaces graphics circles with real sprites.
   Supports bounce and chase behaviors.
   ======================================== */

class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
    }

    /** Spawn enemies for a given level */
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
        const margin = 120;

        // Spawn away from player (center)
        let x, y;
        do {
            x = Phaser.Math.Between(margin, mapW - margin);
            y = Phaser.Math.Between(margin, mapH - margin);
        } while (
            Math.abs(x - mapW / 2) < 250 &&
            Math.abs(y - mapH / 2) < 250
        );

        // Create sprite with physics
        const sprite = this.scene.physics.add.sprite(x, y, typeDef.spriteKey);
        sprite.setScale(typeDef.spriteScale || 0.08);
        sprite.setDepth(8);

        // Set circular physics body based on the size config
        sprite.body.setCircle(
            sprite.displayWidth / (2 * (typeDef.spriteScale || 0.08)) * (typeDef.spriteScale || 0.08),
        );
        // Override with our defined collision size
        sprite.body.setSize(typeDef.size * 2, typeDef.size * 2);
        sprite.body.setOffset(
            (sprite.width - typeDef.size * 2 / (typeDef.spriteScale || 0.08)) / 2,
            (sprite.height - typeDef.size * 2 / (typeDef.spriteScale || 0.08)) / 2
        );

        sprite.setCollideWorldBounds(true);

        if (typeDef.behavior === 'bounce') {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            sprite.setVelocity(
                Math.cos(angle) * typeDef.speed,
                Math.sin(angle) * typeDef.speed
            );
            sprite.setBounce(1, 1);
        } else {
            // Chase enemies start with slight random velocity
            sprite.setVelocity(
                Phaser.Math.Between(-30, 30),
                Phaser.Math.Between(-30, 30)
            );
            sprite.setBounce(0.5, 0.5);
        }

        const enemyObj = {
            sprite,
            typeDef,
            size: typeDef.size,
            behavior: typeDef.behavior || 'bounce',
        };

        this.enemies.push(enemyObj);
    }

    /** Update positions and apply chase AI */
    update(playerX, playerY) {
        for (const enemy of this.enemies) {
            // Chase behavior: steer toward the player
            if (enemy.behavior === 'chase' && playerX !== undefined) {
                const dx = playerX - enemy.sprite.x;
                const dy = playerY - enemy.sprite.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0) {
                    const speed = enemy.typeDef.speed;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    const currentVx = enemy.sprite.body.velocity.x;
                    const currentVy = enemy.sprite.body.velocity.y;
                    const targetVx = nx * speed;
                    const targetVy = ny * speed;

                    // Steering factor — HOD most aggressive
                    let steerFactor = 0.02;
                    if (enemy.typeDef.name === 'ESE') steerFactor = 0.03;
                    if (enemy.typeDef.name === 'HOD') steerFactor = 0.045;

                    enemy.sprite.setVelocity(
                        currentVx + (targetVx - currentVx) * steerFactor,
                        currentVy + (targetVy - currentVy) * steerFactor
                    );
                }
            }

            // Flip sprite to face movement direction
            if (enemy.sprite.body.velocity.x < 0) {
                enemy.sprite.setFlipX(true);
            } else if (enemy.sprite.body.velocity.x > 0) {
                enemy.sprite.setFlipX(false);
            }
        }
    }

    /** Check collision between enemies and player */
    checkPlayerCollision(playerX, playerY, playerRadius) {
        for (const enemy of this.enemies) {
            const dist = Phaser.Math.Distance.Between(
                playerX, playerY, enemy.sprite.x, enemy.sprite.y
            );
            if (dist < playerRadius + enemy.size) {
                return true;
            }
        }
        return false;
    }

    /** Check collision between enemies and trail */
    checkTrailCollision(trailPoints) {
        if (trailPoints.length < 2) return false;

        for (const enemy of this.enemies) {
            const ex = enemy.sprite.x;
            const ey = enemy.sprite.y;
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

    _pointToSegmentDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Phaser.Math.Distance.Between(px, py, x1, y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Phaser.Math.Clamp(t, 0, 1);
        return Phaser.Math.Distance.Between(px, py, x1 + t * dx, y1 + t * dy);
    }

    /** Clean up all enemies */
    destroy() {
        for (const enemy of this.enemies) {
            enemy.sprite.destroy();
        }
        this.enemies = [];
    }
}
