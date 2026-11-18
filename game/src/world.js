import { CONFIG } from './config.js';
import { RNG } from './random.js';

export class World {
    constructor(seed = 1337) {
        this.rng = new RNG(seed);
        this.state = 'start'; // start, play, upgrade, gameover, paused
        this.score = 0;
        this.bestScore = 0;
        this.wave = 1;
        this.kills = 0;
        this.combo = 0;
        this.comboTimer = 0;

        this.player = {
            x: CONFIG.WIDTH / 2,
            y: CONFIG.HEIGHT / 2,
            radius: CONFIG.PLAYER.radius,
            speed: CONFIG.PLAYER.speed,
            hp: CONFIG.PLAYER.maxHp,
            maxHp: CONFIG.PLAYER.maxHp,
            dashCooldown: 0,
            dashTimer: 0,
            fireTimer: 0,
            fireRate: CONFIG.PLAYER.fireRate,
            bulletSpeed: CONFIG.PLAYER.bulletSpeed,
            bulletDamage: CONFIG.PLAYER.bulletDamage,
            bulletRange: CONFIG.PLAYER.bulletRange,
            projectiles: 1,
            pierce: 0,
            dashCooldownRate: CONFIG.PLAYER.dashCooldown,
            magnetRange: 120
        };

        this.xp = 0;
        this.xpToLevel = 100;
        this.level = 1;

        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.shards = [];
        this.particles = [];
        this.floatingTexts = [];

        this.waveTimer = 5.0;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.bossActive = false;
        this.boss = null;

        this.availableUpgrades = [];
        this.screenShake = 0;
        this.hitFlash = 0;

        this.petals = [];
        for (let i = 0; i < 25; i++) {
            this.petals.push({
                x: this.rng.range(0, CONFIG.WIDTH),
                y: this.rng.range(0, CONFIG.HEIGHT),
                vx: this.rng.range(-15, 15),
                vy: this.rng.range(-15, 15),
                size: this.rng.range(2, 5),
                alpha: this.rng.range(0.2, 0.6)
            });
        }

        this.startWave(1);
    }

    startWave(w) {
        this.wave = w;
        this.waveTimer = 3.0;
        this.bossActive = (this.wave % 5 === 0);
        if (this.bossActive) {
            this.enemiesToSpawn = 0;
            const bossHp = 400 + this.wave * 120;
            this.boss = {
                type: 'titan',
                x: CONFIG.WIDTH / 2,
                y: -100,
                targetY: CONFIG.HEIGHT / 2,
                radius: 54,
                hp: bossHp,
                maxHp: bossHp,
                angle: 0,
                attackTimer: 0,
                spawnTimer: 0
            };
        } else {
            this.enemiesToSpawn = 5 + this.wave * 4;
            this.boss = null;
        }
    }

    update(dt, input, audio) {
        if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 20);
        if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt * 5);

        // Background petals
        for (let p of this.petals) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < 0) p.x = CONFIG.WIDTH;
            if (p.x > CONFIG.WIDTH) p.x = 0;
            if (p.y < 0) p.y = CONFIG.HEIGHT;
            if (p.y > CONFIG.HEIGHT) p.y = 0;
        }

        if (this.state === 'start' || this.state === 'gameover') {
            if (input.wasPressed('Enter') || input.mouse.pressed) {
                audio.play('pickup');
                this.reset();
                this.state = 'play';
            }
            return;
        }

        if (this.state === 'upgrade') {
            // Handled in main or input click
            return;
        }

        if (this.state === 'paused') {
            return;
        }

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Player Dash & Movement
        if (this.player.dashCooldown > 0) {
            this.player.dashCooldown -= dt;
        }
        if (this.player.dashTimer > 0) {
            this.player.dashTimer -= dt;
        }

        let dx = 0, dy = 0;
        if (input.isDown('KeyW') || input.isDown('ArrowUp')) dy -= 1;
        if (input.isDown('KeyS') || input.isDown('ArrowDown')) dy += 1;
        if (input.isDown('KeyA') || input.isDown('ArrowLeft')) dx -= 1;
        if (input.isDown('KeyD') || input.isDown('ArrowRight')) dx += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        if (input.wasPressed('ShiftLeft') || input.wasPressed('ShiftRight')) {
            if (this.player.dashCooldown <= 0 && (dx !== 0 || dy !== 0)) {
                this.player.dashTimer = CONFIG.PLAYER.dashDuration;
                this.player.dashCooldown = this.player.dashCooldownRate;
                audio.play('shoot');
                for (let i = 0; i < 8; i++) {
                    const angle = this.rng.range(0, Math.PI * 2);
                    this.particles.push({
                        x: this.player.x, y: this.player.y,
                        vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300,
                        life: 0.3, maxLife: 0.3, color: CONFIG.PALETTE.cyan, size: 4
                    });
                }
            }
        }

        let currentSpeed = this.player.speed;
        if (this.player.dashTimer > 0) {
            currentSpeed = CONFIG.PLAYER.dashSpeed;
        }

        this.player.x += dx * currentSpeed * dt;
        this.player.y += dy * currentSpeed * dt;

        // Arena boundaries
        this.player.x = Math.max(40, Math.min(CONFIG.WIDTH - 40, this.player.x));
        this.player.y = Math.max(40, Math.min(CONFIG.HEIGHT - 40, this.player.y));

        // Aim angle towards mouse
        const aimAngle = Math.atan2(input.mouse.y - this.player.y, input.mouse.x - this.player.x);

        // Firing
        this.player.fireTimer -= dt;
        if ((input.isDown('Space') || input.mouse.down) && this.player.fireTimer <= 0) {
            this.player.fireTimer = 1 / this.player.fireRate;
            audio.play('shoot', input.muted);

            const spread = 0.15;
            for (let i = 0; i < this.player.projectiles; i++) {
                let angleOffset = 0;
                if (this.player.projectiles > 1) {
                    angleOffset = -spread + (i / (this.player.projectiles - 1)) * (spread * 2);
                }
                const finalAngle = aimAngle + angleOffset;
                this.bullets.push({
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(finalAngle) * this.player.bulletSpeed,
                    vy: Math.sin(finalAngle) * this.player.bulletSpeed,
                    damage: this.player.bulletDamage,
                    range: this.player.bulletRange,
                    dist: 0,
                    pierceLeft: this.player.pierce
                });
            }
        }

        // Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            const step = dt * Math.hypot(b.vx, b.vy);
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.dist += step;
            if (b.dist >= b.range || b.x < 0 || b.x > CONFIG.WIDTH || b.y < 0 || b.y > CONFIG.HEIGHT) {
                this.bullets.splice(i, 1);
            }
        }

        // Update Enemy Bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const eb = this.enemyBullets[i];
            eb.x += eb.vx * dt;
            eb.y += eb.vy * dt;
            const distToPlayer = Math.hypot(eb.x - this.player.x, eb.y - this.player.y);
            if (distToPlayer < this.player.radius + eb.radius) {
                if (this.player.dashTimer <= 0) {
                    this.player.hp -= eb.damage;
                    this.hitFlash = 1.0;
                    this.screenShake = 0.4;
                    audio.play('hit');
                    this.addFloatingText(this.player.x, this.player.y, `-${eb.damage}`, CONFIG.PALETTE.orange);
                    if (this.player.hp <= 0) {
                        this.gameOver(audio);
                    }
                }
                this.enemyBullets.splice(i, 1);
                continue;
            }
            if (eb.x < 0 || eb.x > CONFIG.WIDTH || eb.y < 0 || eb.y > CONFIG.HEIGHT) {
                this.enemyBullets.splice(i, 1);
            }
        }

        // Spawning enemies
        if (!this.bossActive) {
            if (this.enemiesToSpawn > 0) {
                this.spawnTimer -= dt;
                if (this.spawnTimer <= 0) {
                    this.spawnTimer = 0.8;
                    this.enemiesToSpawn--;
                    this.spawnEnemy();
                }
            } else if (this.enemies.length === 0) {
                // Wave completed
                this.startWave(this.wave + 1);
            }
        } else {
            if (this.boss) {
                if (this.boss.y < this.boss.targetY) {
                    this.boss.y += dt * 100;
                } else {
                    this.boss.attackTimer += dt;
                    if (this.boss.attackTimer >= 2.0) {
                        this.boss.attackTimer = 0;
                        // Radial burst
                        const count = 12;
                        for (let i = 0; i < count; i++) {
                            const angle = (i / count) * Math.PI * 2 + this.boss.angle;
                            this.enemyBullets.push({
                                x: this.boss.x, y: this.boss.y,
                                vx: Math.cos(angle) * 250, vy: Math.sin(angle) * 250,
                                radius: 7, damage: 15
                            });
                        }
                        this.boss.angle += 0.2;
                        audio.play('shoot');
                    }
                }
            }
        }

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (e.type === 'chaser') {
                const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                e.x += Math.cos(angle) * e.speed * dt;
                e.y += Math.sin(angle) * e.speed * dt;
            } else if (e.type === 'splitter') {
                const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                e.x += Math.cos(angle) * e.speed * dt;
                e.y += Math.sin(angle) * e.speed * dt;
            } else if (e.type === 'weaver') {
                const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                if (dist > 300) {
                    e.x += Math.cos(angle) * e.speed * dt;
                    e.y += Math.sin(angle) * e.speed * dt;
                } else {
                    e.x -= Math.sin(angle) * e.speed * 0.8 * dt;
                    e.y += Math.cos(angle) * e.speed * 0.8 * dt;
                }
                e.shootTimer -= dt;
                if (e.shootTimer <= 0) {
                    e.shootTimer = 2.5;
                    this.enemyBullets.push({
                        x: e.x, y: e.y,
                        vx: Math.cos(angle) * 280, vy: Math.sin(angle) * 280,
                        radius: 6, damage: 12
                    });
                    audio.play('shoot');
                }
            } else if (e.type === 'shardbug') {
                const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                e.x += Math.cos(angle) * e.speed * dt;
                e.y += Math.sin(angle) * e.speed * dt;
            }

            // Check collision with player
            const distToPlayer = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if (distToPlayer < this.player.radius + e.radius) {
                if (this.player.dashTimer <= 0) {
                    this.player.hp -= 15;
                    this.hitFlash = 1.0;
                    this.screenShake = 0.5;
                    audio.play('hit');
                    this.addFloatingText(this.player.x, this.player.y, `-15`, CONFIG.PALETTE.orange);
                    if (this.player.hp <= 0) {
                        this.gameOver(audio);
                    }
                }
                if (e.type !== 'titan') {
                    this.enemies.splice(i, 1);
                    continue;
                }
            }
        }

        // Check Boss collision with player
        if (this.boss && this.boss.y >= this.boss.targetY) {
            const distToBoss = Math.hypot(this.boss.x - this.player.x, this.boss.y - this.player.y);
            if (distToBoss < this.player.radius + this.boss.radius) {
                if (this.player.dashTimer <= 0) {
                    this.player.hp -= 25;
                    this.hitFlash = 1.0;
                    this.screenShake = 0.8;
                    audio.play('hit');
                    this.addFloatingText(this.player.x, this.player.y, `-25`, CONFIG.PALETTE.orange);
                    if (this.player.hp <= 0) {
                        this.gameOver(audio);
                    }
                }
            }
        }

        // Bullet vs Enemies collision
        for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = this.bullets[bIdx];
            let hit = false;

            // Check boss
            if (this.boss && this.boss.y >= this.boss.targetY) {
                const dist = Math.hypot(b.x - this.boss.x, b.y - this.boss.y);
                if (dist < b.radius || dist < this.boss.radius) {
                    hit = true;
                    this.boss.hp -= b.damage;
                    audio.play('hit');
                    this.addFloatingText(this.boss.x + this.rng.range(-20, 20), this.boss.y + this.rng.range(-20, 20), Math.round(b.damage), CONFIG.PALETTE.gold);
                    if (this.boss.hp <= 0) {
                        audio.play('explosion');
                        this.screenShake = 1.5;
                        this.score += 2000;
                        this.spawnShards(this.boss.x, this.boss.y, 15);
                        this.boss = null;
                        this.bossActive = false;
                        this.startWave(this.wave + 1);
                    }
                }
            }

            // Check normal enemies
            for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
                const e = this.enemies[eIdx];
                const dist = Math.hypot(b.x - e.x, b.y - e.y);
                if (dist < e.radius + 6) {
                    hit = true;
                    e.hp -= b.damage;
                    audio.play('hit');
                    this.addFloatingText(e.x, e.y, Math.round(b.damage), CONFIG.PALETTE.white);

                    if (e.hp <= 0) {
                        this.killEnemy(e, eIdx, audio);
                    }
                    break;
                }
            }

            if (hit) {
                if (b.pierceLeft > 0) {
                    b.pierceLeft--;
                } else {
                    this.bullets.splice(bIdx, 1);
                }
            }
        }

        // Update Shards (Lumen pickup)
        for (let i = this.shards.length - 1; i >= 0; i--) {
            const s = this.shards[i];
            const dist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
            if (dist < this.player.magnetRange) {
                const angle = Math.atan2(this.player.y - s.y, this.player.x - s.x);
                s.x += Math.cos(angle) * 500 * dt;
                s.y += Math.sin(angle) * 500 * dt;
            }
            if (dist < this.player.radius + s.radius) {
                audio.play('pickup');
                this.shards.splice(i, 1);
                this.xp += s.value;
                this.score += 50 * (this.combo + 1);
                if (this.xp >= this.xpToLevel) {
                    this.triggerLevelUp(audio);
                }
                continue;
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update Floating Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= 30 * dt;
            ft.life -= dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    spawnEnemy() {
        const typeRoll = this.rng.next();
        let type = 'chaser';
        let hp = 30 + this.wave * 5;
        let speed = 160 + this.wave * 4;
        let radius = 18;

        if (this.wave >= 2 && typeRoll < 0.3) {
            type = 'splitter';
            hp = 40;
            speed = 190;
            radius = 20;
        } else if (this.wave >= 3 && typeRoll < 0.55) {
            type = 'weaver';
            hp = 35;
            speed = 130;
            radius = 16;
        } else if (this.wave >= 2 && typeRoll < 0.7) {
            type = 'shardbug';
            hp = 15;
            speed = 260;
            radius = 12;
        }

        // Spawn around edges
        let x, y;
        if (this.rng.next() < 0.5) {
            x = this.rng.next() < 0.5 ? -30 : CONFIG.WIDTH + 30;
            y = this.rng.range(0, CONFIG.HEIGHT);
        } else {
            x = this.rng.range(0, CONFIG.WIDTH);
            y = this.rng.next() < 0.5 ? -30 : CONFIG.HEIGHT + 30;
        }

        this.enemies.push({
            type, x, y, hp, maxHp: hp, speed, radius,
            shootTimer: 2.0
        });
    }

    killEnemy(e, index, audio) {
        audio.play('explosion');
        this.enemies.splice(index, 1);
        this.kills++;
        this.score += 200 * (this.combo + 1);
        this.combo++;
        this.comboTimer = 3.5;

        // Splitter behavior
        if (e.type === 'splitter') {
            for (let i = 0; i < 2; i++) {
                this.enemies.push({
                    type: 'chaser',
                    x: e.x + this.rng.range(-10, 10),
                    y: e.y + this.rng.range(-10, 10),
                    hp: 20, maxHp: 20,
                    speed: 220, radius: 12
                });
            }
        }

        const shardCount = (e.type === 'shardbug') ? 4 : 2;
        this.spawnShards(e.x, e.y, shardCount);

        // Explosion particles
        for (let i = 0; i < 10; i++) {
            const angle = this.rng.range(0, Math.PI * 2);
            this.particles.push({
                x: e.x, y: e.y,
                vx: Math.cos(angle) * this.rng.range(80, 220),
                vy: Math.sin(angle) * this.rng.range(80, 220),
                life: 0.4, maxLife: 0.4,
                color: e.type === 'shardbug' ? CONFIG.PALETTE.cyan : CONFIG.PALETTE.pink,
                size: this.rng.range(3, 6)
            });
        }
    }

    spawnShards(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = this.rng.range(0, Math.PI * 2);
            const speed = this.rng.range(40, 150);
            this.shards.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 8,
                value: 25
            });
        }
    }

    addFloatingText(x, y, text, color) {
        this.floatingTexts.push({
            x, y, text, color, life: 0.8, maxLife: 0.8
        });
    }

    triggerLevelUp(audio) {
        audio.play('levelup');
        this.xp -= this.xpToLevel;
        this.xpToLevel = Math.round(this.xpToLevel * 1.35);
        this.level++;
        this.state = 'upgrade';

        // Pick 3 random distinct upgrades
        const pool = [...CONFIG.UPGRADES];
        this.availableUpgrades = [];
        for (let i = 0; i < 3 && pool.length > 0; i++) {
            const idx = this.rng.int(0, pool.length - 1);
            this.availableUpgrades.push(pool.splice(idx, 1)[0]);
        }
    }

    applyUpgrade(cardIndex, audio) {
        audio.play('pickup');
        const card = this.availableUpgrades[cardIndex];
        if (!card) return;

        if (card.stat === 'bulletDamage') this.player.bulletDamage *= card.val;
        else if (card.stat === 'fireRate') this.player.fireRate *= card.val;
        else if (card.stat === 'speed') this.player.speed *= card.val;
        else if (card.stat === 'maxHp') {
            this.player.maxHp += card.val;
            this.player.hp = this.player.maxHp;
        } else if (card.stat === 'projectiles') this.player.projectiles += card.val;
        else if (card.stat === 'dashCooldown') this.player.dashCooldownRate *= card.val;
        else if (card.stat === 'magnetRange') this.player.magnetRange *= card.val;
        else if (card.stat === 'pierce') this.player.pierce += card.val;

        this.state = 'play';
    }

    gameOver(audio) {
        audio.play('gameover');
        this.state = 'gameover';
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
        }
    }

    reset() {
        this.score = 0;
        this.wave = 1;
        this.kills = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.xp = 0;
        this.xpToLevel = 100;
        this.level = 1;
        this.player = {
            x: CONFIG.WIDTH / 2,
            y: CONFIG.HEIGHT / 2,
            radius: CONFIG.PLAYER.radius,
            speed: CONFIG.PLAYER.speed,
            hp: CONFIG.PLAYER.maxHp,
            maxHp: CONFIG.PLAYER.maxHp,
            dashCooldown: 0,
            dashTimer: 0,
            fireTimer: 0,
            fireRate: CONFIG.PLAYER.fireRate,
            bulletSpeed: CONFIG.PLAYER.bulletSpeed,
            bulletDamage: CONFIG.PLAYER.bulletDamage,
            bulletRange: CONFIG.PLAYER.bulletRange,
            projectiles: 1,
            pierce: 0,
            dashCooldownRate: CONFIG.PLAYER.dashCooldown,
            magnetRange: 120
        };
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.shards = [];
        this.particles = [];
        this.floatingTexts = [];
        this.bossActive = false;
        this.boss = null;
        this.startWave(1);
    }
}
