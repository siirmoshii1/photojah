export type FilterId =
  | 'original'
  | 'classic-polaroid'
  | 'vintage-warm'
  | 'sepia'
  | 'bw'
  | 'faded-film'
  | 'seventies'
  | 'nineties-disposable'
  | 'cool-film'
  | 'soft-dream'
  | 'instant-camera'
  | 'film-grain'
  | 'golden-hour'
  | 'retro-fade'
  | 'cinematic-vintage';

export type FormatId =
  | 'classic-polaroid'
  | 'wide-polaroid'
  | 'tall-polaroid'
  | 'square-instant'
  | 'three-photo-strip'
  | 'four-photo-strip'
  | 'four-photo-grid'
  | 'vintage-collage'
  | 'wide-booth-strip'
  | 'mini-polaroid'
  | 'double-polaroid'
  | 'contact-sheet'
  | 'twin-strip'
  | 'passport-six'
  | 'film-negative'
  | 'wedding-guestbook'
  | 'bookmark-strip';

export type FrameColorId =
  | 'classic-white'
  | 'warm-cream'
  | 'black'
  | 'kraft'
  | 'pastel-pink'
  | 'sage-green'
  | 'forest-green'
  | 'custom';

export type PaperTexture = 'smooth' | 'paper' | 'linen' | 'aged';

export type CaptionFont = 'handwriting' | 'typewriter' | 'vintage' | 'script' | 'sans';

export interface PhotoCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number; // e.g. 1 (square), 0.75 (3:4), 1.33 (4:3)
}

export interface PhotoAdjustments {
  brightness: number; // -50 to 50, default 0
  contrast: number;   // -50 to 50, default 0
  saturation: number; // -50 to 50, default 0
  warmth: number;     // -50 to 50, default 0
  vignette: number;   // 0 to 100, default 0
  grain: number;      // 0 to 100, default 0
  rotation: number;   // 0, 90, 180, 270 degrees
  flipH: boolean;     // horizontal flip
  crop?: PhotoCrop;
}

export interface CapturedPhoto {
  id: string;
  originalDataUrl: string; // Pristine captured camera frame
  previewDataUrl?: string; // Cache for quick display
  timestamp: number;
  adjustments: PhotoAdjustments;
}

export interface FrameSettings {
  colorId: FrameColorId;
  colorHex: string;
  borderThickness: 'compact' | 'standard' | 'wide';
  texture: PaperTexture;
  showShadow: boolean;
  slightRotation: boolean; // Subtle organic angle (-1.5deg to +1.5deg)
  innerRadius: number; // 0 for sharp instant film, 4-12 for rounded
  showSignature: boolean; // Discreet "PHOTOJAH" badge
}

export interface CaptionSettings {
  text: string;
  subtitle: string;
  showDate: boolean;
  dateText: string;
  showLocation: boolean;
  locationText: string;
  font: CaptionFont;
  fontSize: number; // 12 to 32
  align: 'center' | 'left' | 'right';
  color: string;
}

export interface FilterDefinition {
  id: FilterId;
  name: string;
  subtitle: string;
  description: string;
  category: 'classic' | 'warm' | 'monochrome' | 'retro' | 'moody';
  sampleColor: string;
}

export interface FormatDefinition {
  id: FormatId;
  name: string;
  subtitle: string;
  description: string;
  requiredPhotos: number;
  minPhotos: number;
  maxPhotos: number;
  aspectLabel: string;
  category: 'single' | 'strip' | 'multi';
  defaultCaption: string;
  printSizeNote: string;
}

export interface AppSettings {
  defaultFacingMode: 'user' | 'environment';
  defaultTimer: 0 | 3 | 5 | 10;
  defaultFilter: FilterId;
  defaultFormat: FormatId;
  defaultFrameColor: FrameColorId;
  soundEffects: boolean;
  autoSaveToGallery: boolean;
  exportFormat: 'png' | 'jpeg';
}

export interface SavedComposition {
  id: string;
  dataUrl: string;
  formatId: FormatId;
  formatName: string;
  filterId: FilterId;
  photoCount: number;
  captionText: string;
  createdAt: number;
  fileSizeBytes?: number;
}
