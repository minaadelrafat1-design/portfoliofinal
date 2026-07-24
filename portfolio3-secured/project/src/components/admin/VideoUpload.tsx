import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { validateVideoFile, buildSafeUploadPath } from '@/lib/upload';

interface VideoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function VideoUpload({ value, onChange, label = 'Video' }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid file');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const path = buildSafeUploadPath(file);
      const url = await uploadFile(file, path);
      onChange(url);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          {value ? (
            <video src={value} className="h-full w-full object-cover" />
          ) : (
            <Upload size={18} className="text-slate-400" />
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:border-primary dark:border-slate-700"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-2 inline-flex items-center gap-1 text-xs text-red-500"
            >
              <X size={12} /> Remove
            </button>
          )}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-xs dark:border-slate-700"
          placeholder="Or paste video URL"
        />
      )}
    </div>
  );
}
