// Script to generate PWA icons
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const buffer = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    buffer[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(buffer);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon Drawer: Deep forest green with gold camera lens and polaroid card
function iconDrawer(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const nx = (x - cx) / (w / 2);
  const ny = (y - cy) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background: Deep Forest Green (#122b22) with subtle radial warmth
  let r = 18;
  let g = 43;
  let b = 34;
  let a = 255;

  // Outer border / rounded rect squircle
  const cornerR = 0.88;
  if (Math.abs(nx) > cornerR && Math.abs(ny) > cornerR) {
    const cDist = Math.hypot(Math.abs(nx) - cornerR, Math.abs(ny) - cornerR);
    if (cDist > (1 - cornerR)) {
      return [0, 0, 0, 0];
    }
  }

  // Camera Body: Cream/Ivory (#f5efe4) rounded box in center
  const boxW = 0.62;
  const boxH = 0.52;
  const boxY = 0.05;
  if (Math.abs(nx) <= boxW && Math.abs(ny - boxY) <= boxH) {
    // Ivory body
    r = 245;
    g = 239;
    b = 228;

    // Vintage gold accent bar across camera
    if (ny - boxY >= -0.32 && ny - boxY <= -0.18) {
      r = 212;
      g = 175;
      b = 55;
    }

    // Shutter button top-left
    if (nx >= -0.45 && nx <= -0.25 && ny - boxY <= -0.42) {
      r = 180;
      g = 60;
      b = 50; // Vintage red button
    }

    // Viewfinder top-right
    if (nx >= 0.28 && nx <= 0.42 && ny - boxY >= -0.35 && ny - boxY <= -0.22) {
      r = 30;
      g = 35;
      b = 40;
    }

    // Lens: Concentric circles in center
    const lensDist = Math.hypot(nx, ny - boxY - 0.05);
    if (lensDist <= 0.28) {
      // Outer brass gold ring
      r = 197;
      g = 155;
      b = 39;
    }
    if (lensDist <= 0.24) {
      // Dark lens glass
      r = 22;
      g = 28;
      b = 30;
    }
    if (lensDist <= 0.17) {
      // Inner lens aperture
      r = 35;
      g = 45;
      b = 48;
    }
    if (lensDist <= 0.08) {
      // Center reflection highlight
      r = 60;
      g = 80;
      b = 85;
    }
    // Lens glint
    if (Math.hypot(nx + 0.08, ny - boxY - 0.05 + 0.08) <= 0.04) {
      r = 240;
      g = 245;
      b = 250;
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, iconDrawer));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, iconDrawer));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, iconDrawer));

// Also generate maskable icon with safe zone padding
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => {
  // Safe zone scaling: scale coordinates by 0.8 from center
  const cx = w / 2;
  const cy = h / 2;
  const sx = (x - cx) / 0.8 + cx;
  const sy = (y - cy) / 0.8 + cy;
  if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
    return iconDrawer(sx, sy, w, h);
  }
  return [18, 43, 34, 255]; // forest green padding
}));

console.log('Successfully generated PWA icon assets in /public');
