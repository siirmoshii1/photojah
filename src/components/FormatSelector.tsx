import React, { useState } from 'react';
import { Layers, Film, Grid, Image, AlertCircle, Camera } from 'lucide-react';
import { FormatId } from '../types';
import { POLAROID_FORMATS } from '../utils/formats';

interface Props {
  selectedFormatId: FormatId;
  currentPhotoCount: number;
  onSelectFormat: (formatId: FormatId) => void;
  onRequestCaptureMore?: (neededCount: number) => void;
}

export const FormatSelector: React.FC<Props> = ({
  selectedFormatId,
  currentPhotoCount,
  onSelectFormat,
  onRequestCaptureMore,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'single' | 'strip' | 'multi'>('all');

  const filtered = POLAROID_FORMATS.filter(
    (f) => filterCategory === 'all' || f.category === filterCategory
  );

  const activeFormat = POLAROID_FORMATS.find((f) => f.id === selectedFormatId) || POLAROID_FORMATS[0];
  const needsMore = activeFormat.requiredPhotos > currentPhotoCount;
  const missingCount = activeFormat.requiredPhotos - currentPhotoCount;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All 12 Formats', icon: Layers },
          { id: 'single', label: 'Single Instant', icon: Image },
          { id: 'strip', label: 'Photo Strips', icon: Film },
          { id: 'multi', label: 'Grids & Collages', icon: Grid },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id as typeof filterCategory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
                isActive
                  ? 'bg-[#d4af37] text-[#0e1f18] shadow-sm'
                  : 'bg-[#142e23] border border-white/10 text-white/70 hover:text-white hover:bg-[#1b3d30]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Warning if selected format needs more photos */}
      {needsMore && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{activeFormat.name}</strong> shines with {activeFormat.requiredPhotos} photos (you have {currentPhotoCount}).
            </span>
          </div>
          {onRequestCaptureMore && (
            <button
              onClick={() => onRequestCaptureMore(missingCount)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#d4af37] text-[#0e1f18] font-bold text-xs hover:brightness-110 shrink-0 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snap {missingCount} More</span>
            </button>
          )}
        </div>
      )}

      {/* Format Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
        {filtered.map((fmt) => {
          const isSelected = fmt.id === selectedFormatId;
          const hasEnoughPhotos = currentPhotoCount >= fmt.minPhotos;

          return (
            <button
              key={fmt.id}
              onClick={() => onSelectFormat(fmt.id)}
              className={`relative flex flex-col p-3 rounded-2xl text-left transition cursor-pointer border ${
                isSelected
                  ? 'bg-[#1b3d30] border-[#d4af37] ring-2 ring-[#d4af37]/50 shadow-lg'
                  : 'bg-[#142e23] border-white/10 hover:border-white/30 hover:bg-[#18372b]'
              }`}
            >
              {/* Thumbnail Representation */}
              <div className="w-full h-24 rounded-lg bg-[#0e1f18] border border-white/5 flex items-center justify-center p-2 mb-2 overflow-hidden">
                <FormatMiniIllustration formatId={fmt.id} />
              </div>

              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-1 mb-1">
                <h4 className="text-xs font-bold text-[#fbf8f1] leading-tight">
                  {fmt.name}
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-[#d4af37] shrink-0">
                  {fmt.requiredPhotos} {fmt.requiredPhotos === 1 ? 'Shot' : 'Shots'}
                </span>
              </div>

              <p className="text-[10px] text-white/60 line-clamp-2 leading-relaxed">
                {fmt.description}
              </p>

              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-[#d4af37]/80">
                <span>{fmt.aspectLabel}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mini visual schematic diagrams for format cards
function FormatMiniIllustration({ formatId }: { formatId: FormatId }) {
  switch (formatId) {
    case 'classic-polaroid':
      return (
        <div className="w-12 h-15 bg-[#fbf8f1] rounded-xs p-1 pb-3 flex flex-col shadow-sm">
          <div className="w-full h-9 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'wide-polaroid':
      return (
        <div className="w-16 h-13 bg-[#fbf8f1] rounded-xs p-1 pb-2 flex flex-col shadow-sm">
          <div className="w-full h-8 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'tall-polaroid':
      return (
        <div className="w-11 h-16 bg-[#fbf8f1] rounded-xs p-1 pb-3 flex flex-col shadow-sm">
          <div className="w-full h-11 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'square-instant':
      return (
        <div className="w-13 h-13 bg-[#fbf8f1] rounded-xs p-1.5 flex flex-col shadow-sm">
          <div className="w-full h-full bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'three-photo-strip':
      return (
        <div className="w-7 h-18 bg-[#fbf8f1] rounded-xs p-0.5 pb-2 flex flex-col gap-0.5 shadow-sm">
          <div className="w-full h-4 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-4 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-4 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'four-photo-strip':
      return (
        <div className="w-7 h-19 bg-[#fbf8f1] rounded-xs p-0.5 pb-2 flex flex-col gap-0.5 shadow-sm">
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'four-photo-grid':
      return (
        <div className="w-14 h-16 bg-[#fbf8f1] rounded-xs p-1 pb-2 grid grid-cols-2 gap-0.5 shadow-sm">
          <div className="bg-[#2d3748] rounded-xs" />
          <div className="bg-[#2d3748] rounded-xs" />
          <div className="bg-[#2d3748] rounded-xs" />
          <div className="bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'vintage-collage':
      return (
        <div className="relative w-16 h-14">
          <div className="absolute top-1 left-1 w-9 h-11 bg-[#fbf8f1] -rotate-6 shadow-xs p-0.5">
            <div className="w-full h-7 bg-[#2d3748]" />
          </div>
          <div className="absolute top-2 right-1 w-9 h-11 bg-[#fbf8f1] rotate-8 shadow-xs p-0.5">
            <div className="w-full h-7 bg-[#38495f]" />
          </div>
        </div>
      );
    case 'wide-booth-strip':
      return (
        <div className="w-18 h-8 bg-[#fbf8f1] rounded-xs p-1 flex gap-0.5 shadow-sm">
          <div className="flex-1 bg-[#2d3748] rounded-xs" />
          <div className="flex-1 bg-[#2d3748] rounded-xs" />
          <div className="flex-1 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'mini-polaroid':
      return (
        <div className="w-9 h-15 bg-[#fbf8f1] rounded-xs p-1 pb-2 flex flex-col shadow-sm">
          <div className="w-full h-10 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'double-polaroid':
      return (
        <div className="w-16 h-12 bg-[#fbf8f1] rounded-xs p-1 flex gap-1 shadow-sm">
          <div className="flex-1 bg-[#2d3748] rounded-xs" />
          <div className="flex-1 bg-[#2d3748] rounded-xs" />
        </div>
      );
    case 'contact-sheet':
      return (
        <div className="w-16 h-13 bg-[#111] border border-[#d4af37]/40 rounded-xs p-1 grid grid-cols-2 gap-0.5 shadow-sm">
          <div className="bg-[#333] border border-white/10" />
          <div className="bg-[#333] border border-white/10" />
          <div className="bg-[#333] border border-white/10" />
          <div className="bg-[#333] border border-white/10" />
        </div>
      );
    case 'twin-strip':
      return (
        <div className="w-16 h-18 bg-[#fbf8f1] rounded-xs p-1 flex justify-between gap-1 shadow-sm relative">
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
            <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
            <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          </div>
          <div className="w-[1px] h-full border-r border-dashed border-gray-400" />
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
            <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
            <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          </div>
        </div>
      );
    case 'passport-six':
      return (
        <div className="w-14 h-16 bg-[#fbf8f1] rounded-xs p-1 grid grid-cols-2 gap-0.5 shadow-sm">
          <div className="bg-[#2d3748] rounded-xs h-3.5" />
          <div className="bg-[#2d3748] rounded-xs h-3.5" />
          <div className="bg-[#2d3748] rounded-xs h-3.5" />
          <div className="bg-[#2d3748] rounded-xs h-3.5" />
          <div className="bg-[#2d3748] rounded-xs h-3.5" />
          <div className="bg-[#2d3748] rounded-xs h-3.5" />
        </div>
      );
    case 'film-negative':
      return (
        <div className="w-8 h-18 bg-[#0f1114] border border-orange-500/40 rounded-xs p-0.5 flex flex-col gap-0.5 shadow-sm">
          <div className="w-full h-2.5 bg-[#333] border border-white/10" />
          <div className="w-full h-2.5 bg-[#333] border border-white/10" />
          <div className="w-full h-2.5 bg-[#333] border border-white/10" />
          <div className="w-full h-2.5 bg-[#333] border border-white/10" />
        </div>
      );
    case 'wedding-guestbook':
      return (
        <div className="w-14 h-18 bg-[#fbf8f1] border border-[#d4af37] rounded-xs p-1 flex flex-col shadow-sm">
          <div className="w-full h-8 bg-[#2d3748] rounded-xs mb-1" />
          <div className="w-full h-[1px] bg-amber-800/30 mb-0.5" />
          <div className="w-full h-[1px] bg-amber-800/30 mb-0.5" />
          <div className="w-full h-[1px] bg-amber-800/30" />
        </div>
      );
    case 'bookmark-strip':
      return (
        <div className="w-6 h-18 bg-[#fbf8f1] rounded-xs p-0.5 flex flex-col items-center gap-0.5 shadow-sm">
          <div className="w-2 h-2 rounded-full border border-amber-600 bg-amber-100" />
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
          <div className="w-full h-3 bg-[#2d3748] rounded-xs" />
        </div>
      );
    default:
      return null;
  }
}
