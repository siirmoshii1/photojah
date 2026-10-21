import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Share2,
  Printer,
  Bookmark,
  RotateCcw,
  ArrowLeft,
  Check,
  Sparkles,
  Layers,
  Images,
} from 'lucide-react';
import {
  CaptionSettings,
  CapturedPhoto,
  FilterId,
  FormatId,
  FrameSettings,
  SavedComposition,
} from '../types';
import { downloadCanvas, renderComposition } from '../utils/renderer';
import { saveCompositionToDB } from '../utils/storage';
import { getFormatDefinition } from '../utils/formats';

interface Props {
  photos: CapturedPhoto[];
  formatId: FormatId;
  filterId: FilterId;
  filterIntensity: number;
  frameSettings: FrameSettings;
  captionSettings: CaptionSettings;
  onBackToCustomize: () => void;
  onStartNewSession: () => void;
  onOpenGallery: () => void;
}

export const FinalPreview: React.FC<Props> = ({
  photos,
  formatId,
  filterId,
  filterIntensity,
  frameSettings,
  captionSettings,
  onBackToCustomize,
  onStartNewSession,
  onOpenGallery,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const formatDef = getFormatDefinition(formatId);

  // Render composition preview
  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    const config = {
      photos,
      formatId,
      filterId,
      filterIntensity,
      frameSettings,
      captionSettings,
    };

    // Render preview at 0.6 scale for super fast fluid UI
    renderComposition(config, 0.6)
      .then((c) => {
        if (!isCancelled) {
          setPreviewCanvas(c);
          setIsRendering(false);
        }
      })
      .catch((err) => {
        console.error('Failed to render preview', err);
        if (!isCancelled) setIsRendering(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [photos, formatId, filterId, filterIntensity, frameSettings, captionSettings]);

  // Helper to generate full high-res canvas (1.0 scale)
  const getHighResCanvas = async () => {
    const config = {
      photos,
      formatId,
      filterId,
      filterIntensity,
      frameSettings,
      captionSettings,
    };
    return await renderComposition(config, 1.0);
  };

  const generateFilename = (ext: 'png' | 'jpg') => {
    const dateStr = new Date().toISOString().slice(0, 10);
    return `photojah-${formatId}-${dateStr}.${ext}`;
  };

  // Download high-resolution PNG
  const handleDownloadPNG = async () => {
    setExportNotice('Rendering high-resolution print PNG...');
    try {
      const highRes = await getHighResCanvas();
      downloadCanvas(highRes, generateFilename('png'), 'image/png');
      setExportNotice('Downloaded high-res PNG!');
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error(err);
      setExportNotice('Download failed. Please try again.');
    }
  };

  // Download JPEG
  const handleDownloadJPEG = async () => {
    setExportNotice('Rendering JPEG photo...');
    try {
      const highRes = await getHighResCanvas();
      downloadCanvas(highRes, generateFilename('jpg'), 'image/jpeg', 0.95);
      setExportNotice('Downloaded JPEG!');
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error(err);
      setExportNotice('Download failed.');
    }
  };

  // Web Share API
  const handleShare = async () => {
    try {
      const highRes = await getHighResCanvas();
      const blob = await new Promise<Blob | null>((resolve) =>
        highRes.toBlob(resolve, 'image/png', 0.95)
      );
      if (!blob) throw new Error('Blob creation failed');

      const file = new File([blob], generateFilename('png'), { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Photojah Instant Polaroid',
          text: 'Captured on Photojah Vintage Photo Booth! ✦',
        });
        setExportNotice('Shared successfully!');
      } else if (navigator.share) {
        await navigator.share({
          title: 'Photojah Vintage Photo Booth',
          text: 'Check out my instant Polaroid on Photojah!',
          url: window.location.href,
        });
      } else {
        // Fallback to download
        handleDownloadPNG();
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        // Fallback
        handleDownloadPNG();
      }
    }
  };

  // Native Print Dialog
  const handlePrint = async () => {
    setExportNotice('Preparing printer-friendly output...');
    window.print();
  };

  // Save to IndexedDB Gallery
  const handleSaveToGallery = async () => {
    try {
      const highRes = await getHighResCanvas();
      const dataUrl = highRes.toDataURL('image/jpeg', 0.9);
      const savedItem: SavedComposition = {
        id: `photojah_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        dataUrl,
        formatId,
        formatName: formatDef.name,
        filterId,
        photoCount: photos.length,
        captionText: captionSettings.text || formatDef.name,
        createdAt: Date.now(),
      };
      await saveCompositionToDB(savedItem);
      setIsSaved(true);
      setExportNotice('Saved to your private local gallery!');
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error('Error saving to gallery', err);
      setExportNotice('Could not save to local storage.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1f18] via-[#122b22] to-[#0a1712] text-[#fbf8f1] px-4 py-6 sm:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <header className="no-print w-full max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={onBackToCustomize}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#142e23] border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-[#1b3d30] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Styles</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-vintage font-bold text-[#fbf8f1]">
            Your Finished Polaroid
          </h2>
          <p className="text-[11px] text-[#d4af37]">
            {formatDef.name} • {formatDef.printSizeNote}
          </p>
        </div>

        <button
          onClick={onStartNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-white/80 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Shoot</span>
        </button>
      </header>

      {/* Notification Toast */}
      {exportNotice && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#d4af37] text-[#0e1f18] text-xs font-bold shadow-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Composition Canvas View */}
      <main className="w-full max-w-4xl mx-auto my-auto py-6 flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          className="print-container relative max-w-full max-h-[62vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-2 sm:p-4 bg-black/40 flex items-center justify-center"
        >
          {isRendering ? (
            <div className="py-24 px-12 flex flex-col items-center justify-center gap-3 text-white/70">
              <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
              <p className="text-xs font-medium">Developing analog film print...</p>
            </div>
          ) : previewCanvas ? (
            <img
              src={previewCanvas.toDataURL('image/png')}
              alt="Final Polaroid Composition"
              className="max-w-full max-h-[58vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
            />
          ) : null}
        </div>

        <div className="no-print mt-3 text-center text-[11px] text-[#d4af37]/80">
          ✦ Rendered at high-resolution print density (300 DPI equivalent)
        </div>
      </main>

      {/* Action Buttons Toolbar */}
      <footer className="no-print w-full max-w-4xl mx-auto pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
        {/* Primary Download PNG */}
        <button
          onClick={handleDownloadPNG}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c05d] to-[#c59b27] text-[#0e1f18] font-bold text-xs sm:text-sm shadow-xl shadow-black/40 hover:brightness-110 active:scale-95 transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#0e1f18]" />
          <span>Download High-Res PNG</span>
        </button>

        {/* Download JPEG */}
        <button
          onClick={handleDownloadJPEG}
          className="px-4 py-3 rounded-xl bg-[#142e23] border border-white/15 text-xs font-semibold text-[#fbf8f1] hover:bg-[#1b3d30] transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#d4af37]" />
          <span>JPEG</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="px-4 py-3 rounded-xl bg-[#142e23] border border-white/15 text-xs font-semibold text-[#fbf8f1] hover:bg-[#1b3d30] transition flex items-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#d4af37]" />
          <span>Share</span>
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="px-4 py-3 rounded-xl bg-[#142e23] border border-white/15 text-xs font-semibold text-[#fbf8f1] hover:bg-[#1b3d30] transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#d4af37]" />
          <span>Print</span>
        </button>

        {/* Save to Local Gallery */}
        <button
          onClick={handleSaveToGallery}
          disabled={isSaved}
          className={`px-4 py-3 rounded-xl border text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
            isSaved
              ? 'bg-[#1b3d30] border-[#d4af37] text-[#d4af37]'
              : 'bg-[#142e23] border-white/15 text-[#fbf8f1] hover:bg-[#1b3d30]'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4 text-[#d4af37]" /> : <Bookmark className="w-4 h-4 text-[#d4af37]" />}
          <span>{isSaved ? 'Saved to Gallery' : 'Save to Gallery'}</span>
        </button>

        {/* View Gallery Link */}
        <button
          onClick={onOpenGallery}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2 cursor-pointer"
        >
          <Images className="w-4 h-4" />
          <span>My Gallery</span>
        </button>
      </footer>
    </div>
  );
};
