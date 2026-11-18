export const CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    PALETTE: {
        bg: '#09060f',
        bgGrid: '#150d24',
        pink: '#ff5da2',
        cyan: '#4de3ff',
        gold: '#ffd166',
        violet: '#9b5de5',
        orange: '#ff7847',
        white: '#ffffff',
        dimText: '#a094b8',
        heartbloomCore: '#ff2a85',
        heartbloomPetal: '#ff70b5',
        cardBg: '#181028',
        cardBorder: '#4d2d78',
        cardHover: '#2a1a46'
    },
    PLAYER: {
        radius: 14,
        speed: 320,
        maxHp: 100,
        dashSpeed: 800,
        dashDuration: 0.15,
        dashCooldown: 1.2,
        fireRate: 8, // shots per sec
        bulletSpeed: 900,
        bulletDamage: 20,
        bulletRange: 900
    },
    UPGRADES: [
        { id: 'dmg', name: 'PLASMA AMPLIFIER', desc: '+35% Bullet Damage', stat: 'bulletDamage', val: 1.35 },
        { id: 'rate', name: 'HYPER-CHRONO COIL', desc: '+30% Fire Rate', stat: 'fireRate', val: 1.3 },
        { id: 'speed', name: 'ION THRUSTERS', desc: '+25% Movement Speed', stat: 'speed', val: 1.25 },
        { id: 'hp', name: 'NANO-CORE SHIELD', desc: '+50 Max HP & Full Heal', stat: 'maxHp', val: 50 },
        { id: 'proj', name: 'SPLIT-MIRROR ARRAY', desc: '+1 Additional Projectile', stat: 'projectiles', val: 1 },
        { id: 'dash', name: 'PHASE CAPACITOR', desc: '-35% Dash Cooldown', stat: 'dashCooldown', val: 0.65 },
        { id: 'magnet', name: 'GRAVITON HARVESTER', desc: '+75% Lumen Magnet Range', stat: 'magnetRange', val: 1.75 },
        { id: 'pierce', name: 'RESONANT PIERCER', desc: 'Bullets pierce 1 enemy', stat: 'pierce', val: 1 }
    ]
};
