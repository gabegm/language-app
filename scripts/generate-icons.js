import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconsDir = resolve(__dirname, '../public/icons');
const svgPath = resolve(iconsDir, 'icon.svg');

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(resolve(iconsDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}

generateIcons().catch(console.error);
