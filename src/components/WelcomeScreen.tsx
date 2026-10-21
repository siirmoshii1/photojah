import React, { useState } from 'react';
import {
  Camera,
  Film,
  Sparkles,
  Sliders,
  Images,
  ShieldCheck,
  ChevronRight,
  Layers,
  Heart,
  RotateCw,
} from 'lucide-react';
import { FormatId } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  onStartSession: (formatId?: FormatId, isBurst?: boolean) => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
  savedCount: number;
}

export const WelcomeScreen: React.FC<Props> = ({
  onStartSession,
  onOpenGallery,
  onOpenSettings,
  savedCount,
}) => {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);

  // Sample cards for interactive fan preview
  const sampleCards = [
    {
      title: 'Summer Solstice',
      date: 'OCTOBER 2026',
      filter: 'Classic Polaroid',
      color: '#fbf8f1',
      bgImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      rot: -4,
    },
    {
      title: 'Carnival Booth 4-Cut',
      date: 'SANTA MONICA PIER',
      filter: '1990s Disposable',
      color: '#f4eee2',
      bgImg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
      rot: 2,
    },
    {
      title: 'Golden Hour Smile',
      date: 'CAFÉ DE FLORE',
      filter: 'Golden Hour Film',
      color: '#fbf8f1',
      bgImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
      rot: -1.5,
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0e1f18] via-[#122b22] to-[#0a1712] text-[#fbf8f1] px-4 py-6 sm:px-8 sm:py-8 overflow-hidden select-none">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#1b3d30]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between pt-1 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b3d30] border border-[#d4af37]/40 flex items-center justify-center shadow-lg shadow-black/40">
            <Camera className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl tracking-wider text-[#fbf8f1] leading-none">
              PHOTOJAH
            </h1>
            <p className="font-serif-vintage italic text-[11px] text-[#d4af37]/90 tracking-wide">
              Vintage Photo Booth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedCount > 0 && (
            <button
              onClick={onOpenGallery}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142e23] border border-[#d4af37]/30 text-xs font-semibold text-[#fbf8f1] hover:bg-[#1b3d30] transition cursor-pointer"
              title="View your saved Polaroids"
            >
              <Images className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Gallery ({savedCount})</span>
            </button>
          )}

          <PWAInstallButton variant="compact" />

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#142e23] border border-white/10 text-white/80 hover:text-white hover:bg-[#1b3d30] transition cursor-pointer"
            title="Settings & Privacy"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Hero Body */}
      <main className="relative z-10 w-full max-w-4xl mx-auto my-auto py-4 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
        {/* Left: Branding & Value Proposition */}
        <div className="flex-1 text-center lg:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b3d30]/70 border border-[#d4af37]/30 text-xs font-medium text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analog Film Magic • True Instant Prints</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-vintage font-bold tracking-tight text-[#fbf8f1] leading-[1.15]">
              Capture. Create. Keep.
            </h2>
            <p className="text-base sm:text-lg text-[#fbf8f1]/80 font-normal max-w-lg mx-auto lg:mx-0">
              Turn moments into memories. Step into our vintage booth, apply 15 authentic film stocks, customize Polaroid frames, and export high-res prints.
            </p>
          </div>

          {/* Quick-Start Formats */}
          {/* Quick-Start Formats */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                Select a Booth Mode
              </p>
              <span className="text-[10px] text-white/50">17 Authentic Layouts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto lg:mx-0">
              {/* Row 1 */}
              <button
                onClick={() => onStartSession('classic-polaroid')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-8 h-9 border-2 border-white/70 rounded-xs mb-1.5 flex flex-col justify-between p-0.5 group-hover:border-[#d4af37] transition">
                  <div className="w-full h-5 bg-white/20 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">Classic</span>
                <span className="text-[9px] text-white/50">1 Photo</span>
              </button>

              <button
                onClick={() => onStartSession('three-photo-strip')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-5 h-9 border-2 border-white/70 rounded-xs mb-1.5 flex flex-col justify-between p-0.5 gap-0.5 group-hover:border-[#d4af37] transition">
                  <div className="w-full h-2 bg-white/20 rounded-xs" />
                  <div className="w-full h-2 bg-white/20 rounded-xs" />
                  <div className="w-full h-2 bg-white/20 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">3-Strip</span>
                <span className="text-[9px] text-white/50">Carnival 2×6"</span>
              </button>

              <button
                onClick={() => onStartSession('four-photo-strip')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-5 h-9 border-2 border-white/70 rounded-xs mb-1.5 flex flex-col justify-between p-0.5 gap-0.5 group-hover:border-[#d4af37] transition">
                  <div className="w-full h-1.5 bg-white/20 rounded-xs" />
                  <div className="w-full h-1.5 bg-white/20 rounded-xs" />
                  <div className="w-full h-1.5 bg-white/20 rounded-xs" />
                  <div className="w-full h-1.5 bg-white/20 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">4-Strip</span>
                <span className="text-[9px] text-white/50">Classic 4-Cut</span>
              </button>

              <button
                onClick={() => onStartSession('twin-strip')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-8 h-9 border-2 border-white/70 rounded-xs mb-1.5 flex justify-between p-0.5 gap-0.5 group-hover:border-[#d4af37] transition">
                  <div className="w-3 h-full flex flex-col justify-between gap-0.5">
                    <div className="w-full h-2 bg-white/20" />
                    <div className="w-full h-2 bg-white/20" />
                  </div>
                  <div className="w-[1px] h-full border-r border-dashed border-white/40" />
                  <div className="w-3 h-full flex flex-col justify-between gap-0.5">
                    <div className="w-full h-2 bg-white/20" />
                    <div className="w-full h-2 bg-white/20" />
                  </div>
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">Twin Strip</span>
                <span className="text-[9px] text-white/50">2x Besties Cut</span>
              </button>

              {/* Row 2 */}
              <button
                onClick={() => onStartSession('passport-six')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-8 h-9 border-2 border-white/70 rounded-xs mb-1.5 grid grid-cols-2 gap-0.5 p-0.5 group-hover:border-[#d4af37] transition">
                  <div className="bg-white/20 rounded-xs" />
                  <div className="bg-white/20 rounded-xs" />
                  <div className="bg-white/20 rounded-xs" />
                  <div className="bg-white/20 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">Passport</span>
                <span className="text-[9px] text-white/50">6-Cut Stamps</span>
              </button>

              <button
                onClick={() => onStartSession('film-negative')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-6 h-9 border border-orange-500/60 rounded-xs mb-1.5 flex flex-col justify-between p-0.5 gap-0.5 bg-black/60 group-hover:border-orange-400 transition">
                  <div className="w-full h-1.5 bg-orange-400/30 rounded-xs" />
                  <div className="w-full h-1.5 bg-orange-400/30 rounded-xs" />
                  <div className="w-full h-1.5 bg-orange-400/30 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">35mm Roll</span>
                <span className="text-[9px] text-white/50">Negative Film</span>
              </button>

              <button
                onClick={() => onStartSession('four-photo-grid')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-8 h-9 border-2 border-white/70 rounded-xs mb-1.5 grid grid-cols-2 gap-0.5 p-0.5 group-hover:border-[#d4af37] transition">
                  <div className="bg-white/20 rounded-xs" />
                  <div className="bg-white/20 rounded-xs" />
                  <div className="bg-white/20 rounded-xs" />
                  <div className="bg-white/20 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">2×2 Grid</span>
                <span className="text-[9px] text-white/50">Quadrant</span>
              </button>

              <button
                onClick={() => onStartSession('wedding-guestbook')}
                className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#142e23]/90 border border-white/10 hover:border-[#d4af37]/60 hover:bg-[#1b3d30] transition cursor-pointer text-center"
              >
                <div className="w-8 h-9 border-2 border-[#d4af37]/70 rounded-xs mb-1.5 flex flex-col justify-between p-0.5 group-hover:border-[#d4af37] transition">
                  <div className="w-full h-4 bg-white/20 rounded-xs" />
                  <div className="w-full h-[1px] bg-[#d4af37]/40" />
                </div>
                <span className="text-xs font-bold text-[#fbf8f1]">Keepsake</span>
                <span className="text-[9px] text-white/50">Guestbook</span>
              </button>
            </div>

            {/* Arcade Hands-Free Burst Shoot Option */}
            <button
              onClick={() => onStartSession('four-photo-strip', true)}
              className="w-full max-w-lg mx-auto lg:mx-0 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#d4af37]/25 to-amber-600/20 border border-[#d4af37]/50 hover:border-[#d4af37] flex items-center justify-between gap-2 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-7 h-7 rounded-lg bg-[#d4af37] flex items-center justify-center text-[#0e1f18] font-black text-sm group-hover:scale-105 transition">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-bold text-[#fbf8f1]">
                    Arcade Auto-Burst Mode
                  </p>
                  <p className="text-[10px] text-amber-200/70">
                    Hands-free sequential shoot: 4 poses captured automatically!
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-0.5 transition shrink-0" />
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <button
              onClick={() => onStartSession()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c05d] to-[#c59b27] text-[#0e1f18] font-bold text-base shadow-xl shadow-black/40 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-[#0e1f18]" />
              <span>Step Inside Booth</span>
              <ChevronRight className="w-5 h-5 text-[#0e1f18]" />
            </button>

            <button
              onClick={onOpenGallery}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#142e23] border border-white/15 text-sm font-semibold text-[#fbf8f1] hover:bg-[#1b3d30] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Images className="w-4 h-4 text-[#d4af37]" />
              <span>Saved Photos</span>
            </button>
          </div>
        </div>

        {/* Right: Tactile Polaroid Preview Fan */}
        <div className="relative flex flex-col items-center justify-center py-6">
          <div
            onClick={() => setActiveSampleIndex((prev) => (prev + 1) % sampleCards.length)}
            className="relative w-64 sm:w-72 h-88 sm:h-96 cursor-pointer group"
            title="Click to cycle sample Polaroids"
          >
            {sampleCards.map((sample, idx) => {
              const isTop = idx === activeSampleIndex;
              const rot = isTop ? 0 : idx === 1 ? 5 : -5;
              const zIndex = isTop ? 30 : idx === 1 ? 20 : 10;
              const scale = isTop ? 1 : 0.94;

              return (
                <div
                  key={idx}
                  style={{
                    transform: `rotate(${rot}deg) scale(${scale})`,
                    zIndex,
                    backgroundColor: sample.color,
                  }}
                  className={`absolute inset-0 rounded-xl p-3 pb-8 shadow-2xl transition-all duration-300 ease-out flex flex-col justify-between border border-black/10 select-none ${
                    isTop ? 'shadow-black/60 ring-2 ring-[#d4af37]/60' : 'opacity-85'
                  }`}
                >
                  {/* Photo Window */}
                  <div className="relative w-full aspect-square bg-[#1f2937] rounded-sm overflow-hidden shadow-inner">
                    <img
                      src={sample.bgImg}
                      alt={sample.title}
                      className="w-full h-full object-cover filter contrast-105"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-medium text-amber-200">
                      {sample.filter}
                    </div>
                  </div>

                  {/* Caption Chin */}
                  <div className="pt-3 text-center">
                    <p className="font-handwriting text-2xl text-[#1f2937] leading-none">
                      {sample.title}
                    </p>
                    <p className="font-typewriter text-[9px] text-[#4a5568] tracking-widest mt-1">
                      {sample.date}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Click to flip hint */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] font-medium text-[#d4af37]/80 bg-[#0e1f18]/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[#d4af37]/20 pointer-events-none">
              <RotateCw className="w-3 h-3 text-[#d4af37]" />
              <span>Tap to preview filters</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer & Discreet Privacy Statement */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-white/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
          <span>
            <strong>100% Private:</strong> Photos are processed entirely on your device. Zero cloud uploads.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>12 Polaroid Layouts</span>
          <span>•</span>
          <span>15 Film Stocks</span>
          <span>•</span>
          <span>Print Ready 300 DPI</span>
        </div>
      </footer>
    </div>
  );
};
