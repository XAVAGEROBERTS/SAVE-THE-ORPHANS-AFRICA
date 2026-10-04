"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/supabase/storage";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="form-label">{label}</label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-light aspect-[16/9] bg-light">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="400px"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-light rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-primary animate-spin" />
              <p className="text-sm text-dark/60">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-3 text-dark/40" />
              <p className="text-sm text-dark font-medium mb-1">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-dark/50">PNG, JPG, WEBP up to 5 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <p className="form-error">{error}</p>}

      <div className="mt-3">
        <label className="text-xs text-dark/50 block mb-1">
          Or paste an image URL:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form-input text-sm"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}