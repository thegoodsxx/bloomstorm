/**
 * Handover program for BLOOMSTORM game entry.
 * Hands in: game directory (game/) and screenshots directory (screenshots/) into out/.
 * Passes caps to buildDossier: text_max_bytes (160KB), screenshots (max 4, 256KB each),
 * game_max_files (993), game_max_bytes (50MB), and game_path_max_bytes (1000).
 */
import { buildDossier } from './vendor/makefun-game.ts';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
    const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const baseDir = import.meta.dirname || process.cwd();
    const gameDir = path.join(baseDir, 'game');
    const targetGameDir = path.join(outDir, 'game');
    if (fs.existsSync(gameDir)) {
        fs.cpSync(gameDir, targetGameDir, { recursive: true });
    }

    const shotsDir = path.join(baseDir, 'screenshots');
    const targetShotsDir = path.join(outDir, 'screenshots');
    if (fs.existsSync(shotsDir)) {
        fs.cpSync(shotsDir, targetShotsDir, { recursive: true });
    }

    const dossier = await buildDossier(outDir, {
        text_max_bytes: 163840,
        screenshots: { max: 4, max_bytes: 262144 },
        game_max_files: 993,
        game_max_bytes: 50331648,
        game_path_max_bytes: 1000
    });

    const dossierPath = path.join(outDir, 'dossier.json');
    fs.writeFileSync(dossierPath, JSON.stringify(dossier, null, 2));
    console.log('Successfully built dossier at:', dossierPath);
}

main().catch(err => {
    console.error('Error building dossier:', err);
    process.exit(1);
});
