import { CONFIG } from './config.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    render(world, mouse) {
        const { ctx } = this;
        ctx.save();

        // Screen shake
        if (world.screenShake > 0) {
            const mag = world.screenShake * 12;
            ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
        }

        // Background
        ctx.fillStyle = CONFIG.PALETTE.bg;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        // Grid lines
        ctx.strokeStyle = CONFIG.PALETTE.bgGrid;
        ctx.lineWidth = 1;
        const gridSize = 64;
        ctx.beginPath();
        for (let x = 0; x <= CONFIG.WIDTH; x += gridSize) {
            ctx.moveTo(x, 0); ctx.lineTo(x, CONFIG.HEIGHT);
        }
        for (let y = 0; y <= CONFIG.HEIGHT; y += gridSize) {
            ctx.moveTo(0, y); ctx.lineTo(CONFIG.WIDTH, y);
        }
        ctx.stroke();

        // Background floating petals
        for (let p of world.petals) {
            ctx.fillStyle = CONFIG.PALETTE.violet;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Decorative Heartbloom flower at arena center
        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.shadowColor = CONFIG.PALETTE.heartbloomCore;
        ctx.shadowBlur = 25;
        // Petals
        for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.fillStyle = CONFIG.PALETTE.heartbloomPetal;
            ctx.beginPath();
            ctx.ellipse(0, 25, 10, 20, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Core
        ctx.fillStyle = CONFIG.PALETTE.heartbloomCore;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Shards (Lumen)
        for (let s of world.shards) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.fillStyle = CONFIG.PALETTE.gold;
            ctx.shadowColor = CONFIG.PALETTE.gold;
            ctx.shadowBlur = 10;
            ctx.rotate(Date.now() * 0.003);
            ctx.fillRect(-s.radius / 2, -s.radius / 2, s.radius, s.radius);
            ctx.restore();
        }

        // Particles
        for (let p of world.particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Bullets
        ctx.fillStyle = CONFIG.PALETTE.cyan;
        ctx.shadowColor = CONFIG.PALETTE.cyan;
        ctx.shadowBlur = 12;
        for (let b of world.bullets) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Enemy Bullets
        ctx.fillStyle = CONFIG.PALETTE.orange;
        ctx.shadowColor = CONFIG.PALETTE.orange;
        ctx.shadowBlur = 12;
        for (let eb of world.enemyBullets) {
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Enemies
        for (let e of world.enemies) {
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.strokeStyle = e.type === 'shardbug' ? CONFIG.PALETTE.cyan : CONFIG.PALETTE.pink;
            ctx.fillStyle = CONFIG.PALETTE.bg;
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 15;

            if (e.type === 'chaser') {
                ctx.beginPath();
                ctx.moveTo(0, -e.radius);
                ctx.lineTo(e.radius, e.radius);
                ctx.lineTo(-e.radius, e.radius);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (e.type === 'splitter') {
                ctx.rotate(Date.now() * 0.002);
                ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
                ctx.strokeRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
            } else if (e.type === 'weaver') {
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const px = Math.cos(angle) * e.radius;
                    const py = Math.sin(angle) * e.radius;
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (e.type === 'shardbug') {
                ctx.beginPath();
                ctx.moveTo(0, -e.radius * 1.3);
                ctx.lineTo(e.radius * 0.8, 0);
                ctx.lineTo(0, e.radius * 1.3);
                ctx.lineTo(-e.radius * 0.8, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        // Boss Titan
        if (world.boss) {
            const b = world.boss;
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.strokeStyle = CONFIG.PALETTE.orange;
            ctx.fillStyle = CONFIG.PALETTE.cardBg;
            ctx.lineWidth = 4;
            ctx.shadowColor = CONFIG.PALETTE.orange;
            ctx.shadowBlur = 25;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const px = Math.cos(angle) * b.radius;
                const py = Math.sin(angle) * b.radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Boss HP Bar
            const barW = 400;
            const barH = 12;
            const barX = (CONFIG.WIDTH - barW) / 2;
            const barY = 30;
            ctx.fillStyle = 'rgba(25, 15, 40, 0.8)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = CONFIG.PALETTE.orange;
            ctx.fillRect(barX, barY, barW * Math.max(0, b.hp / b.maxHp), barH);
            ctx.strokeStyle = CONFIG.PALETTE.white;
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barW, barH);

            ctx.fillStyle = CONFIG.PALETTE.white;
            ctx.font = 'bold 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(`HUSK TITAN — WAVE ${world.wave}`, CONFIG.WIDTH / 2, barY - 8);
        }

        // Player
        const p = world.player;
        const aimAngle = Math.atan2(mouse.y - p.y, mouse.x - p.x);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(aimAngle);

        ctx.shadowColor = CONFIG.PALETTE.cyan;
        ctx.shadowBlur = p.dashTimer > 0 ? 30 : 15;
        ctx.strokeStyle = CONFIG.PALETTE.cyan;
        ctx.fillStyle = world.hitFlash > 0 ? CONFIG.PALETTE.white : CONFIG.PALETTE.violet;
        ctx.lineWidth = 3;

        // Guardian Firefly Drone shape
        ctx.beginPath();
        ctx.moveTo(p.radius + 6, 0);
        ctx.lineTo(-p.radius, -p.radius * 0.8);
        ctx.lineTo(-p.radius * 0.5, 0);
        ctx.lineTo(-p.radius, p.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Floating texts
        for (let ft of world.floatingTexts) {
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = ft.life / ft.maxLife;
            ctx.font = 'bold 15px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1.0;

        // HUD
        this.renderHUD(world);

        // Screens: Start, Upgrade, GameOver
        if (world.state === 'start') {
            this.renderStartScreen(world);
        } else if (world.state === 'upgrade') {
            this.renderUpgradeScreen(world);
        } else if (world.state === 'gameover') {
            this.renderGameOverScreen(world);
        }

        ctx.restore();
    }

    renderHUD(world) {
        const { ctx } = this;
        const p = world.player;

        // HP Bar
        ctx.fillStyle = 'rgba(25, 15, 40, 0.8)';
        ctx.fillRect(30, 30, 200, 18);
        ctx.fillStyle = CONFIG.PALETTE.pink;
        ctx.fillRect(30, 30, 200 * Math.max(0, p.hp / p.maxHp), 18);
        ctx.strokeStyle = CONFIG.PALETTE.cardBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, 200, 18);

        ctx.fillStyle = CONFIG.PALETTE.white;
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${Math.max(0, Math.round(p.hp))} / ${p.maxHp}`, 40, 44);

        // XP Bar
        ctx.fillStyle = 'rgba(25, 15, 40, 0.8)';
        ctx.fillRect(30, 56, 200, 12);
        ctx.fillStyle = CONFIG.PALETTE.cyan;
        ctx.fillRect(30, 56, 200 * Math.min(1, world.xp / world.xpToLevel), 12);
        ctx.strokeRect(30, 56, 200, 12);
        ctx.fillText(`LVL ${world.level} (XP)`, 40, 66);

        // Dash Cooldown bar
        ctx.fillStyle = 'rgba(25, 15, 40, 0.8)';
        ctx.fillRect(30, 78, 200, 10);
        const dashRatio = p.dashCooldown <= 0 ? 1 : 1 - (p.dashCooldown / p.dashCooldownRate);
        ctx.fillStyle = CONFIG.PALETTE.gold;
        ctx.fillRect(30, 78, 200 * dashRatio, 10);
        ctx.strokeRect(30, 78, 200, 10);
        ctx.fillText('DASH [SHIFT]', 40, 87);

        // Score, Wave, Combo, Kills (Top Right)
        ctx.textAlign = 'right';
        ctx.font = 'bold 20px system-ui';
        ctx.fillStyle = CONFIG.PALETTE.gold;
        ctx.fillText(`SCORE: ${world.score}`, CONFIG.WIDTH - 40, 45);

        ctx.font = '16px system-ui';
        ctx.fillStyle = CONFIG.PALETTE.cyan;
        ctx.fillText(`WAVE: ${world.wave}  |  KILLS: ${world.kills}`, CONFIG.WIDTH - 40, 72);

        if (world.combo > 1) {
            ctx.fillStyle = CONFIG.PALETTE.pink;
            ctx.font = 'bold 18px system-ui';
            ctx.fillText(`COMBO x${world.combo}`, CONFIG.WIDTH - 40, 98);
        }
    }

    renderStartScreen(world) {
        const { ctx } = this;
        ctx.fillStyle = 'rgba(9, 6, 15, 0.85)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = CONFIG.PALETTE.pink;
        ctx.shadowColor = CONFIG.PALETTE.pink;
        ctx.shadowBlur = 30;
        ctx.font = 'bold 64px system-ui';
        ctx.fillText('BLOOMSTORM', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 120);

        ctx.shadowBlur = 0;
        ctx.fillStyle = CONFIG.PALETTE.cyan;
        ctx.font = '22px system-ui';
        ctx.fillText('Defend the Heartbloom in a void garden against geometric Husks.', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 60);

        ctx.fillStyle = CONFIG.PALETTE.dimText;
        ctx.font = '16px system-ui';
        ctx.fillText('Controls: WASD / Arrows to Move  |  Mouse to Aim  |  Hold Click / Space to Fire  |  Shift to Dash', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
        ctx.fillText(`Best Score: ${world.bestScore}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 40);

        ctx.fillStyle = CONFIG.PALETTE.gold;
        ctx.font = 'bold 24px system-ui';
        ctx.fillText('CLICK OR PRESS ENTER TO START', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 120);
    }

    renderUpgradeScreen(world) {
        const { ctx } = this;
        ctx.fillStyle = 'rgba(9, 6, 15, 0.8)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = CONFIG.PALETTE.gold;
        ctx.shadowColor = CONFIG.PALETTE.gold;
        ctx.shadowBlur = 25;
        ctx.font = 'bold 42px system-ui';
        ctx.fillText('LEVEL UP — CHOOSE AN UPGRADE', CONFIG.WIDTH / 2, 140);
        ctx.shadowBlur = 0;

        const cardW = 320;
        const cardH = 280;
        const startX = (CONFIG.WIDTH - (cardW * 3 + 40)) / 2;
        const y = 220;

        for (let i = 0; i < world.availableUpgrades.length; i++) {
            const card = world.availableUpgrades[i];
            const x = startX + i * (cardW + 20);

            ctx.fillStyle = CONFIG.PALETTE.cardBg;
            ctx.strokeStyle = CONFIG.PALETTE.cardBorder;
            ctx.lineWidth = 3;
            ctx.fillRect(x, y, cardW, cardH);
            ctx.strokeRect(x, y, cardW, cardH);

            ctx.fillStyle = CONFIG.PALETTE.cyan;
            ctx.font = 'bold 18px system-ui';
            ctx.fillText(`[${i + 1}]`, x + cardW / 2, y + 40);

            ctx.fillStyle = CONFIG.PALETTE.white;
            ctx.font = 'bold 20px system-ui';
            ctx.fillText(card.name, x + cardW / 2, y + 90);

            ctx.fillStyle = CONFIG.PALETTE.dimText;
            ctx.font = '16px system-ui';
            ctx.fillText(card.desc, x + cardW / 2, y + 150);
        }
    }

    renderGameOverScreen(world) {
        const { ctx } = this;
        ctx.fillStyle = 'rgba(9, 6, 15, 0.9)';
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = CONFIG.PALETTE.orange;
        ctx.shadowColor = CONFIG.PALETTE.orange;
        ctx.shadowBlur = 30;
        ctx.font = 'bold 64px system-ui';
        ctx.fillText('GAME OVER', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 120);

        ctx.shadowBlur = 0;
        ctx.fillStyle = CONFIG.PALETTE.white;
        ctx.font = '24px system-ui';
        ctx.fillText(`Final Score: ${world.score}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 40);

        ctx.fillStyle = CONFIG.PALETTE.dimText;
        ctx.font = '18px system-ui';
        ctx.fillText(`Wave Reached: ${world.wave}   |   Total Kills: ${world.kills}   |   Best Score: ${world.bestScore}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 10);

        ctx.fillStyle = CONFIG.PALETTE.gold;
        ctx.font = 'bold 22px system-ui';
        ctx.fillText('CLICK OR PRESS ENTER TO RESTART', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 90);
    }
}
