import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../public/assets');
const destDir = path.resolve(__dirname, '../dist/assets');

console.log(`[AssetCopy] Starting copy from ${srcDir} to ${destDir}`);

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        if (!fs.existsSync(path.dirname(dest))) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
        }
        fs.copyFileSync(src, dest);
        console.log(`[AssetCopy] Copied: ${path.basename(dest)}`);
    }
}

try {
    if (fs.existsSync(srcDir)) {
        copyRecursiveSync(srcDir, destDir);
        console.log('[AssetCopy] Copy completed successfully.');

        // List files in dist/assets to verify
        console.log('\n[AssetCopy] Verifying dist/assets content:');
        const listFiles = (dir) => {
            fs.readdirSync(dir).forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    listFiles(fullPath);
                } else {
                    console.log(` - ${path.relative(path.resolve(__dirname, '../dist'), fullPath)}`);
                }
            });
        };
        listFiles(destDir);

    } else {
        console.error(`[AssetCopy] Source directory not found: ${srcDir}`);
        process.exit(1);
    }
} catch (err) {
    console.error('[AssetCopy] Error copying assets:', err);
    process.exit(1);
}
