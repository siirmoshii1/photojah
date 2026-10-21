import React, { useState } from 'react';
import { Sliders, Sparkles, Wand2 } from 'lucide-react';
import { FilterId } from '../types';
import { VINTAGE_FILTERS } from '../utils/filters';

interface Props {
  selectedFilterId: FilterId;
  filterIntensity: number;
  onSelectFilter: (filterId: FilterId) => void;
  onChangeIntensity: (intensity: number) => void;
  previewThumbnailUrl?: string;
}

export const FilterGallery: React.FC<Props> = ({
  selectedFilterId,
  filterIntensity,
  onSelectFilter,
  onChangeIntensity,
  previewThumbnailUrl,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = VINTAGE_FILTERS.filter(
    (f) => filterCategory === 'all' || f.category === filterCategory
  );

  const activeDef = VINTAGE_FILTERS.find((f) => f.id === selectedFilterId) || VINTAGE_FILTERS[0];

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All 15 Stocks' },
          { id: 'classic', label: 'Instant Classics' },
          { id: 'warm', label: 'Warm & Amber' },
          { id: 'monochrome', label: 'Monochrome' },
          { id: 'retro', label: '70s & 90s Retro' },
          { id: 'moody', label: 'Moody & Cinema' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-[#d4af37] text-[#0e1f18] shadow-sm'
                : 'bg-[#142e23] border border-white/10 text-white/70 hover:text-white hover:bg-[#1b3d30]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Cards Row / Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filtered.map((item) => {
          const isSelected = item.id === selectedFilterId;

          return (
            <button
              key={item.id}
              onClick={() => onSelectFilter(item.id)}
              className={`group flex flex-col p-2 rounded-2xl text-left transition cursor-pointer border ${
                isSelected
                  ? 'bg-[#1b3d30] border-[#d4af37] ring-2 ring-[#d4af37]/50 shadow-md'
                  : 'bg-[#142e23] border-white/10 hover:border-white/30 hover:bg-[#18372b]'
              }`}
            >
              {/* Filter Swatch / Mini Preview */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-inner border border-white/5 flex items-center justify-center">
                {previewThumbnailUrl ? (
                  <img
                    src={previewThumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    style={{
                      filter: getCSSFilterPreview(item.id),
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: item.sampleColor }}
                  />
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#d4af37] ring-2 ring-[#0e1f18]" />
                )}
              </div>

              <h4 className="text-[11px] font-bold text-[#fbf8f1] truncate leading-tight">
                {item.name}
              </h4>
              <p className="text-[9px] text-[#d4af37]/80 truncate">
                {item.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter Intensity Slider */}
      {selectedFilterId !== 'original' && (
        <div className="p-3.5 rounded-2xl bg-[#142e23] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-white/90">
              <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{activeDef.name} Intensity</span>
            </span>
            <span className="text-[#d4af37] font-bold">{filterIntensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filterIntensity}
            onChange={(e) => onChangeIntensity(Number(e.target.value))}
            className="w-full accent-[#d4af37] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/40">
            <span>Natural (0%)</span>
            <span>Balanced (75%)</span>
            <span>Full Analog (100%)</span>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS filter approximation for fast gallery thumbnails
function getCSSFilterPreview(id: FilterId): string {
  switch (id) {
    case 'classic-polaroid':
      return 'sepia(0.2) contrast(1.05) brightness(1.05) saturate(0.9)';
    case 'vintage-warm':
      return 'sepia(0.35) saturate(1.2) hue-rotate(-10deg) brightness(1.05)';
    case 'sepia':
      return 'sepia(0.9) contrast(1.1) brightness(0.95)';
    case 'bw':
      return 'grayscale(1) contrast(1.25)';
    case 'faded-film':
      return 'contrast(0.85) brightness(1.15) saturate(0.7)';
    case 'seventies':
      return 'sepia(0.25) hue-rotate(-20deg) saturate(1.15) contrast(1.05)';
    case 'nineties-disposable':
      return 'contrast(1.3) saturate(1.25) brightness(1.05)';
    case 'cool-film':
      return 'hue-rotate(25deg) saturate(0.85) contrast(1.05)';
    case 'soft-dream':
      return 'contrast(0.9) brightness(1.12) saturate(0.95) blur(0.3px)';
    case 'instant-camera':
      return 'sepia(0.2) saturate(1.1) contrast(1.1)';
    case 'golden-hour':
      return 'sepia(0.4) saturate(1.3) brightness(1.1)';
    case 'retro-fade':
      return 'contrast(0.8) brightness(1.1) saturate(0.75) hue-rotate(10deg)';
    case 'cinematic-vintage':
      return 'contrast(1.2) saturate(0.9) hue-rotate(-5deg)';
    default:
      return 'none';
  }
}
