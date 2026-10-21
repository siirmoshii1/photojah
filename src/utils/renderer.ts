import {
  CaptionSettings,
  CapturedPhoto,
  FilterId,
  FormatId,
  FrameSettings,
} from '../types';
import { applyAdjustmentsToCanvas, applyFilterToCanvas } from './filters';

// Image loader cache
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete) return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export interface CompositionConfig {
  photos: CapturedPhoto[];
  formatId: FormatId;
  filterId: FilterId;
  filterIntensity: number;
  frameSettings: FrameSettings;
  captionSettings: CaptionSettings;
}

export async function renderComposition(
  config: CompositionConfig,
  scale: number = 1.0 // 1.0 for high-res export (~1800-2400px), 0.4-0.5 for preview
): Promise<HTMLCanvasElement> {
  const {
    photos,
    formatId,
    filterId,
    filterIntensity,
    frameSettings,
    captionSettings,
  } = config;

  // Pre-load all photo images
  const loadedImages: HTMLImageElement[] = [];
  for (const p of photos) {
    try {
      const img = await loadImage(p.originalDataUrl);
      loadedImages.push(img);
    } catch {
      // Fallback: create empty canvas
      const fallback = document.createElement('canvas');
      fallback.width = 600;
      fallback.height = 600;
      const fCtx = fallback.getContext('2d');
      if (fCtx) {
        fCtx.fillStyle = '#333';
        fCtx.fillRect(0, 0, 600, 600);
      }
      const dummyImg = new Image();
      dummyImg.src = fallback.toDataURL();
      loadedImages.push(dummyImg);
    }
  }

  // Base canvas dimensions based on format
  const baseDim = getCanvasDimensions(formatId);
  const width = Math.round(baseDim.width * scale);
  const height = Math.round(baseDim.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Scale context coordinates to base dimensions
  ctx.save();
  ctx.scale(scale, scale);

  // 1. Draw Frame Background
  drawFrameBackground(ctx, baseDim.width, baseDim.height, frameSettings, formatId);

  // 2. Draw Photos by Format
  await drawPhotosByFormat(
    ctx,
    photos,
    loadedImages,
    formatId,
    baseDim.width,
    baseDim.height,
    filterId,
    filterIntensity,
    frameSettings
  );

  // 3. Draw Captions & Typography
  drawCaptions(ctx, baseDim.width, baseDim.height, formatId, captionSettings, frameSettings);

  // 4. Draw Photojah Signature (if enabled)
  if (frameSettings.showSignature) {
    drawSignature(ctx, baseDim.width, baseDim.height, formatId, frameSettings);
  }

  ctx.restore();
  return canvas;
}

function getCanvasDimensions(formatId: FormatId): { width: number; height: number } {
  switch (formatId) {
    case 'classic-polaroid':
      return { width: 1400, height: 1720 };
    case 'wide-polaroid':
      return { width: 1800, height: 1440 };
    case 'tall-polaroid':
      return { width: 1400, height: 1900 };
    case 'square-instant':
      return { width: 1500, height: 1500 };
    case 'three-photo-strip':
      return { width: 900, height: 2600 };
    case 'four-photo-strip':
      return { width: 900, height: 3200 };
    case 'four-photo-grid':
      return { width: 1700, height: 1950 };
    case 'vintage-collage':
      return { width: 1800, height: 1500 };
    case 'wide-booth-strip':
      return { width: 2600, height: 950 };
    case 'mini-polaroid':
      return { width: 1000, height: 1550 };
    case 'double-polaroid':
      return { width: 1900, height: 1450 };
    case 'contact-sheet':
      return { width: 1800, height: 1500 };
    case 'twin-strip':
      return { width: 1800, height: 2600 };
    case 'passport-six':
      return { width: 1800, height: 2400 };
    case 'film-negative':
      return { width: 900, height: 3200 };
    case 'wedding-guestbook':
      return { width: 1800, height: 2500 };
    case 'bookmark-strip':
      return { width: 750, height: 2800 };
    default:
      return { width: 1400, height: 1720 };
  }
}

function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameSettings,
  formatId: FormatId
) {
  // If contact sheet or film negative, dark analog film stock base
  if (formatId === 'contact-sheet') {
    ctx.fillStyle = '#141618';
    ctx.fillRect(0, 0, w, h);
    drawContactSheetSprockets(ctx, w, h);
    return;
  }

  if (formatId === 'film-negative') {
    ctx.fillStyle = '#0f1114';
    ctx.fillRect(0, 0, w, h);
    drawFilmNegativeSprockets(ctx, w, h);
    return;
  }

  // Base color
  ctx.fillStyle = frame.colorHex;
  ctx.fillRect(0, 0, w, h);

  // Decorative border for wedding guestbook
  if (formatId === 'wedding-guestbook') {
    ctx.save();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, w - 96, h - 96);
    ctx.restore();
  }

  // Paper texture simulation
  if (frame.texture === 'paper') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
    for (let i = 0; i < 2500; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }
    ctx.restore();
  } else if (frame.texture === 'linen') {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  } else if (frame.texture === 'aged') {
    // Subtle edge tea stain / vignette on paper
    ctx.save();
    const radial = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.hypot(w, h) / 2);
    radial.addColorStop(0, 'rgba(0,0,0,0)');
    radial.addColorStop(1, 'rgba(120, 85, 45, 0.12)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Very subtle inner border bevel
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.restore();
}

function drawContactSheetSprockets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  // Film sprockets along top and bottom
  const holeW = 28;
  const holeH = 42;
  const spacing = 58;
  const marginY = 24;

  ctx.fillStyle = '#08090a';
  for (let x = 30; x < w - 30; x += spacing) {
    // Top sprocket hole
    drawRoundedRect(ctx, x, marginY, holeW, holeH, 6);
    ctx.fill();

    // Bottom sprocket hole
    drawRoundedRect(ctx, x, h - marginY - holeH, holeW, holeH, 6);
    ctx.fill();
  }

  // Analog film edge text
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 18px "Courier Prime", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('► KODAK 400TX  •  PHOTOJAH SAFETY FILM', 50, marginY + holeH + 24);
  ctx.textAlign = 'right';
  ctx.fillText('FRAME 1-4 • ISO 400 • ANALOG PROOF', w - 50, marginY + holeH + 24);

  ctx.restore();
}

function drawFilmNegativeSprockets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const holeW = 42;
  const holeH = 28;
  const spacing = 52;
  const marginX = 22;

  ctx.fillStyle = '#050608';
  for (let y = 30; y < h - 30; y += spacing) {
    // Left sprocket hole
    drawRoundedRect(ctx, marginX, y, holeW, holeH, 6);
    ctx.fill();

    // Right sprocket hole
    drawRoundedRect(ctx, w - marginX - holeW, y, holeW, holeH, 6);
    ctx.fill();
  }

  // Analog continuous edge text in vintage Kodak orange
  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 15px "Courier Prime", monospace';
  ctx.save();
  ctx.translate(marginX + holeW + 20, 320);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('► KODAK 400TX  •  PHOTOJAH SAFETY FILM  •  ISO 400', 0, 0);
  ctx.restore();

  ctx.restore();
}

/**
 * Render single photo onto its destination slot with adjustments and filters
 */
async function renderPhotoToSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  photo: CapturedPhoto,
  x: number,
  y: number,
  w: number,
  h: number,
  filterId: FilterId,
  filterIntensity: number,
  innerRadius: number = 0
) {
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.round(w);
  offscreen.height = Math.round(h);
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return;

  oCtx.imageSmoothingEnabled = true;
  oCtx.imageSmoothingQuality = 'high';

  // Source aspect ratio
  const srcW = img.naturalWidth || img.width || 600;
  const srcH = img.naturalHeight || img.height || 600;

  // Photo-level adjustments
  const adj = photo.adjustments;
  const rotation = adj.rotation || 0;
  const flipH = adj.flipH || false;

  oCtx.save();
  oCtx.translate(w / 2, h / 2);
  if (rotation !== 0) {
    oCtx.rotate((rotation * Math.PI) / 180);
  }
  if (flipH) {
    oCtx.scale(-1, 1);
  }

  // Calculate crop-to-fill scale
  const isRotated90 = rotation === 90 || rotation === 270;
  const effectiveSrcW = isRotated90 ? srcH : srcW;
  const effectiveSrcH = isRotated90 ? srcW : srcH;

  const scale = Math.max(w / effectiveSrcW, h / effectiveSrcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;

  oCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  oCtx.restore();

  // Apply photo adjustments (brightness, contrast, saturation, warmth, etc.)
  applyAdjustmentsToCanvas(oCtx, w, h, adj);

  // Apply chosen vintage filter
  applyFilterToCanvas(oCtx, w, h, filterId, filterIntensity);

  // Draw into main canvas with clip for inner radius
  ctx.save();
  if (innerRadius > 0) {
    drawRoundedRect(ctx, x, y, w, h, innerRadius);
    ctx.clip();
  }
  ctx.drawImage(offscreen, x, y, w, h);

  // Subtle inner shadow / photo recess line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1.5;
  if (innerRadius > 0) {
    drawRoundedRect(ctx, x, y, w, h, innerRadius);
    ctx.stroke();
  } else {
    ctx.strokeRect(x, y, w, h);
  }

  ctx.restore();
}

async function drawPhotosByFormat(
  ctx: CanvasRenderingContext2D,
  photos: CapturedPhoto[],
  images: HTMLImageElement[],
  formatId: FormatId,
  canvasW: number,
  canvasH: number,
  filterId: FilterId,
  filterIntensity: number,
  frame: FrameSettings
) {
  if (images.length === 0) return;

  const thicknessFactor = frame.borderThickness === 'compact' ? 0.75 : frame.borderThickness === 'wide' ? 1.3 : 1.0;
  const innerR = frame.innerRadius;

  switch (formatId) {
    case 'classic-polaroid': {
      // 1 square image
      const margin = 110 * thicknessFactor;
      const photoW = canvasW - margin * 2;
      const photoH = photoW; // 1:1
      const photoY = margin;
      await renderPhotoToSlot(ctx, images[0], photos[0], margin, photoY, photoW, photoH, filterId, filterIntensity, innerR);
      break;
    }

    case 'wide-polaroid': {
      // 1 landscape image (4:3)
      const margin = 110 * thicknessFactor;
      const photoW = canvasW - margin * 2;
      const photoH = photoW * 0.68;
      const photoY = margin;
      await renderPhotoToSlot(ctx, images[0], photos[0], margin, photoY, photoW, photoH, filterId, filterIntensity, innerR);
      break;
    }

    case 'tall-polaroid': {
      // 1 portrait image (3:4)
      const margin = 110 * thicknessFactor;
      const photoW = canvasW - margin * 2;
      const photoH = photoW * 1.25;
      const photoY = margin;
      await renderPhotoToSlot(ctx, images[0], photos[0], margin, photoY, photoW, photoH, filterId, filterIntensity, innerR);
      break;
    }

    case 'square-instant': {
      // 1 square image with balanced margins
      const margin = 120 * thicknessFactor;
      const photoW = canvasW - margin * 2;
      const photoH = photoW;
      const photoY = margin - 20;
      await renderPhotoToSlot(ctx, images[0], photos[0], margin, photoY, photoW, photoH, filterId, filterIntensity, innerR);
      break;
    }

    case 'three-photo-strip': {
      // 3 vertical stacked photos
      const marginX = 80 * thicknessFactor;
      const marginTop = 70 * thicknessFactor;
      const gutter = 36 * thicknessFactor;
      const photoW = canvasW - marginX * 2;
      const photoH = 680;

      for (let i = 0; i < 3; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const y = marginTop + i * (photoH + gutter);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], marginX, y, photoW, photoH, filterId, filterIntensity, innerR);
      }
      break;
    }

    case 'four-photo-strip': {
      // 4 vertical stacked photos
      const marginX = 75 * thicknessFactor;
      const marginTop = 65 * thicknessFactor;
      const gutter = 32 * thicknessFactor;
      const photoW = canvasW - marginX * 2;
      const photoH = 650;

      for (let i = 0; i < 4; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const y = marginTop + i * (photoH + gutter);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], marginX, y, photoW, photoH, filterId, filterIntensity, innerR);
      }
      break;
    }

    case 'four-photo-grid': {
      // 2x2 grid
      const marginX = 90 * thicknessFactor;
      const marginTop = 90 * thicknessFactor;
      const gutter = 30 * thicknessFactor;
      const photoW = (canvasW - marginX * 2 - gutter) / 2;
      const photoH = photoW;

      for (let i = 0; i < 4; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = marginX + col * (photoW + gutter);
        const y = marginTop + row * (photoH + gutter);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], x, y, photoW, photoH, filterId, filterIntensity, innerR);
      }
      break;
    }

    case 'vintage-collage': {
      // Layered instant photos with subtle rotations & shadows
      const count = Math.min(images.length, 4);
      const collageConfigs = [
        { x: 180, y: 160, w: 720, h: 720, rot: -4 },
        { x: 920, y: 220, w: 720, h: 720, rot: 3.5 },
        { x: 540, y: 560, w: 760, h: 760, rot: -1.2 },
        { x: 980, y: 640, w: 680, h: 680, rot: 4.8 },
      ];

      for (let i = 0; i < count; i++) {
        const cfg = collageConfigs[i];
        ctx.save();
        ctx.translate(cfg.x + cfg.w / 2, cfg.y + cfg.h / 2);
        ctx.rotate((cfg.rot * Math.PI) / 180);

        // Polaroid card behind photo
        const cardPad = 40;
        const cardBottom = 120;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 10;

        ctx.fillStyle = '#fdfbf7';
        ctx.fillRect(-cfg.w / 2 - cardPad, -cfg.h / 2 - cardPad, cfg.w + cardPad * 2, cfg.h + cardPad + cardBottom);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw photo inside card
        await renderPhotoToSlot(
          ctx,
          images[i],
          photos[i],
          -cfg.w / 2,
          -cfg.h / 2,
          cfg.w,
          cfg.h,
          filterId,
          filterIntensity,
          innerR
        );

        ctx.restore();
      }
      break;
    }

    case 'wide-booth-strip': {
      // 3 or 4 photos horizontally
      const count = Math.min(images.length, 4);
      const marginY = 80 * thicknessFactor;
      const marginX = 80 * thicknessFactor;
      const gutter = 36 * thicknessFactor;
      const photoH = canvasH - marginY * 2 - 120;
      const totalWidthForPhotos = canvasW - marginX * 2 - gutter * (count - 1);
      const photoW = totalWidthForPhotos / count;

      for (let i = 0; i < count; i++) {
        const x = marginX + i * (photoW + gutter);
        await renderPhotoToSlot(ctx, images[i], photos[i], x, marginY, photoW, photoH, filterId, filterIntensity, innerR);
      }
      break;
    }

    case 'mini-polaroid': {
      // Pocket instant photo
      const margin = 75 * thicknessFactor;
      const photoW = canvasW - margin * 2;
      const photoH = photoW * 1.33;
      await renderPhotoToSlot(ctx, images[0], photos[0], margin, margin, photoW, photoH, filterId, filterIntensity, innerR);
      break;
    }

    case 'double-polaroid': {
      // 2 photos side by side
      const marginY = 90 * thicknessFactor;
      const marginX = 90 * thicknessFactor;
      const gutter = 40 * thicknessFactor;
      const photoW = (canvasW - marginX * 2 - gutter) / 2;
      const photoH = photoW * 1.15;

      for (let i = 0; i < 2; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const x = marginX + i * (photoW + gutter);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], x, marginY, photoW, photoH, filterId, filterIntensity, innerR);
      }
      break;
    }

    case 'contact-sheet': {
      // 4 frames in 2x2 on film roll with frame markers
      const marginX = 140;
      const marginTop = 180;
      const gutterX = 80;
      const gutterY = 60;
      const count = Math.min(photos.length, 4);
      const photoW = (canvasW - marginX * 2 - gutterX) / 2;
      const photoH = (canvasH - marginTop - 220 - gutterY) / 2;

      for (let i = 0; i < 4; i++) {
        const imgIndex = i < count ? i : count - 1;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = marginX + col * (photoW + gutterX);
        const y = marginTop + row * (photoH + gutterY);

        // Frame number stamp
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 20px "Courier Prime", monospace';
        ctx.fillText(`FRAME #${i + 1}A`, x, y - 10);

        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], x, y, photoW, photoH, filterId, filterIntensity, innerR);
      }
      break;
    }

    case 'twin-strip': {
      // Two identical 3-photo strips side by side with dotted cut line down middle
      const marginX = 80;
      const marginTop = 70;
      const gutterY = 32;
      const stripW = (canvasW - marginX * 2 - 80) / 2; // ~780px
      const photoW = stripW - 80;
      const photoH = 640;

      // Draw Left Strip (Strip 1)
      for (let i = 0; i < 3; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const y = marginTop + i * (photoH + gutterY);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], marginX + 40, y, photoW, photoH, filterId, filterIntensity, innerR);
      }

      // Draw Right Strip (Strip 2 - Matching Twin)
      const rightStartX = canvasW / 2 + 40;
      for (let i = 0; i < 3; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const y = marginTop + i * (photoH + gutterY);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], rightStartX + 40, y, photoW, photoH, filterId, filterIntensity, innerR);
      }

      // Perforated Cut Line Down Middle
      ctx.save();
      ctx.setLineDash([16, 12]);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvasW / 2, 40);
      ctx.lineTo(canvasW / 2, canvasH - 40);
      ctx.stroke();

      // Scissors cutout mark in center
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✂ CUT HERE ✂', canvasW / 2, canvasH / 2);
      ctx.restore();
      break;
    }

    case 'passport-six': {
      // 6 passport photo stamps (3 rows x 2 cols)
      const marginX = 100;
      const marginTop = 90;
      const gutterX = 60;
      const gutterY = 40;
      const photoW = (canvasW - marginX * 2 - gutterX) / 2;
      const photoH = (canvasH - marginTop - 200 - gutterY * 2) / 3;

      for (let i = 0; i < 6; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = marginX + col * (photoW + gutterX);
        const y = marginTop + row * (photoH + gutterY);

        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], x, y, photoW, photoH, filterId, filterIntensity, 12);
      }

      // Official Archival Stamp Seal in lower-right
      ctx.save();
      const sealX = canvasW - 240;
      const sealY = canvasH - 95;
      ctx.strokeStyle = '#b91c1c';
      ctx.fillStyle = '#b91c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 13px "Courier Prime", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTOJAH ARCHIVE', sealX, sealY - 10);
      ctx.fillText('OFFICIAL PROOF', sealX, sealY + 8);
      ctx.fillText('★ 2026 ★', sealX, sealY + 24);
      ctx.restore();
      break;
    }

    case 'film-negative': {
      // 4 photos in vertical continuous film negative strip
      const marginX = 120;
      const marginTop = 70;
      const gutter = 36;
      const photoW = canvasW - marginX * 2;
      const photoH = 650;

      for (let i = 0; i < 4; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const y = marginTop + i * (photoH + gutter);

        // Frame edge orange numbers
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 20px "Courier Prime", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`► ${12 + i}`, marginX, y - 10);
        ctx.fillText(`${12 + i}A`, marginX + photoW - 40, y - 10);

        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], marginX, y, photoW, photoH, filterId, filterIntensity, 4);
      }
      break;
    }

    case 'wedding-guestbook': {
      // Double-matted keepsake card: Photo on top, signature space below
      const margin = 140;
      const photoW = canvasW - margin * 2;
      const photoH = 1150;
      const photoY = 130;

      await renderPhotoToSlot(ctx, images[0], photos[0], margin, photoY, photoW, photoH, filterId, filterIntensity, 8);

      // Signature lines below
      ctx.save();
      ctx.fillStyle = '#785b30';
      ctx.font = 'italic 600 24px "Playfair Display", serif';
      ctx.textAlign = 'center';
      ctx.fillText('~ With Love & Best Wishes ~', canvasW / 2, photoY + photoH + 110);

      ctx.strokeStyle = 'rgba(120, 91, 48, 0.35)';
      ctx.lineWidth = 1.5;
      const lineY1 = photoY + photoH + 210;
      const lineY2 = photoY + photoH + 340;
      const lineY3 = photoY + photoH + 470;
      ctx.beginPath();
      ctx.moveTo(220, lineY1);
      ctx.lineTo(canvasW - 220, lineY1);
      ctx.moveTo(220, lineY2);
      ctx.lineTo(canvasW - 220, lineY2);
      ctx.moveTo(220, lineY3);
      ctx.lineTo(canvasW - 220, lineY3);
      ctx.stroke();

      ctx.font = '14px "Courier Prime", monospace';
      ctx.fillStyle = 'rgba(120, 91, 48, 0.5)';
      ctx.fillText('SIGNATURES & GUEST NOTES', canvasW / 2, photoY + photoH + 530);
      ctx.restore();
      break;
    }

    case 'bookmark-strip': {
      // Slender bookmark strip with punch hole at top
      const marginX = 65;
      const marginTop = 180;
      const gutter = 32;
      const photoW = canvasW - marginX * 2;
      const photoH = 680;

      // Punch hole for ribbon tie
      ctx.save();
      const holeX = canvasW / 2;
      const holeY = 90;
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(holeX, holeY + 2, 28, 0, Math.PI * 2);
      ctx.fill();
      // Outer brass eyelet
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(holeX, holeY, 26, 0, Math.PI * 2);
      ctx.fill();
      // Inner hole cutout
      ctx.fillStyle = '#0e1f18';
      ctx.beginPath();
      ctx.arc(holeX, holeY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 3; i++) {
        const imgIndex = Math.min(i, images.length - 1);
        const y = marginTop + i * (photoH + gutter);
        await renderPhotoToSlot(ctx, images[imgIndex], photos[imgIndex], marginX, y, photoW, photoH, filterId, filterIntensity, 6);
      }
      break;
    }
  }
}

function drawCaptions(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  formatId: FormatId,
  cap: CaptionSettings,
  frame: FrameSettings
) {
  // If no text and no date/location, skip
  if (!cap.text && !cap.subtitle && !cap.showDate && !cap.showLocation) {
    return;
  }

  ctx.save();
  ctx.fillStyle = cap.color || '#2d3748';

  // Font family resolution
  let fontFamily = '"Caveat", cursive';
  if (cap.font === 'typewriter') {
    fontFamily = '"Courier Prime", Courier, monospace';
  } else if (cap.font === 'vintage') {
    fontFamily = '"Playfair Display", Georgia, serif';
  } else if (cap.font === 'script') {
    fontFamily = '"Homemade Apple", cursive';
  } else if (cap.font === 'sans') {
    fontFamily = '"Plus Jakarta Sans", system-ui, sans-serif';
  }

  // Base font size scaling
  const baseSize = cap.fontSize || 20;
  const scaledSize = Math.round(baseSize * 2.2);

  let targetY = h - 140;
  let targetX = w / 2;
  if (cap.align === 'left') {
    targetX = 120;
    ctx.textAlign = 'left';
  } else if (cap.align === 'right') {
    targetX = w - 120;
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = 'center';
  }

  // Specific format adjustments for caption baseline
  if (formatId === 'classic-polaroid') {
    targetY = h - 130;
  } else if (formatId === 'three-photo-strip' || formatId === 'four-photo-strip') {
    targetY = h - 110;
  } else if (formatId === 'wide-booth-strip') {
    targetY = h - 45;
  } else if (formatId === 'contact-sheet') {
    targetY = h - 60;
    ctx.fillStyle = '#d4af37'; // gold on contact sheet
  }

  // Primary Caption Text
  if (cap.text) {
    ctx.font = `600 ${scaledSize}px ${fontFamily}`;
    ctx.fillText(cap.text, targetX, targetY);
  }

  // Subtitle / Date / Location lines
  const secondaryParts: string[] = [];
  if (cap.subtitle) secondaryParts.push(cap.subtitle);
  if (cap.showDate && cap.dateText) secondaryParts.push(cap.dateText);
  if (cap.showLocation && cap.locationText) secondaryParts.push(`📍 ${cap.locationText}`);

  if (secondaryParts.length > 0) {
    const secondaryText = secondaryParts.join('  •  ');
    const subSize = Math.max(16, Math.round(scaledSize * 0.52));
    ctx.font = `400 ${subSize}px ${cap.font === 'typewriter' ? fontFamily : '"Courier Prime", monospace'}`;
    ctx.globalAlpha = 0.8;
    ctx.fillText(secondaryText, targetX, targetY + (cap.text ? scaledSize * 0.75 : 0));
  }

  ctx.restore();
}

function drawSignature(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  formatId: FormatId,
  frame: FrameSettings
) {
  ctx.save();
  const isDark = frame.colorId === 'black' || frame.colorId === 'forest-green' || formatId === 'contact-sheet';
  ctx.fillStyle = isDark ? 'rgba(212, 175, 55, 0.75)' : 'rgba(100, 100, 100, 0.45)';
  ctx.font = '600 13px "Courier Prime", monospace';
  ctx.textAlign = 'right';

  const sigY = formatId === 'wide-booth-strip' ? h - 16 : h - 28;
  const sigX = w - 60;
  ctx.fillText('PHOTOJAH ✦ INSTANT', sigX, sigY);
  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Download helper
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.95
) {
  const dataUrl = canvas.toDataURL(type, quality);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
