import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'prominent' | 'compact' | 'minimal';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide
  if (isInstalled) return null;

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'prominent') {
      return (
        <button
          onClick={install}
          className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89326] text-[#0e1f18] font-bold text-sm shadow-lg shadow-black/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#0e1f18]" />
          <span>Install Photojah App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1b3d30] border border-[#d4af37]/40 text-[#fbf8f1] hover:bg-[#234d3d] text-xs font-semibold shadow-sm transition cursor-pointer"
        title="Install to your home screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-[#d4af37]/30 text-[#fbf8f1] hover:bg-[#1b3d30] transition cursor-pointer ${
            variant === 'prominent'
              ? 'px-4 py-2.5 bg-[#142e23] text-sm font-semibold'
              : 'px-2.5 py-1 bg-[#142e23]/60 text-xs'
          }`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#142e23] border border-[#d4af37]/40 p-6 shadow-2xl text-[#fbf8f1]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0e1f18] border border-[#d4af37]/40 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <h3 className="text-base font-bold text-[#fbf8f1]">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#fbf8f1]/80 mb-5">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0e1f18]/60 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#1b3d30] flex items-center justify-center font-bold text-[#d4af37] shrink-0">
                    1
                  </div>
                  <p>
                    Tap the <strong>Share</strong> icon <Share className="w-3.5 h-3.5 inline mx-1 text-[#d4af37]" /> at the bottom or top of Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0e1f18]/60 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#1b3d30] flex items-center justify-center font-bold text-[#d4af37] shrink-0">
                    2
                  </div>
                  <p>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0e1f18]/60 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-[#1b3d30] flex items-center justify-center font-bold text-[#d4af37] shrink-0">
                    3
                  </div>
                  <p>
                    Tap <strong>Add</strong> in the top right corner. Photojah will now run fullscreen like a native app!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#d4af37] text-[#0e1f18] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
