import React, { useEffect, useState } from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  Camera,
  Clock,
  ShieldCheck,
  Smartphone,
  Download,
  Info,
  Layers,
  Wand2,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { AppSettings, FilterId, FormatId, FrameColorId } from '../types';
import { sound } from '../utils/audio';
import { clearAllCompositions, getStorageEstimate } from '../utils/storage';
import { POLAROID_FORMATS } from '../utils/formats';
import { VINTAGE_FILTERS } from '../utils/filters';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onClose: () => void;
  onGalleryCleared?: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onClose,
  onGalleryCleared,
}) => {
  const [storageInfo, setStorageInfo] = useState<{ usageMB: number; quotaMB: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'preferences' | 'privacy' | 'about'>('preferences');

  useEffect(() => {
    getStorageEstimate().then(setStorageInfo);
  }, []);

  const handleClearStorage = async () => {
    if (confirm('Are you sure you want to delete all saved Polaroids?')) {
      await clearAllCompositions();
      const updated = await getStorageEstimate();
      setStorageInfo(updated);
      if (onGalleryCleared) onGalleryCleared();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="relative max-w-lg w-full bg-[#142e23] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl text-[#fbf8f1] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b3d30] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#fbf8f1]">Photojah Settings</h3>
              <p className="text-[10px] text-[#d4af37]">Booth Preferences & Privacy</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#0e1f18] rounded-xl border border-white/5 my-4">
          {[
            { id: 'preferences', label: 'Booth Setup' },
            { id: 'privacy', label: 'Privacy & Storage' },
            { id: 'about', label: 'About App' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#d4af37] text-[#0e1f18]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              {/* Default Camera */}
              <div className="p-3 rounded-2xl bg-[#0e1f18]/60 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#fbf8f1]">Default Camera</p>
                  <p className="text-[10px] text-white/50">Front selfie or rear environment</p>
                </div>
                <select
                  value={settings.defaultFacingMode}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      defaultFacingMode: e.target.value as 'user' | 'environment',
                    })
                  }
                  className="bg-[#142e23] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-[#fbf8f1] focus:outline-hidden"
                >
                  <option value="user">Front (Selfie)</option>
                  <option value="environment">Back (Main Camera)</option>
                </select>
              </div>

              {/* Default Timer */}
              <div className="p-3 rounded-2xl bg-[#0e1f18]/60 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#fbf8f1]">Default Timer Countdown</p>
                  <p className="text-[10px] text-white/50">Countdown delay before capture</p>
                </div>
                <select
                  value={settings.defaultTimer}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      defaultTimer: Number(e.target.value) as 0 | 3 | 5 | 10,
                    })
                  }
                  className="bg-[#142e23] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-[#fbf8f1] focus:outline-hidden"
                >
                  <option value={0}>Off (Instant)</option>
                  <option value={3}>3 Seconds</option>
                  <option value={5}>5 Seconds</option>
                  <option value={10}>10 Seconds</option>
                </select>
              </div>

              {/* Shutter Sound Effects */}
              <div className="p-3 rounded-2xl bg-[#0e1f18]/60 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#fbf8f1]">Mechanical Shutter Sound</p>
                  <p className="text-[10px] text-white/50">Synthesized audio tick and mirror click</p>
                </div>
                <button
                  onClick={() => {
                    const next = !settings.soundEffects;
                    sound.setEnabled(next);
                    onUpdateSettings({ ...settings, soundEffects: next });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.soundEffects ? 'bg-[#d4af37]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Default Export File Format */}
              <div className="p-3 rounded-2xl bg-[#0e1f18]/60 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#fbf8f1]">Export Quality Format</p>
                  <p className="text-[10px] text-white/50">PNG (lossless print) or JPEG</p>
                </div>
                <select
                  value={settings.exportFormat}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      exportFormat: e.target.value as 'png' | 'jpeg',
                    })
                  }
                  className="bg-[#142e23] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-[#fbf8f1] focus:outline-hidden"
                >
                  <option value="png">PNG (Crisp 300 DPI)</option>
                  <option value="jpeg">JPEG (Compact)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#0e1f18]/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#d4af37] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Client-Side Architecture</span>
                </div>
                <p className="text-white/70 leading-relaxed text-[11px]">
                  Photojah operates strictly inside your web browser. Neither your camera feed, captured photographs, nor edited Polaroids are transmitted to any remote server or cloud database.
                </p>
              </div>

              {/* Local Storage Stats */}
              <div className="p-4 rounded-2xl bg-[#0e1f18]/80 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-[#fbf8f1]">
                    <HardDrive className="w-4 h-4 text-[#d4af37]" />
                    <span>Device Storage (IndexedDB)</span>
                  </div>
                  <span className="text-[#d4af37] font-mono">
                    {storageInfo ? `${storageInfo.usageMB} MB` : 'Active'}
                  </span>
                </div>
                <p className="text-[11px] text-white/60">
                  Compositions you choose to save are kept in your browser's private storage sandbox.
                </p>
                <button
                  onClick={handleClearStorage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 hover:bg-red-900/60 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Saved Photos</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-3 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0e1f18] border border-[#d4af37]/40 mx-auto flex items-center justify-center text-[#d4af37] shadow-lg">
                <Camera className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-display font-bold text-lg tracking-wider text-[#fbf8f1]">
                  PHOTOJAH
                </h4>
                <p className="font-serif-vintage italic text-xs text-[#d4af37]">
                  Vintage Photo Booth • PWA
                </p>
                <p className="text-[11px] text-white/50 mt-1">
                  "Capture. Create. Keep."
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#0e1f18]/60 border border-white/5 text-[11px] text-white/70 text-left leading-relaxed space-y-1.5">
                <p>✦ <strong>12 Instant Formats:</strong> Classic, Wide, Strips, Grids & Collages.</p>
                <p>✦ <strong>15 Film Stocks:</strong> Sepia, Tri-X, Polaroid 600, Kodak 70s, Disposable 90s.</p>
                <p>✦ <strong>Print Density:</strong> 300 DPI high-resolution canvas output.</p>
                <p>✦ <strong>PWA Ready:</strong> Installable on Android, iPad, iPhone, and Desktop.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#d4af37] text-[#0e1f18] font-bold text-xs hover:brightness-110 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
