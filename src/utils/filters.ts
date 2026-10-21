import { FilterDefinition, FilterId } from '../types';

export const VINTAGE_FILTERS: FilterDefinition[] = [
  {
    id: 'original',
    name: 'Original',
    subtitle: 'Natural Light',
    description: 'Preserve photograph without any added effects or color altering.',
    category: 'classic',
    sampleColor: '#94a3b8',
  },
  {
    id: 'classic-polaroid',
    name: 'Classic Polaroid',
    subtitle: 'Warm Instant Film',
    description: 'Iconic instant film look with creamy warm highlights, lifted shadows, and gentle contrast.',
    category: 'classic',
    sampleColor: '#e0c097',
  },
  {
    id: 'vintage-warm',
    name: 'Vintage Warm',
    subtitle: 'Amber & Honey',
    description: 'Warm amber tones, softened blues, and cozy golden nostalgic character.',
    category: 'warm',
    sampleColor: '#d97706',
  },
  {
    id: 'sepia',
    name: 'Sepia Tone',
    subtitle: '19th Century Archive',
    description: 'Traditional brown monochrome reminiscent of heirloom darkroom prints.',
    category: 'monochrome',
    sampleColor: '#854d0e',
  },
  {
    id: 'bw',
    name: 'Black & White',
    subtitle: 'Silver Halide',
    description: 'Classic monochrome conversion with balanced contrast and crisp tonality.',
    category: 'monochrome',
    sampleColor: '#475569',
  },
  {
    id: 'faded-film',
    name: 'Faded Film',
    subtitle: 'Matte Sunbleached',
    description: 'Lifted black point, reduced overall contrast, and soft muted color saturation.',
    category: 'retro',
    sampleColor: '#a8a29e',
  },
  {
    id: 'seventies',
    name: '1970s Film',
    subtitle: 'Warm Super 8',
    description: 'Warm yellows, muted forest greens, and soft analog magazine aesthetics.',
    category: 'retro',
    sampleColor: '#b45309',
  },
  {
    id: 'nineties-disposable',
    name: '1990s Disposable',
    subtitle: 'Flash & Punch',
    description: 'Punchy flash contrast, vivid reds and blues, with nostalgic analog grit.',
    category: 'retro',
    sampleColor: '#dc2626',
  },
  {
    id: 'cool-film',
    name: 'Cool Film',
    subtitle: 'Nordic Cyan',
    description: 'Cool cyan shadows, crisp neutral midtones, and restrained saturation.',
    category: 'moody',
    sampleColor: '#0284c7',
  },
  {
    id: 'soft-dream',
    name: 'Soft Dream',
    subtitle: 'Diffusion Bloom',
    description: 'Gentle low contrast with dreamy glowing highlights and ethereal softness.',
    category: 'moody',
    sampleColor: '#f472b6',
  },
  {
    id: 'instant-camera',
    name: 'Instant Camera',
    subtitle: 'Colorpack 80s',
    description: 'Warm color balance, organic vignette, and quintessential instant film tone.',
    category: 'classic',
    sampleColor: '#ca8a04',
  },
  {
    id: 'film-grain',
    name: 'Film Grain',
    subtitle: 'ISO 800 Texture',
    description: 'Authentic organic silver halide grain with preserved original color fidelity.',
    category: 'classic',
    sampleColor: '#78716c',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    subtitle: 'Dusk Sunlight',
    description: 'Luminous late-afternoon golden highlights and warm radiant amber shadows.',
    category: 'warm',
    sampleColor: '#f59e0b',
  },
  {
    id: 'retro-fade',
    name: 'Retro Fade',
    subtitle: 'Pastel Nostalgia',
    description: 'Washed out pastels, elevated shadows, and gentle vintage decay.',
    category: 'retro',
    sampleColor: '#c084fc',
  },
  {
    id: 'cinematic-vintage',
    name: 'Cinematic Vintage',
    subtitle: 'Kodachrome Harmony',
    description: 'Refined cinematic contrast, teal shadows, and warm film-grade highlights.',
    category: 'moody',
    sampleColor: '#0f766e',
  },
];

/**
 * Apply the selected vintage filter + intensity to a canvas 2D context
 */
export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterId: FilterId,
  intensityPercent: number = 100
) {
  if (filterId === 'original' || intensityPercent <= 0) {
    return;
  }

  const factor = Math.max(0, Math.min(100, intensityPercent)) / 100;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  // Pixel transformation loop
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let targetR = r;
    let targetG = g;
    let targetB = b;

    switch (filterId) {
      case 'classic-polaroid': {
        // Lift blacks, boost warm highlights, gentle contrast
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        targetR = Math.min(255, (r * 1.08 + lum * 0.1) * 1.05 + 18);
        targetG = Math.min(255, (g * 1.02 + lum * 0.08) * 1.02 + 12);
        targetB = Math.max(0, (b * 0.88 + lum * 0.05) * 0.95 + 8);
        break;
      }
      case 'vintage-warm': {
        // Rich amber/golden tone
        targetR = Math.min(255, r * 1.15 + 22);
        targetG = Math.min(255, g * 1.04 + 10);
        targetB = Math.max(0, b * 0.82 - 5);
        break;
      }
      case 'sepia': {
        // Classic photographic sepia
        targetR = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189 + 15);
        targetG = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168 + 10);
        targetB = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        break;
      }
      case 'bw': {
        // Balanced panchromatic black & white
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        // Subtle S-curve contrast
        const norm = lum / 255;
        const curved = (Math.sin((norm - 0.5) * Math.PI) * 0.5 + 0.5) * 255;
        targetR = curved;
        targetG = curved;
        targetB = curved;
        break;
      }
      case 'faded-film': {
        // Lifted darks (faded floor), reduced saturation
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const desatR = r * 0.7 + lum * 0.3;
        const desatG = g * 0.7 + lum * 0.3;
        const desatB = b * 0.7 + lum * 0.3;
        targetR = Math.min(255, desatR * 0.85 + 35);
        targetG = Math.min(255, desatG * 0.85 + 32);
        targetB = Math.min(255, desatB * 0.85 + 34);
        break;
      }
      case 'seventies': {
        // 1970s Kodak look: yellow warmth, muted greens
        targetR = Math.min(255, r * 1.12 + 15);
        targetG = Math.min(255, g * 0.96 + 8);
        targetB = Math.max(0, b * 0.78 + 4);
        break;
      }
      case 'nineties-disposable': {
        // Punchy flash contrast, saturated colors
        const contrast = 1.25;
        targetR = Math.min(255, Math.max(0, (r - 128) * contrast + 138));
        targetG = Math.min(255, Math.max(0, (g - 128) * (contrast * 0.95) + 128));
        targetB = Math.min(255, Math.max(0, (b - 128) * (contrast * 1.05) + 120));
        break;
      }
      case 'cool-film': {
        // Cyan-blue cold shadows
        targetR = Math.max(0, r * 0.88 - 5);
        targetG = Math.min(255, g * 0.98 + 4);
        targetB = Math.min(255, b * 1.18 + 18);
        break;
      }
      case 'soft-dream': {
        // Soft bloom feel
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        targetR = Math.min(255, r * 0.88 + lum * 0.18 + 15);
        targetG = Math.min(255, g * 0.88 + lum * 0.16 + 15);
        targetB = Math.min(255, b * 0.85 + lum * 0.2 + 20);
        break;
      }
      case 'instant-camera': {
        // Rich instant tone with vintage shift
        targetR = Math.min(255, r * 1.06 + 14);
        targetG = Math.min(255, g * 1.02 + 8);
        targetB = Math.max(0, b * 0.9 - 2);
        break;
      }
      case 'film-grain': {
        // Only grain will be drawn after pixel loop
        targetR = r;
        targetG = g;
        targetB = b;
        break;
      }
      case 'golden-hour': {
        // Sunset golden glow
        targetR = Math.min(255, r * 1.22 + 25);
        targetG = Math.min(255, g * 1.08 + 15);
        targetB = Math.max(0, b * 0.74 - 8);
        break;
      }
      case 'retro-fade': {
        // Pastel lavender-warm fade
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        targetR = Math.min(255, (r * 0.75 + lum * 0.25) * 0.9 + 28);
        targetG = Math.min(255, (g * 0.75 + lum * 0.25) * 0.88 + 22);
        targetB = Math.min(255, (b * 0.75 + lum * 0.25) * 0.95 + 32);
        break;
      }
      case 'cinematic-vintage': {
        // Teal & Orange filmic grade
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (lum > 0.5) {
          // Warm highlights
          targetR = Math.min(255, r * 1.1 + 10);
          targetG = Math.min(255, g * 1.02);
          targetB = Math.max(0, b * 0.9 - 8);
        } else {
          // Teal shadows
          targetR = Math.max(0, r * 0.88);
          targetG = Math.min(255, g * 1.05 + 5);
          targetB = Math.min(255, b * 1.14 + 12);
        }
        break;
      }
    }

    // Blend between original and target based on factor
    data[i] = Math.round(r + (targetR - r) * factor);
    data[i + 1] = Math.round(g + (targetG - g) * factor);
    data[i + 2] = Math.round(b + (targetB - b) * factor);
  }

  ctx.putImageData(imgData, 0, 0);

  // Apply analog texture overlays (Film grain, soft vignette) where appropriate
  if (filterId === 'film-grain' || filterId === 'instant-camera' || filterId === 'nineties-disposable' || filterId === 'seventies') {
    applyGrainOverlay(ctx, width, height, factor * (filterId === 'film-grain' ? 0.35 : 0.18));
  }

  if (filterId === 'instant-camera' || filterId === 'cinematic-vintage' || filterId === 'vintage-warm') {
    applyVignetteOverlay(ctx, width, height, factor * 0.35);
  }
}

/**
 * Procedural Film Grain Overlay
 */
export function applyGrainOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number = 0.2
) {
  if (amount <= 0) return;
  const grainCanvas = document.createElement('canvas');
  const grainW = Math.min(400, width);
  const grainH = Math.min(400, height);
  grainCanvas.width = grainW;
  grainCanvas.height = grainH;
  const gCtx = grainCanvas.getContext('2d');
  if (!gCtx) return;

  const gData = gCtx.createImageData(grainW, grainH);
  const buf = gData.data;
  const total = buf.length;
  for (let i = 0; i < total; i += 4) {
    const val = Math.floor(Math.random() * 255);
    buf[i] = val;
    buf[i + 1] = val;
    buf[i + 2] = val;
    buf[i + 3] = Math.floor(val * amount * 0.45);
  }
  gCtx.putImageData(gData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCanvas, 0, 0, width, height);
  ctx.restore();
}

/**
 * Smooth Vignette Overlay
 */
export function applyVignetteOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.35
) {
  if (intensity <= 0) return;
  ctx.save();
  const radius = Math.hypot(width, height) / 2;
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    radius * 0.45,
    width / 2,
    height / 2,
    radius * 1.05
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, `rgba(18, 12, 8, ${Math.min(0.85, intensity)})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Apply general photo adjustments (brightness, contrast, saturation, warmth, etc.)
 */
export function applyAdjustmentsToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adj: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    vignette: number;
    grain: number;
  }
) {
  const { brightness, contrast, saturation, warmth, vignette, grain } = adj;
  const hasAdjustments =
    brightness !== 0 || contrast !== 0 || saturation !== 0 || warmth !== 0;

  if (hasAdjustments) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    // Contrast factor
    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    // Warmth shifts
    const rShift = warmth * 0.5;
    const bShift = -warmth * 0.5;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (brightness !== 0) {
        r = Math.min(255, Math.max(0, r + brightness * 1.5));
        g = Math.min(255, Math.max(0, g + brightness * 1.5));
        b = Math.min(255, Math.max(0, b + brightness * 1.5));
      }

      // Contrast
      if (contrast !== 0) {
        r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
      }

      // Saturation
      if (saturation !== 0) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const satMult = 1 + saturation / 50;
        r = Math.min(255, Math.max(0, lum + (r - lum) * satMult));
        g = Math.min(255, Math.max(0, lum + (g - lum) * satMult));
        b = Math.min(255, Math.max(0, lum + (b - lum) * satMult));
      }

      // Warmth
      if (warmth !== 0) {
        r = Math.min(255, Math.max(0, r + rShift));
        b = Math.min(255, Math.max(0, b + bShift));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Vignette
  if (vignette > 0) {
    applyVignetteOverlay(ctx, width, height, (vignette / 100) * 0.7);
  }

  // Grain
  if (grain > 0) {
    applyGrainOverlay(ctx, width, height, (grain / 100) * 0.4);
  }
}
