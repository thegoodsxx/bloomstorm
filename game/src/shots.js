import { World } from './world.js';

export function setupShot(world, shotType, seed) {
    world.rng.seed = seed;
    if (shotType === 'start') {
        world.state = 'start';
    } else if (shotType === 'play') {
        world.state = 'play';
        world.wave = 3;
        world.score = 12450;
        world.combo = 6;
        world.comboTimer = 3.0;
        world.kills = 45;
        world.player.hp = world.player.maxHp * 0.72;
        world.xp = world.xpToLevel * 0.60;

        // Spawn a few enemies of each type
        world.enemies = [
            { type: 'chaser', x: 300, y: 200, hp: 30, maxHp: 30, speed: 170, radius: 18 },
            { type: 'splitter', x: 900, y: 500, hp: 40, maxHp: 40, speed: 190, radius: 20 },
            { type: 'weaver', x: 1000, y: 200, hp: 35, maxHp: 35, speed: 130, radius: 16, shootTimer: 1.0 },
            { type: 'shardbug', x: 400, y: 600, hp: 15, maxHp: 15, speed: 260, radius: 12 }
        ];

        // Bullets mid-flight
        world.bullets = [
            { x: CONFIG_SAFE_X(600), y: CONFIG_SAFE_Y(360), vx: 800, vy: -200, damage: 20, range: 900, dist: 150, pierceLeft: 0 },
            { x: CONFIG_SAFE_X(630), y: CONFIG_SAFE_Y(350), vx: 750, vy: 300, damage: 20, range: 900, dist: 120, pierceLeft: 0 }
        ];

        // Shards
        world.shards = [
            { x: 500, y: 400, vx: 0, vy: 0, radius: 8, value: 25 },
            { x: 520, y: 420, vx: 0, vy: 0, radius: 8, value: 25 }
        ];
    } else if (shotType === 'upgrade') {
        world.state = 'upgrade';
        world.wave = 3;
        world.score = 12450;
        world.level = 2;
        world.triggerLevelUp({ play: () => {} });
    } else if (shotType === 'end') {
        world.state = 'gameover';
        world.score = 28450;
        world.bestScore = 28450;
        world.wave = 7;
        world.kills = 231;
    }
}

function CONFIG_SAFE_X(x) { return x; }
function CONFIG_SAFE_Y(y) { return y; }
