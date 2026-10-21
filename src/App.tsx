/**
 * PHOTOJAH — Vintage Photo Booth
 * Complete Functional Progressive Web App (PWA)
 * "Capture. Create. Keep."
 */

import React, { useEffect, useState } from 'react';
import {
  AppSettings,
  CaptionSettings,
  CapturedPhoto,
  FilterId,
  FormatId,
  FrameSettings,
  PhotoAdjustments,
} from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CameraView } from './components/CameraView';
import { PhotoReview } from './components/PhotoReview';
import { PhotoEditor } from './components/PhotoEditor';
import { StudioView } from './components/StudioView';
import { FinalPreview } from './components/FinalPreview';
import { LocalGallery } from './components/LocalGallery';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getAllSavedCompositions } from './utils/storage';
import { getFormatDefinition } from './utils/formats';
import { sound } from './utils/audio';

type ScreenStep = 'welcome' | 'camera' | 'review' | 'studio' | 'preview' | 'gallery';

const DEFAULT_SETTINGS: AppSettings = {
  defaultFacingMode: 'user',
  defaultTimer: 3,
  defaultFilter: 'classic-polaroid',
  defaultFormat: 'classic-polaroid',
  defaultFrameColor: 'classic-white',
  soundEffects: true,
  autoSaveToGallery: false,
  exportFormat: 'png',
};

const DEFAULT_FRAME_SETTINGS: FrameSettings = {
  colorId: 'warm-cream',
  colorHex: '#f7f3e9',
  borderThickness: 'standard',
  texture: 'paper',
  showShadow: true,
  slightRotation: false,
  innerRadius: 0,
  showSignature: true,
};

const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  text: 'Memories in bloom',
  subtitle: '',
  showDate: true,
  dateText: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
  showLocation: false,
  locationText: '',
  font: 'handwriting',
  fontSize: 22,
  align: 'center',
  color: '#222629',
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<ScreenStep>('welcome');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('photojah_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Session state
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [targetPhotoCount, setTargetPhotoCount] = useState<number>(1);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [isBurstMode, setIsBurstMode] = useState<boolean>(false);

  // Customization state
  const [selectedFormatId, setSelectedFormatId] = useState<FormatId>('classic-polaroid');
  const [selectedFilterId, setSelectedFilterId] = useState<FilterId>('classic-polaroid');
  const [filterIntensity, setFilterIntensity] = useState<number>(85);
  const [frameSettings, setFrameSettings] = useState<FrameSettings>(DEFAULT_FRAME_SETTINGS);
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(DEFAULT_CAPTION_SETTINGS);

  // Gallery badge
  const [savedCount, setSavedCount] = useState(0);

  // Sync settings & sound
  useEffect(() => {
    sound.setEnabled(settings.soundEffects);
    try {
      localStorage.setItem('photojah_settings', JSON.stringify(settings));
    } catch {
      // Ignored
    }
  }, [settings]);

  // Load saved count
  const refreshSavedCount = async () => {
    const list = await getAllSavedCompositions();
    setSavedCount(list.length);
  };

  useEffect(() => {
    refreshSavedCount();
  }, [currentStep]);

  // Start Session handler
  const handleStartSession = (formatId?: FormatId, isBurst: boolean = false) => {
    const chosenFormat = formatId || settings.defaultFormat || 'classic-polaroid';
    setSelectedFormatId(chosenFormat);
    setSelectedFilterId(settings.defaultFilter || 'classic-polaroid');
    setIsBurstMode(isBurst);

    const fmtDef = getFormatDefinition(chosenFormat);
    setTargetPhotoCount(fmtDef.requiredPhotos);
    setPhotos([]);
    setRetakeIndex(null);
    setCurrentStep('camera');
  };

  // Called when a photo is captured
  const handlePhotoCaptured = (dataUrl: string) => {
    const newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalDataUrl: dataUrl,
      timestamp: Date.now(),
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        vignette: 0,
        grain: 0,
        rotation: 0,
        flipH: false,
      },
    };

    if (retakeIndex !== null) {
      // Retaking a specific photograph
      setPhotos((prev) => {
        const copy = [...prev];
        copy[retakeIndex] = newPhoto;
        return copy;
      });
      setRetakeIndex(null);
      setCurrentStep('review');
    } else {
      // Sequential session capture
      const nextList = [...photos, newPhoto];
      setPhotos(nextList);

      if (nextList.length >= targetPhotoCount) {
        // Completed sequence, go to review
        setCurrentStep('review');
      }
      // Otherwise stay in camera to capture next shot in multi-photo session
    }
  };

  // Retake individual photo from review
  const handleRetakeSinglePhoto = (index: number) => {
    setRetakeIndex(index);
    setCurrentStep('camera');
  };

  // Add another photo
  const handleAddPhoto = () => {
    setRetakeIndex(null);
    setTargetPhotoCount((prev) => prev + 1);
    setCurrentStep('camera');
  };

  // Delete photo from session
  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Re-order photos
  const handleMovePhoto = (from: number, to: number) => {
    setPhotos((prev) => {
      const copy = [...prev];
      const item = copy.splice(from, 1)[0];
      copy.splice(to, 0, item);
      return copy;
    });
  };

  // Save adjustments from PhotoEditor
  const handleSavePhotoAdjustments = (updatedAdj: PhotoAdjustments) => {
    if (editingPhotoIndex !== null) {
      setPhotos((prev) => {
        const copy = [...prev];
        copy[editingPhotoIndex] = {
          ...copy[editingPhotoIndex],
          adjustments: updatedAdj,
        };
        return copy;
      });
      setEditingPhotoIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1f18] text-[#fbf8f1] font-sans antialiased overflow-x-hidden selection:bg-[#d4af37] selection:text-[#0e1f18]">
      {/* Offline Indicator Banner */}
      <OfflineIndicator />

      {/* Screen Routing */}
      {currentStep === 'welcome' && (
        <WelcomeScreen
          onStartSession={handleStartSession}
          onOpenGallery={() => setCurrentStep('gallery')}
          onOpenSettings={() => setShowSettings(true)}
          savedCount={savedCount}
        />
      )}

      {currentStep === 'camera' && (
        <CameraView
          currentPhotoIndex={retakeIndex !== null ? retakeIndex : photos.length}
          totalPhotosNeeded={retakeIndex !== null ? 1 : targetPhotoCount}
          onPhotoCaptured={handlePhotoCaptured}
          onCancel={() => {
            if (photos.length > 0) {
              setCurrentStep('review');
            } else {
              setCurrentStep('welcome');
            }
          }}
          defaultTimer={settings.defaultTimer}
          defaultFacingMode={settings.defaultFacingMode}
          isBurstMode={isBurstMode}
        />
      )}

      {currentStep === 'review' && (
        <PhotoReview
          photos={photos}
          onRetakePhoto={handleRetakeSinglePhoto}
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
          onMovePhoto={handleMovePhoto}
          onEditPhoto={(idx) => setEditingPhotoIndex(idx)}
          onProceed={() => setCurrentStep('studio')}
          onRestartSession={() => {
            if (confirm('Discard current session and restart?')) {
              handleStartSession(selectedFormatId);
            }
          }}
          maxPhotos={6}
        />
      )}

      {currentStep === 'studio' && (
        <StudioView
          photos={photos}
          formatId={selectedFormatId}
          filterId={selectedFilterId}
          filterIntensity={filterIntensity}
          frameSettings={frameSettings}
          captionSettings={captionSettings}
          onUpdateFormat={(newFormat) => {
            setSelectedFormatId(newFormat);
            const def = getFormatDefinition(newFormat);
            if (def.defaultCaption && !captionSettings.text) {
              setCaptionSettings((prev) => ({ ...prev, text: def.defaultCaption }));
            }
          }}
          onUpdateFilter={setSelectedFilterId}
          onUpdateIntensity={setFilterIntensity}
          onUpdateFrame={setFrameSettings}
          onUpdateCaptions={setCaptionSettings}
          onBackToReview={() => setCurrentStep('review')}
          onProceedToPreview={() => setCurrentStep('preview')}
          onRequestCaptureMore={(count) => {
            setTargetPhotoCount(photos.length + count);
            setRetakeIndex(null);
            setCurrentStep('camera');
          }}
        />
      )}

      {currentStep === 'preview' && (
        <FinalPreview
          photos={photos}
          formatId={selectedFormatId}
          filterId={selectedFilterId}
          filterIntensity={filterIntensity}
          frameSettings={frameSettings}
          captionSettings={captionSettings}
          onBackToCustomize={() => setCurrentStep('studio')}
          onStartNewSession={() => handleStartSession(selectedFormatId)}
          onOpenGallery={() => setCurrentStep('gallery')}
        />
      )}

      {currentStep === 'gallery' && (
        <LocalGallery
          onBack={() => setCurrentStep('welcome')}
          onStartNewSession={() => handleStartSession(selectedFormatId)}
        />
      )}

      {/* Photo Editor Overlay Modal */}
      {editingPhotoIndex !== null && photos[editingPhotoIndex] && (
        <PhotoEditor
          photo={photos[editingPhotoIndex]}
          photoIndex={editingPhotoIndex}
          onSave={handleSavePhotoAdjustments}
          onClose={() => setEditingPhotoIndex(null)}
        />
      )}

      {/* Settings & Privacy Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
          onGalleryCleared={refreshSavedCount}
        />
      )}
    </div>
  );
}
