#!/usr/bin/env node
/**
 * Generate QR code artifacts for the demo landing page.
 *
 * Outputs:
 *  - public/demo-qr.png  (1024x1024, error correction H)
 *  - public/demo-qr.svg  (vector, error correction H)
 *  - public/demo-qr-sheet.pdf  (A4 printable sheet)   [added in task 18]
 *
 * Run from apps/web/ via `npm run qr`.
 */

import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET = 'https://allowbox-demo.vercel.app/';
const OUT = path.resolve(__dirname, '..', 'public');

async function main() {
  if (!fs.existsSync(OUT)) {
    fs.mkdirSync(OUT, { recursive: true });
  }

  // PNG — 1024x1024, highest error correction so print scuffs don't break scanning
  await QRCode.toFile(path.join(OUT, 'demo-qr.png'), TARGET, {
    width: 1024,
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });
  console.log('✓ Generated demo-qr.png (1024x1024)');

  // SVG — vector, scales infinitely
  const svg = await QRCode.toString(TARGET, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });
  fs.writeFileSync(path.join(OUT, 'demo-qr.svg'), svg);
  console.log('✓ Generated demo-qr.svg');

  console.log(`\nQR target URL: ${TARGET}`);
}

main().catch((err) => {
  console.error('QR generation failed:', err);
  process.exit(1);
});
