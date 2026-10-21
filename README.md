# Photojah — Vintage Photo Booth PWA

> **Capture. Create. Keep.** • *Turn moments into memories.*

Photojah is a complete, production-grade vintage photo booth Progressive Web App (PWA). It brings the tactile charm and nostalgia of analog cameras, instant film, and retro carnival photo booths directly to modern web browsers, with a focus on Android phones and tablets, iOS Safari devices, and desktop screens.

---

## ✦ Key Features

### 1. Authentic Brand & Design Identity
- **Palette**: Deep forest green (`#0e1f18`, `#142e23`), warm ivory & cream (`#fbf8f1`, `#f4eee2`), muted antique gold (`#d4af37`), and darkroom charcoal.
- **Typography**: Editorial vintage serifs (*Playfair Display*, *Cinzel*), authentic handwritten pen scripts (*Caveat*, *Homemade Apple*), and classic mechanical typewriter lettering (*Courier Prime*).
- **Interactive Welcome Screen**: Live sample Polaroid fan that cycles analog presets, quick-start booths, gallery status, and in-app PWA install trigger.

### 2. Real Browser Camera Integration
- **Direct Hardware Access**: Leverages the browser `MediaDevices` and `getUserMedia` APIs.
- **Camera Selection**: Toggle seamlessly between front (selfie) and rear cameras.
- **Timer & Countdown**: Configurable timers (Off, 3s, 5s, 10s) with synthesized audio ticks and an animated full-screen countdown overlay.
- **Mechanical Shutter & Motor Audio**: Web Audio API synthesis produces authentic dual-click mechanical camera snaps and instant film ejection whirrs without external audio files.
- **Multi-Photo Sessions**: Sequential shooting (e.g. shots 1 to 4) with progress indicators, retakes, and device upload fallbacks.

### 3. 15 Vintage Film Stocks & Filters
1. **Original**: Pristine capture with zero alteration.
2. **Classic Polaroid**: Warm highlights, lifted shadows, and gentle contrast.
3. **Vintage Warm**: Rich amber and honey tones with softened blues.
4. **Sepia Tone**: Traditional 19th-century brown monochrome.
5. **Black & White**: Balanced silver halide panchromatic film with punchy contrast.
6. **Faded Film**: Lifted black floor, lowered contrast, and sunbleached saturation.
7. **1970s Film**: Warm yellows, muted forest greens, and analog print aesthetics.
8. **1990s Disposable**: Flash-lit contrast and saturated reds and blues.
9. **Cool Film**: Nordic cyan shadows and restrained saturation.
10. **Soft Dream**: Ethereal highlight bloom and gentle contrast.
11. **Instant Camera**: 1980s instant-film colorpack rendering with organic corner falloff.
12. **Film Grain**: Silver halide ISO 800 organic grain texture.
13. **Golden Hour**: Luminous late-afternoon dusk sunlight.
14. **Retro Fade**: Washed-out pastels and elevated blacks.
15. **Cinematic Vintage**: Refined Kodachrome teal-and-orange balance.
- *Includes a live intensity slider (0% to 100%) applied directly to exported pixels.*

### 4. 12 Polaroid & Booth Formats
- **A. Classic Polaroid**: 1:1 square image window with traditional wide caption chin.
- **B. Wide Polaroid**: 4:3 landscape instant film for group and scenic captures.
- **C. Tall Polaroid**: 3:4 vertical editorial portrait format.
- **D. Square Instant**: Uniform symmetrical border.
- **E. Three-Photo Strip**: Classic carnival 2×6" vertical booth strip.
- **F. Four-Photo Strip**: Traditional 4-cut photobooth strip.
- **G. Four-Photo Grid**: 2×2 quadrant layout.
- **H. Vintage Collage**: Artfully layered instant photos with organic angles and paper drop shadows.
- **I. Wide Strip**: Horizontal sequence for panoramic prints.
- **J. Mini Polaroid**: Instax pocket / wallet-sized instant photo.
- **K. Double Polaroid**: Two-photo companion layout.
- **L. Film Contact Sheet**: Darkroom proof sheet with 35mm sprockets and frame numbers.

### 5. Non-Destructive Photo Tuning
- Rotate 90° clockwise and counter-clockwise.
- Horizontal flip (mirroring).
- Fine exposure adjustments: Brightness, Contrast, Saturation, Warmth, Vignette falloff, and Film Grain.
- Reset to original at any time.

### 6. Frame & Caption Customization
- **Frame Colors**: Classic White, Warm Cream, Darkroom Black, Kraft Paper, Pastel Rose, Muted Sage, Forest Green.
- **Paper Textures**: Smooth, Matte Paper, Linen weave, and Aged vintage edge toning.
- **Captions**: Custom text, subtitles, automatic date stamps, and location stamps.
- **Discreet Photojah Signature**: Toggleable watermark on the lower frame margin.

### 7. High-Resolution Print Export & Sharing
- High-density rendering (~1800–3200px, 300 DPI print equivalent).
- Lossless PNG and compressed JPEG downloads.
- Native Web Share API integration with automatic download fallback.
- Dedicated browser Print dialog integration.

### 8. Private Local Gallery (IndexedDB)
- Automatically or manually save creations to browser IndexedDB storage.
- Re-download, preview in high resolution, or delete individual items.
- Live storage usage meter.
- 100% private: zero cloud uploads or tracking.

### 9. Progressive Web App (PWA)
- Full Web App Manifest with standalone display mode.
- Service worker asset caching with offline mode fallback.
- In-app install button with native prompt and iOS Safari instructions.

---

## ✦ Getting Started Locally

### Prerequisites
- Node.js 18+ (tested with Node 20 / 22)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

### Production Build
```bash
# Compile and bundle
npm run build

# Preview production build
npm run preview
```

---

## ✦ PWA Installation Guide

### On Android (Chrome / Brave / Edge)
1. Open Photojah in your mobile browser.
2. Tap the **Install App** button in the top navigation or welcome screen.
3. Confirm the installation in the browser prompt.
4. Photojah will now appear as an icon on your home screen and run in standalone fullscreen mode.

### On iOS (Safari on iPhone / iPad)
1. Open Photojah in Safari.
2. Tap the **Share** button (box with upward arrow) in the Safari toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the upper right.

---

## ✦ Testing Camera Access

- **Secure Context Requirement**: Modern browsers enforce that `navigator.mediaDevices.getUserMedia` is only accessible over HTTPS or `http://localhost`.
- **Permissions**: When prompted, grant camera permission. You can switch between front and rear cameras at any time using the flip icon.
- **Fallback**: If running in an environment without hardware cameras or if camera access is denied, use the upload button to load photographs from your photo library.
