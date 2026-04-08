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

  // PDF sheet — A4 printable with AllowBox branding + centered QR + caption
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const pdfPath = path.join(OUT, 'demo-qr-sheet.pdf');
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Page dimensions: A4 is 595 x 842 points
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Brand title
  doc.fontSize(48)
     .fillColor('#111827')
     .text('AllowBox', 0, 100, { align: 'center', width: pageWidth });

  // Subtitle
  doc.fontSize(20)
     .fillColor('#6b7280')
     .text('Scan to experience the platform', 0, 170, { align: 'center', width: pageWidth });

  // QR image — centered, 320x320
  const qrSize = 320;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 240;
  doc.image(path.join(OUT, 'demo-qr.png'), qrX, qrY, { width: qrSize, height: qrSize });

  // URL below QR
  doc.fontSize(14)
     .fillColor('#374151')
     .text(TARGET, 0, qrY + qrSize + 30, { align: 'center', width: pageWidth });

  // Footer trust line
  doc.fontSize(12)
     .fillColor('#9ca3af')
     .text(
       'No signup · No data saved · Just tap and play',
       0,
       pageHeight - 80,
       { align: 'center', width: pageWidth },
     );

  doc.end();

  // Wait for the stream to finish writing before logging success
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log('✓ Generated demo-qr-sheet.pdf (A4)');

  console.log(`\nQR target URL: ${TARGET}`);
}

main().catch((err) => {
  console.error('QR generation failed:', err);
  process.exit(1);
});
