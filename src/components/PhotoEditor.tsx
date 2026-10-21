import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Sun,
  Contrast,
  Palette,
  Flame,
  CircleDot,
  Sparkles,
  Check,
  X,
  Crop as CropIcon,
} from 'lucide-react';
import { CapturedPhoto, PhotoAdjustments } from '../types';
import { applyAdjustmentsToCanvas } from '../utils/filters';

interface Props {
  photo: CapturedPhoto;
  photoIndex: number;
  onSave: (updatedAdjustments: PhotoAdjustments) => void;
  onClose: () => void;
}

export const PhotoEditor: React.FC<Props> = ({
  photo,
  photoIndex,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [adj, setAdj] = useState<PhotoAdjustments>({
    brightness: photo.adjustments.brightness || 0,
    contrast: photo.adjustments.contrast || 0,
    saturation: photo.adjustments.saturation || 0,
    warmth: photo.adjustments.warmth || 0,
    vignette: photo.adjustments.vignette || 0,
    grain: photo.adjustments.grain || 0,
    rotation: photo.adjustments.rotation || 0,
    flipH: photo.adjustments.flipH || false,
    crop: photo.adjustments.crop,
  });

  const [activeTab, setActiveTab] = useState<'adjust' | 'transform'>('adjust');

  // Render live preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const isRotated90 = adj.rotation === 90 || adj.rotation === 270;
      const targetW = isRotated90 ? img.height : img.width;
      const targetH = isRotated90 ? img.width : img.height;

      // Fit preview into canvas max 800px
      const maxDim = 800;
      const scale = Math.min(maxDim / targetW, maxDim / targetH, 1.0);
      const w = Math.round(targetW * scale);
      const h = Math.round(targetH * scale);

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);

      if (adj.rotation !== 0) {
        ctx.rotate((adj.rotation * Math.PI) / 180);
      }
      if (adj.flipH) {
        ctx.scale(-1, 1);
      }

      const drawW = isRotated90 ? h : w;
      const drawH = isRotated90 ? w : h;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Apply adjustment values
      applyAdjustmentsToCanvas(ctx, w, h, adj);
    };
    img.src = photo.originalDataUrl;
  }, [photo.originalDataUrl, adj]);

  const handleReset = () => {
    setAdj({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      vignette: 0,
      grain: 0,
      rotation: 0,
      flipH: false,
    });
  };

  const rotateCW = () => {
    setAdj((prev) => ({
      ...prev,
      rotation: ((prev.rotation + 90) % 360) as 0 | 90 | 180 | 270,
    }));
  };

  const rotateCCW = () => {
    setAdj((prev) => ({
      ...prev,
      rotation: ((prev.rotation + 270) % 360) as 0 | 90 | 180 | 270,
    }));
  };

  const toggleFlip = () => {
    setAdj((prev) => ({ ...prev, flipH: !prev.flipH }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a1712]/95 backdrop-blur-md flex flex-col justify-between text-[#fbf8f1] select-none">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#0e1f18]/80">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-white/80"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <div className="text-center">
          <h3 className="text-sm font-bold text-[#fbf8f1]">
            Tune Shot #{photoIndex + 1}
          </h3>
          <p className="text-[10px] text-[#d4af37]">Non-Destructive Adjustments</p>
        </div>

        <button
          onClick={() => onSave(adj)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Check className="w-4 h-4" />
          <span>Apply</span>
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-full max-h-[55vh] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black/80 flex items-center justify-center">
          <canvas ref={canvasRef} className="max-w-full max-h-[55vh] object-contain" />
        </div>
      </div>

      {/* Bottom Editor Controls Panel */}
      <div className="bg-[#142e23] border-t border-white/10 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-4">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'adjust'
                  ? 'bg-[#d4af37] text-[#0e1f18]'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              Exposure & Tone
            </button>
            <button
              onClick={() => setActiveTab('transform')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'transform'
                  ? 'bg-[#d4af37] text-[#0e1f18]'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              Rotate & Flip
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#d4af37] hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Tab 1: Sliders for Exposure, Contrast, Warmth, Grain, Vignette */}
        {activeTab === 'adjust' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-48 overflow-y-auto pr-1">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Sun className="w-3.5 h-3.5 text-[#d4af37]" /> Brightness
                </span>
                <span className="text-white/50">{adj.brightness}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adj.brightness}
                onChange={(e) => setAdj({ ...adj, brightness: Number(e.target.value) })}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Contrast className="w-3.5 h-3.5 text-[#d4af37]" /> Contrast
                </span>
                <span className="text-white/50">{adj.contrast}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adj.contrast}
                onChange={(e) => setAdj({ ...adj, contrast: Number(e.target.value) })}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Palette className="w-3.5 h-3.5 text-[#d4af37]" /> Saturation
                </span>
                <span className="text-white/50">{adj.saturation}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adj.saturation}
                onChange={(e) => setAdj({ ...adj, saturation: Number(e.target.value) })}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Warmth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Flame className="w-3.5 h-3.5 text-[#d4af37]" /> Warmth / Amber
                </span>
                <span className="text-white/50">{adj.warmth}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={adj.warmth}
                onChange={(e) => setAdj({ ...adj, warmth: Number(e.target.value) })}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <CircleDot className="w-3.5 h-3.5 text-[#d4af37]" /> Vignette Falloff
                </span>
                <span className="text-white/50">{adj.vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adj.vignette}
                onChange={(e) => setAdj({ ...adj, vignette: Number(e.target.value) })}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Film Grain */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Film Grain
                </span>
                <span className="text-white/50">{adj.grain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adj.grain}
                onChange={(e) => setAdj({ ...adj, grain: Number(e.target.value) })}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Orientation Tools */}
        {activeTab === 'transform' && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-2">
            <button
              onClick={rotateCCW}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b3d30] border border-white/10 hover:border-[#d4af37]/60 text-xs font-semibold hover:bg-[#234d3d] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#d4af37]" />
              <span>Rotate 90° CCW</span>
            </button>

            <button
              onClick={rotateCW}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b3d30] border border-white/10 hover:border-[#d4af37]/60 text-xs font-semibold hover:bg-[#234d3d] transition cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-[#d4af37]" />
              <span>Rotate 90° CW</span>
            </button>

            <button
              onClick={toggleFlip}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                adj.flipH
                  ? 'bg-[#d4af37] text-[#0e1f18] border-[#d4af37]'
                  : 'bg-[#1b3d30] border-white/10 text-white hover:border-[#d4af37]/60'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
              <span>Flip Horizontal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
