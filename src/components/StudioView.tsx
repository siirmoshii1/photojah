import React, { useEffect, useState } from 'react';
import {
  Layers,
  Wand2,
  Box,
  Type,
  ArrowLeft,
  ArrowRight,
  Camera,
  RotateCcw,
  Sparkles,
  Edit2,
} from 'lucide-react';
import {
  CaptionSettings,
  CapturedPhoto,
  FilterId,
  FormatId,
  FrameSettings,
} from '../types';
import { renderComposition } from '../utils/renderer';
import { FormatSelector } from './FormatSelector';
import { FilterGallery } from './FilterGallery';
import { FrameCustomizer } from './FrameCustomizer';
import { CaptionEditor } from './CaptionEditor';
import { getFormatDefinition } from '../utils/formats';

interface Props {
  photos: CapturedPhoto[];
  formatId: FormatId;
  filterId: FilterId;
  filterIntensity: number;
  frameSettings: FrameSettings;
  captionSettings: CaptionSettings;
  onUpdateFormat: (formatId: FormatId) => void;
  onUpdateFilter: (filterId: FilterId) => void;
  onUpdateIntensity: (intensity: number) => void;
  onUpdateFrame: (frame: FrameSettings) => void;
  onUpdateCaptions: (captions: CaptionSettings) => void;
  onBackToReview: () => void;
  onProceedToPreview: () => void;
  onRequestCaptureMore?: (count: number) => void;
}

export const StudioView: React.FC<Props> = ({
  photos,
  formatId,
  filterId,
  filterIntensity,
  frameSettings,
  captionSettings,
  onUpdateFormat,
  onUpdateFilter,
  onUpdateIntensity,
  onUpdateFrame,
  onUpdateCaptions,
  onBackToReview,
  onProceedToPreview,
  onRequestCaptureMore,
}) => {
  const [activeTab, setActiveTab] = useState<'format' | 'filter' | 'frame' | 'caption'>('format');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const formatDef = getFormatDefinition(formatId);

  // Update live preview when settings change
  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);

    const config = {
      photos,
      formatId,
      filterId,
      filterIntensity,
      frameSettings,
      captionSettings,
    };

    // Fast preview scale (0.4)
    renderComposition(config, 0.45)
      .then((c) => {
        if (!cancelled) {
          setPreviewDataUrl(c.toDataURL('image/jpeg', 0.85));
          setIsRendering(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setIsRendering(false);
      });

    return () => {
      cancelled = true;
    };
  }, [photos, formatId, filterId, filterIntensity, frameSettings, captionSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1f18] via-[#122b22] to-[#0a1712] text-[#fbf8f1] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full px-4 sm:px-8 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e1f18]/80 backdrop-blur-md">
        <button
          onClick={onBackToReview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142e23] border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-[#1b3d30] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Photos ({photos.length})</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm sm:text-base font-vintage font-bold text-[#fbf8f1] leading-tight">
            Polaroid Design Studio
          </h2>
          <p className="text-[10px] text-[#d4af37]">
            {formatDef.name} • {filterId}
          </p>
        </div>

        <button
          onClick={onProceedToPreview}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4 text-[#0e1f18]" />
        </button>
      </header>

      {/* Main Studio Body: Split View on Desktop, Stacked on Mobile */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#0a1712]/60 border border-white/10 rounded-3xl p-4 sm:p-6 min-h-[380px] lg:sticky lg:top-20">
          <div className="relative max-w-full max-h-[50vh] flex items-center justify-center">
            {isRendering && !previewDataUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Live Composition Preview"
                className="max-w-full max-h-[48vh] object-contain rounded-xl shadow-2xl transition-all duration-200"
              />
            ) : (
              <div className="text-xs text-white/40">Composing instant preview...</div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Rendering</span>
          </div>
        </div>

        {/* Right Column: Tabbed Controls */}
        <div className="lg:col-span-7 flex flex-col bg-[#142e23] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl">
          {/* Studio Tab Buttons */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#0e1f18] rounded-2xl border border-white/5 mb-5">
            {[
              { id: 'format', label: '1. Format', icon: Layers },
              { id: 'filter', label: '2. Film Look', icon: Wand2 },
              { id: 'frame', label: '3. Frame', icon: Box },
              { id: 'caption', label: '4. Caption', icon: Type },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#d4af37] text-[#0e1f18] shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split('. ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="min-h-[280px]">
            {activeTab === 'format' && (
              <FormatSelector
                selectedFormatId={formatId}
                currentPhotoCount={photos.length}
                onSelectFormat={onUpdateFormat}
                onRequestCaptureMore={onRequestCaptureMore}
              />
            )}

            {activeTab === 'filter' && (
              <FilterGallery
                selectedFilterId={filterId}
                filterIntensity={filterIntensity}
                onSelectFilter={onUpdateFilter}
                onChangeIntensity={onUpdateIntensity}
                previewThumbnailUrl={photos[0]?.originalDataUrl}
              />
            )}

            {activeTab === 'frame' && (
              <FrameCustomizer
                settings={frameSettings}
                onChange={onUpdateFrame}
              />
            )}

            {activeTab === 'caption' && (
              <CaptionEditor
                settings={captionSettings}
                onChange={onUpdateCaptions}
              />
            )}
          </div>

          {/* Bottom Action Footer inside Studio */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onBackToReview}
              className="text-xs text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Retake or Crop Photos</span>
            </button>

            <button
              onClick={onProceedToPreview}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Export & Print</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0e1f18]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
