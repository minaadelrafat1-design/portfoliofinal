const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported image type. Use JPG, PNG, WebP, GIF, or SVG.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { valid: false, error: 'Image is too large (max 8MB).' };
  }
  return { valid: true };
}

export function validateVideoFile(file: File): FileValidationResult {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported video type. Use MP4, WebM, Ogg, or MOV.' };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { valid: false, error: 'Video is too large (max 100MB).' };
  }
  return { valid: true };
}

/**
 * Builds a safe storage path for an uploaded file. Never uses the
 * user-supplied filename directly (it could contain path traversal
 * sequences or unexpected characters) — only a whitelisted extension
 * derived from the verified MIME type is kept.
 */
export function buildSafeUploadPath(file: File): string {
  const ext = EXTENSION_BY_TYPE[file.type] ?? 'bin';
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${random}.${ext}`;
}
