/**
 * Camera utility module for Photojah
 * Handles getUserMedia, stream management, camera switching, and frame capture
 */

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

export function isCameraSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
}

export function isSecureContextEnvironment(): boolean {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export async function getAvailableCameras(): Promise<CameraDeviceInfo[]> {
  if (!isCameraSupported() || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'videoinput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${index + 1}`,
      }));
  } catch {
    return [];
  }
}

export async function startCameraStream(
  facingMode: 'user' | 'environment' = 'user',
  deviceId?: string
): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw new Error('Your browser does not support camera access (MediaDevices API missing).');
  }

  // Desired high-res constraints
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      width: { ideal: 1920, min: 640 },
      height: { ideal: 1080, min: 480 },
      ...(deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: facingMode } }),
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (err: unknown) {
    const e = err as { name?: string; message?: string };
    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
      throw new Error('Camera permission was denied. Please allow camera access in your browser settings to take photos.');
    } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
      throw new Error('No camera device was detected on your phone, tablet, or computer.');
    } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
      throw new Error('Camera is currently in use by another application or tab.');
    } else if (e.name === 'OverconstrainedError') {
      // Fallback with minimal constraints
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    throw new Error(e.message || 'Unable to start camera.');
  }
}

export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  } catch (err) {
    console.warn('Error stopping camera stream', err);
  }
}

/**
 * Capture full-resolution photo frame from HTMLVideoElement
 */
export function captureFrameFromVideo(
  video: HTMLVideoElement,
  mirror: boolean = false
): string {
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context for capture');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.95);
}
