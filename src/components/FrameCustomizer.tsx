import React from 'react';
import { Palette, Box, Layers, ShieldCheck, Check } from 'lucide-react';
import { FrameColorId, FrameSettings, PaperTexture } from '../types';

interface Props {
  settings: FrameSettings;
  onChange: (updated: FrameSettings) => void;
}

const FRAME_COLORS: { id: FrameColorId; name: string; hex: string; textDark: boolean }[] = [
  { id: 'classic-white', name: 'Classic White', hex: '#ffffff', textDark: true },
  { id: 'warm-cream', name: 'Warm Cream', hex: '#f7f3e9', textDark: true },
  { id: 'black', name: 'Darkroom Black', hex: '#1c1b1a', textDark: false },
  { id: 'kraft', name: 'Kraft Paper', hex: '#d6b995', textDark: true },
  { id: 'pastel-pink', name: 'Pastel Rose', hex: '#f4d8d8', textDark: true },
  { id: 'sage-green', name: 'Muted Sage', hex: '#c6d4c5', textDark: true },
  { id: 'forest-green', name: 'Forest Green', hex: '#162e24', textDark: false },
];

export const FrameCustomizer: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="space-y-4 text-xs text-white/90">
      {/* Frame Color Selection */}
      <div className="space-y-2">
        <label className="font-bold text-[#fbf8f1] flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Paper Frame Color</span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {FRAME_COLORS.map((col) => {
            const isSelected = settings.colorId === col.id;
            return (
              <button
                key={col.id}
                onClick={() =>
                  onChange({
                    ...settings,
                    colorId: col.id,
                    colorHex: col.hex,
                  })
                }
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-[#d4af37] ring-2 ring-[#d4af37]/60 bg-[#1b3d30]'
                    : 'border-white/10 bg-[#142e23] hover:border-white/30'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-black/20 shadow-xs flex items-center justify-center"
                  style={{ backgroundColor: col.hex }}
                >
                  {isSelected && (
                    <Check
                      className={`w-2.5 h-2.5 ${
                        col.textDark ? 'text-black' : 'text-white'
                      }`}
                    />
                  )}
                </div>
                <span className="font-semibold text-white/90">{col.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Border Width & Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="space-y-2">
          <label className="font-bold text-[#fbf8f1] flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Border Margins</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['compact', 'standard', 'wide'] as const).map((width) => (
              <button
                key={width}
                onClick={() => onChange({ ...settings, borderThickness: width })}
                className={`py-2 rounded-xl text-center capitalize font-semibold transition cursor-pointer border ${
                  settings.borderThickness === width
                    ? 'bg-[#d4af37] text-[#0e1f18] border-[#d4af37]'
                    : 'bg-[#142e23] border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {width}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Texture */}
        <div className="space-y-2">
          <label className="font-bold text-[#fbf8f1] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Paper Texture</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['smooth', 'paper', 'linen', 'aged'] as const).map((tex) => (
              <button
                key={tex}
                onClick={() => onChange({ ...settings, texture: tex })}
                className={`py-2 rounded-xl text-center capitalize font-semibold transition cursor-pointer border ${
                  settings.texture === tex
                    ? 'bg-[#d4af37] text-[#0e1f18] border-[#d4af37]'
                    : 'bg-[#142e23] border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {tex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggles: Signature & Inner Radius */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Inner Corner Radius */}
        <div className="p-3 rounded-2xl bg-[#142e23] border border-white/10 space-y-1.5">
          <div className="flex justify-between font-bold">
            <span className="text-[#fbf8f1]">Inner Photo Corners</span>
            <span className="text-[#d4af37]">{settings.innerRadius === 0 ? 'Sharp 90°' : `${settings.innerRadius}px`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="2"
            value={settings.innerRadius}
            onChange={(e) => onChange({ ...settings, innerRadius: Number(e.target.value) })}
            className="w-full accent-[#d4af37] cursor-pointer"
          />
        </div>

        {/* Discreet Photojah Signature Toggle */}
        <div className="p-3 rounded-2xl bg-[#142e23] border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-bold text-[#fbf8f1]">Photojah Signature</p>
            <p className="text-[10px] text-white/50">Discreet watermark at frame footer</p>
          </div>
          <button
            onClick={() => onChange({ ...settings, showSignature: !settings.showSignature })}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.showSignature ? 'bg-[#d4af37]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                settings.showSignature ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
