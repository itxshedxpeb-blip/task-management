import sharp from 'sharp';
import fs from 'fs';

const svgBuffer = fs.readFileSync('public/icon.svg');

// Generate 192x192 PNG
await sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile('public/icon-192x192.png');

// Generate 512x512 PNG
await sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile('public/icon-512x512.png');

console.log('Icons generated successfully!');
