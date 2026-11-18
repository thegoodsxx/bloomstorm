import { World } from './world.js';
import { Input } from './input.js';
import { SoundSynth } from './audio.js';
import { Renderer } from './render.js';
import { setupShot } from './shots.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const input = new Input(canvas);
    const audio = new SoundSynth();
    const renderer = new Renderer(ctx);

    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    const seedParam = parseInt(params.get('seed'), 10) || 1337;

    const world = new World(seedParam);

    if (shot) {
        setupShot(world, shot, seedParam);
        renderer.render(world, input.mouse);
        return; // Frozen screenshot mode
    }

    let lastTime = performance.now();

    function gameLoop(timestamp) {
        const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
        lastTime = timestamp;

        audio.muted = input.muted;

        if (world.state === 'upgrade') {
            if (input.wasPressed('Digit1') || input.wasPressed('Numpad1')) {
                world.applyUpgrade(0, audio);
            } else if (input.wasPressed('Digit2') || input.wasPressed('Numpad2')) {
                world.applyUpgrade(1, audio);
            } else if (input.wasPressed('Digit3') || input.wasPressed('Numpad3')) {
                world.applyUpgrade(2, audio);
            } else if (input.mouse.pressed) {
                // Check card clicks if mouse clicked
                const cardW = 320;
                const cardH = 280;
                const startX = (1280 - (cardW * 3 + 40)) / 2;
                const y = 220;
                for (let i = 0; i < world.availableUpgrades.length; i++) {
                    const cx = startX + i * (cardW + 20);
                    if (input.mouse.x >= cx && input.mouse.x <= cx + cardW && input.mouse.y >= y && input.mouse.y <= y + cardH) {
                        world.applyUpgrade(i, audio);
                        break;
                    }
                }
            }
        } else {
            world.update(dt, input, audio);
        }

        renderer.render(world, input.mouse);

        input.clearPressed();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});
