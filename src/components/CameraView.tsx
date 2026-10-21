import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Upload,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import {
  captureFrameFromVideo,
  getAvailableCameras,
  isCameraSupported,
  startCameraStream,
  stopCameraStream,
} from '../utils/camera';
import { sound } from '../utils/audio';

interface Props {
  currentPhotoIndex: number;
  totalPhotosNeeded: number;
  onPhotoCaptured: (dataUrl: string) => void;
  onCancel: () => void;
  defaultTimer?: 0 | 3 | 5 | 10;
  defaultFacingMode?: 'user' | 'environment';
  isBurstMode?: boolean;
}

export const CameraView: React.FC<Props> = ({
  currentPhotoIndex,
  totalPhotosNeeded,
  onPhotoCaptured,
  onCancel,
  defaultTimer = 3,
  defaultFacingMode = 'user',
  isBurstMode = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5 | 10>(isBurstMode ? 3 : defaultTimer);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [burstNextPrompt, setBurstNextPrompt] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraCount, setCameraCount] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  // Initialize camera
  const initCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraError(null);

    // Stop existing stream if any
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }

    try {
      if (!isCameraSupported()) {
        throw new Error('Camera is not supported on this browser or platform.');
      }

      const stream = await startCameraStream(facingMode);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Detect available cameras
      const devices = await getAvailableCameras();
      setCameraCount(devices.length);
    } catch (err: unknown) {
      const e = err as Error;
      setCameraError(e.message || 'Unable to access camera.');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        stopCameraStream(streamRef.current);
        streamRef.current = null;
      }
    };
  }, [initCamera]);

  // Flip camera between front & back
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Perform the actual instant snapshot
  const triggerCapture = useCallback(() => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);

    // Shutter flash animation & sound
    setShowFlash(true);
    sound.playShutterSound();

    setTimeout(() => {
      try {
        if (videoRef.current) {
          const mirror = facingMode === 'user';
          const capturedDataUrl = captureFrameFromVideo(videoRef.current, mirror);
          onPhotoCaptured(capturedDataUrl);
        }
      } catch (err) {
        console.error('Failed to capture frame', err);
        setCameraError('Capture failed. Please try again.');
      } finally {
        setShowFlash(false);
        setIsCapturing(false);
        setCountdown(null);
      }
    }, 150);
  }, [facingMode, isCapturing, onPhotoCaptured]);

  // Handle capture button press (with countdown timer if set)
  const handleCaptureClick = () => {
    if (isCapturing || countdown !== null) return;

    if (timerDuration === 0) {
      triggerCapture();
      return;
    }

    // Start animated countdown
    let remaining = timerDuration;
    setCountdown(remaining);
    sound.playCountdownTick(false);

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
        sound.playCountdownTick(remaining === 1);
      } else {
        clearInterval(interval);
        setCountdown(null);
        triggerCapture();
      }
    }, 1000);
  };

  // In Burst Mode, automatically kick off the next photo countdown
  useEffect(() => {
    if (!isBurstMode || isCapturing || countdown !== null || isLoading || cameraError) return;

    if (currentPhotoIndex > 0 && currentPhotoIndex < totalPhotosNeeded) {
      setBurstNextPrompt(`Pose #${currentPhotoIndex + 1}: Strike a pose!`);
      const t = setTimeout(() => {
        setBurstNextPrompt(null);
        // Start countdown
        let remaining = timerDuration || 3;
        setCountdown(remaining);
        sound.playCountdownTick(false);
        const interval = setInterval(() => {
          remaining -= 1;
          if (remaining > 0) {
            setCountdown(remaining);
            sound.playCountdownTick(remaining === 1);
          } else {
            clearInterval(interval);
            setCountdown(null);
            triggerCapture();
          }
        }, 1000);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [currentPhotoIndex, isBurstMode, totalPhotosNeeded, isLoading, cameraError, timerDuration, triggerCapture]);

  // Fallback: file upload if camera is blocked/denied
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          sound.playShutterSound();
          onPhotoCaptured(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0a1712] flex flex-col justify-between overflow-hidden select-none">
      {/* Visual Flash Overlay */}
      {showFlash && (
        <div className="absolute inset-0 z-50 bg-white camera-flash-overlay pointer-events-none" />
      )}

      {/* Top Controls Bar */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white/90 hover:text-white text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* Multi-Photo Progress Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/30">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPhotosNeeded }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < currentPhotoIndex
                    ? 'bg-[#d4af37]'
                    : i === currentPhotoIndex
                    ? 'bg-amber-300 ring-2 ring-[#d4af37] animate-pulse'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-[#fbf8f1] tracking-wider ml-1">
            Photo {currentPhotoIndex + 1} of {totalPhotosNeeded}
          </span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            sound.setEnabled(next);
            setSoundEnabled(next);
          }}
          className="p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white/90 hover:text-white cursor-pointer"
          title={soundEnabled ? 'Mute shutter sound' : 'Enable shutter sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#d4af37]" /> : <VolumeX className="w-4 h-4 text-white/50" />}
        </button>
      </div>

      {/* Viewfinder Frame / Live Video Feed */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Vintage Viewfinder Overlay Corners */}
        <div className="relative w-full max-w-xl aspect-[3/4] sm:aspect-square max-h-[72vh] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
              <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37]" />
              <p className="text-sm font-medium">Powering vintage optics...</p>
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-sm space-y-4 text-white">
              <div className="w-12 h-12 rounded-full bg-amber-900/50 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-amber-200">Camera Access Needed</h3>
              <p className="text-xs text-white/70 leading-relaxed">{cameraError}</p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={initCamera}
                  className="px-4 py-2 rounded-xl bg-[#d4af37] text-[#0e1f18] text-xs font-bold hover:brightness-110 cursor-pointer"
                >
                  Try Again
                </button>
                <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold hover:bg-white/20 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo From Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-200 ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
          )}

          {/* Viewfinder Grid & Corner Marks */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-2 border-l-2 border-[#d4af37]/60 rounded-tl-sm" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-[#d4af37]/60 rounded-tr-sm" />
            </div>
            {/* Center target crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-40">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60" />
            </div>
            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-2 border-l-2 border-[#d4af37]/60 rounded-bl-sm" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-[#d4af37]/60 rounded-br-sm" />
            </div>
          </div>

          {/* Burst Mode Next Pose Prompt */}
          {burstNextPrompt && (
            <div className="absolute inset-x-6 top-8 z-30 flex items-center justify-center">
              <div className="px-5 py-2.5 rounded-2xl bg-[#d4af37] text-[#0e1f18] font-bold text-sm shadow-2xl animate-bounce flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0e1f18]" />
                <span>{burstNextPrompt}</span>
              </div>
            </div>
          )}

          {/* Large Animated Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <div className="w-32 h-32 rounded-full border-4 border-[#d4af37] bg-[#0e1f18]/80 flex items-center justify-center shadow-2xl animate-ping-once">
                <span className="font-display font-black text-6xl text-[#fbf8f1] drop-shadow-lg">
                  {countdown}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Camera Controls Bar */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-6 pt-3 pb-8 flex flex-col items-center gap-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Timer Selector Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <Clock className="w-3.5 h-3.5 ml-2 text-[#d4af37]" />
          {([0, 3, 5, 10] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setTimerDuration(sec)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                timerDuration === sec
                  ? 'bg-[#d4af37] text-[#0e1f18] shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {sec === 0 ? 'Off' : `${sec}s`}
            </button>
          ))}
        </div>

        {/* Primary Shutter Row */}
        <div className="w-full flex items-center justify-around">
          {/* File Upload Option */}
          <label
            className="p-3.5 rounded-full bg-white/10 border border-white/10 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
            title="Upload photo from device"
          >
            <Upload className="w-5 h-5 text-amber-200" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Big Vintage Shutter Button */}
          <button
            onClick={handleCaptureClick}
            disabled={isCapturing || countdown !== null}
            aria-label="Capture photograph"
            className="relative group p-2 rounded-full cursor-pointer disabled:opacity-50 active:scale-95 transition"
          >
            {/* Outer brass ring */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-[#d4af37] p-1 bg-gradient-to-b from-[#1b3d30] to-[#0e1f18] flex items-center justify-center shadow-2xl group-hover:border-amber-300 transition">
              {/* Inner red mechanical shutter button */}
              <div className="w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-gradient-to-b from-[#d64545] to-[#992222] border-2 border-[#ff7878]/50 flex items-center justify-center shadow-inner group-hover:brightness-110 active:brightness-90 transition">
                <Camera className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </button>

          {/* Flip Camera Switch */}
          <button
            onClick={handleToggleCamera}
            disabled={cameraCount <= 1 && !cameraError}
            className="p-3.5 rounded-full bg-white/10 border border-white/10 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer disabled:opacity-40"
            title="Switch between front and rear cameras"
          >
            <RefreshCw className="w-5 h-5 text-amber-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
