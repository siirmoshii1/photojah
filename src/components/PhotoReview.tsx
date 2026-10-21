import React from 'react';
import {
  RotateCcw,
  Check,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { CapturedPhoto } from '../types';

interface Props {
  photos: CapturedPhoto[];
  onRetakePhoto: (index: number) => void;
  onAddPhoto: () => void;
  onDeletePhoto: (index: number) => void;
  onMovePhoto: (fromIndex: number, toIndex: number) => void;
  onEditPhoto: (index: number) => void;
  onProceed: () => void;
  onRestartSession: () => void;
  maxPhotos?: number;
}

export const PhotoReview: React.FC<Props> = ({
  photos,
  onRetakePhoto,
  onAddPhoto,
  onDeletePhoto,
  onMovePhoto,
  onEditPhoto,
  onProceed,
  onRestartSession,
  maxPhotos = 4,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1f18] via-[#122b22] to-[#0a1712] text-[#fbf8f1] px-4 py-6 sm:px-8 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <button
          onClick={onRestartSession}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#142e23] border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-[#1b3d30] transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Session</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg font-vintage font-bold text-[#fbf8f1]">
            Review Photographs
          </h2>
          <p className="text-[11px] text-[#d4af37]">
            {photos.length} captured moment{photos.length > 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={onProceed}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <span>Continue</span>
          <Check className="w-4 h-4 text-[#0e1f18]" />
        </button>
      </header>

      {/* Main Review Grid */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id || index}
              className="group relative flex flex-col rounded-2xl bg-[#142e23] border border-white/10 p-3 shadow-xl hover:border-[#d4af37]/50 transition"
            >
              {/* Photo Frame Badge */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold tracking-wider text-[#d4af37]">
                  SHOT #{index + 1}
                </span>

                <div className="flex items-center gap-1">
                  {/* Move Left / Earlier */}
                  {index > 0 && (
                    <button
                      onClick={() => onMovePhoto(index, index - 1)}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                      title="Move earlier"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {/* Move Right / Later */}
                  {index < photos.length - 1 && (
                    <button
                      onClick={() => onMovePhoto(index, index + 1)}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                      title="Move later"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/60 shadow-inner">
                <img
                  src={photo.originalDataUrl}
                  alt={`Capture ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Edit Icon Overlay */}
                <button
                  onClick={() => onEditPhoto(index)}
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition cursor-pointer"
                  title="Crop & Adjust Photo"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-200" />
                </button>
              </div>

              {/* Action Buttons Below Each Photo */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => onRetakePhoto(index)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#1b3d30] border border-white/10 text-[11px] font-semibold text-white/90 hover:bg-[#234d3d] hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#d4af37]" />
                  <span>Retake</span>
                </button>

                <button
                  onClick={() => onDeletePhoto(index)}
                  disabled={photos.length <= 1}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-red-950/40 border border-red-500/20 text-[11px] font-semibold text-red-300 hover:bg-red-900/60 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Another Photo Card if below max */}
          {photos.length < maxPhotos && (
            <button
              onClick={onAddPhoto}
              className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-[#d4af37] bg-[#142e23]/40 hover:bg-[#142e23] p-6 text-center transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1b3d30] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#fbf8f1]">Capture Another Shot</span>
              <span className="text-[10px] text-white/50 mt-1">
                Up to {maxPhotos} photos in session
              </span>
            </button>
          )}
        </div>
      </main>

      {/* Bottom Floating Bar */}
      <footer className="w-full max-w-4xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span>Tap <strong>Edit</strong> on any photo to adjust crop, exposure, and grain.</span>
        </div>

        <button
          onClick={onProceed}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] text-sm font-bold shadow-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Choose Format & Vintage Filter</span>
          <ArrowRight className="w-4 h-4 text-[#0e1f18]" />
        </button>
      </footer>
    </div>
  );
};
