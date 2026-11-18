# BLOOMSTORM

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01)
[![rank](https://make.fun/badge/best-game-01/thegoodsxx/bloomstorm/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard)

**BLOOMSTORM** is an original neon arena survival shooter built for the `make.fun` bounty "best-game-01". 

Pilot a guardian firefly drone defending the last Heartbloom in a void garden against waves of geometric Husks. Collect lumen shards to level up, unlock powerful augmentations, and survive against formidable Husk Titan bosses!

## Features
- **Canvas 2D & Neon Aesthetics:** Stunning cyberpunk vector visuals with glowing particle effects, screen shake, and hit feedback.
- **Synthesized WebAudio:** Zero external audio assets; fully synthesized sound effects for shooting, hits, explosions, pickups, level-ups, and game over.
- **Roguelike Upgrades:** Choose from stacking upgrades (damage, fire rate, movement speed, max HP, multi-shot, dash cooldown, magnet range, piercing bullets) on level up.
- **Boss Battles:** Every 5th wave brings a massive Husk Titan boss with radial projectile bursts.

## Controls
- **Move:** `WASD` or Arrow Keys
- **Aim:** Mouse
- **Fire:** Hold Left Click or `Space`
- **Dash:** `Shift` (brief invulnerability + cooldown)
- **Pause:** `P`
- **Mute:** `M`
- **Start / Restart:** `Enter` or Click

## How to Run
1. Start the static game server:
   ```bash
   node serve.ts
   ```
2. Open your browser at:
   `http://localhost:8080`

## Handover & Dossier Build
```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License
MIT License.
