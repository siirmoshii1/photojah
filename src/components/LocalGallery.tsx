import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Download,
  Share2,
  Camera,
  Calendar,
  Layers,
  X,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import { SavedComposition } from '../types';
import {
  clearAllCompositions,
  deleteSavedComposition,
  getAllSavedCompositions,
  getStorageEstimate,
} from '../utils/storage';

interface Props {
  onBack: () => void;
  onStartNewSession: () => void;
}

export const LocalGallery: React.FC<Props> = ({ onBack, onStartNewSession }) => {
  const [items, setItems] = useState<SavedComposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SavedComposition | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ usageMB: number; quotaMB: number } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const list = await getAllSavedCompositions();
    setItems(list);
    const est = await getStorageEstimate();
    setStorageInfo(est);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this Polaroid from your device?')) {
      await deleteSavedComposition(id);
      if (selectedItem?.id === id) setSelectedItem(null);
      await loadData();
    }
  };

  const handleClearAll = async () => {
    await clearAllCompositions();
    setShowClearConfirm(false);
    setSelectedItem(null);
    await loadData();
  };

  const handleDownloadItem = (item: SavedComposition, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = `photojah-${item.formatId}-${new Date(item.createdAt).toISOString().slice(0, 10)}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareItem = async (item: SavedComposition, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(item.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `photojah-${item.id}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Photojah Instant Print',
        });
      } else {
        handleDownloadItem(item);
      }
    } catch {
      handleDownloadItem(item);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1f18] via-[#122b22] to-[#0a1712] text-[#fbf8f1] px-4 py-6 sm:px-8 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142e23] border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-[#1b3d30] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-xl font-vintage font-bold text-[#fbf8f1]">
            Local Photo Gallery
          </h2>
          <p className="text-[11px] text-[#d4af37]">
            {items.length} saved creation{items.length !== 1 ? 's' : ''} stored safely in your browser
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 hover:bg-red-900/60 transition cursor-pointer"
              title="Clear all saved Polaroids"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onStartNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#0e1f18]" />
            <span>New Photo</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full max-w-5xl mx-auto my-auto py-6">
        {loading ? (
          <div className="py-24 text-center text-white/50 text-xs">
            Loading private storage...
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#142e23] border border-[#d4af37]/40 mx-auto flex items-center justify-center text-[#d4af37]">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#fbf8f1]">No Polaroids Yet</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Step into the Photojah photo booth to capture instant photos, apply film looks, and save them here.
            </p>
            <button
              onClick={onStartNewSession}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] font-bold text-xs hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Start Your First Shoot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative flex flex-col rounded-2xl bg-[#142e23] border border-white/10 p-2.5 shadow-lg hover:border-[#d4af37]/60 transition cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/50 shadow-inner mb-2 flex items-center justify-center">
                  <img
                    src={item.dataUrl}
                    alt={item.captionText || 'Polaroid'}
                    className="max-w-full max-h-full object-contain group-hover:scale-102 transition duration-200"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-white/90 truncate px-1">
                  <span className="truncate">{item.captionText || item.formatName}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/40 px-1 mt-0.5">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="text-[#d4af37]">{item.formatName}</span>
                </div>

                {/* Quick Action Overlay on hover */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={(e) => handleDownloadItem(item, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleShareItem(item, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Storage Estimate Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>
            Local IndexedDB: {storageInfo ? `${storageInfo.usageMB} MB cached` : 'Device only'}
          </span>
        </div>
        <span>Stored completely in your browser without cloud tracking</span>
      </footer>

      {/* Fullscreen Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#142e23] border border-[#d4af37]/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-vintage font-bold text-lg text-[#fbf8f1] mb-1">
              {selectedItem.captionText || selectedItem.formatName}
            </h3>
            <p className="text-xs text-[#d4af37] mb-4">
              {selectedItem.formatName} • {new Date(selectedItem.createdAt).toLocaleString()}
            </p>

            <div className="max-h-[60vh] max-w-full rounded-xl overflow-hidden shadow-2xl bg-black/60 p-2 flex items-center justify-center mb-5">
              <img
                src={selectedItem.dataUrl}
                alt="Selected Creation"
                className="max-h-[56vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="w-full flex items-center justify-center gap-3">
              <button
                onClick={() => handleDownloadItem(selectedItem)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59b27] text-[#0e1f18] font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0e1f18]" />
                <span>Download</span>
              </button>

              <button
                onClick={() => handleShareItem(selectedItem)}
                className="px-4 py-2.5 rounded-xl bg-[#1b3d30] border border-white/10 text-xs font-semibold hover:bg-[#234d3d] flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#d4af37]" />
                <span>Share</span>
              </button>

              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-xs font-semibold text-red-300 hover:bg-red-900/60 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#142e23] border border-red-500/40 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 mx-auto flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#fbf8f1]">Clear Entire Gallery?</h3>
            <p className="text-xs text-white/70">
              This will permanently delete all {items.length} saved Polaroids from your browser's local memory.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
