"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { allowedFolders, type MediaAsset } from "@/types/media";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";

type ImageUploadFieldProps = {
  defaultValue?: string | null;
  folder?: (typeof allowedFolders)[number];
  label: string;
  name: string;
};

export function ImageUploadField({
  defaultValue,
  folder = "missy-miss/editorial",
  label,
  name,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [preview, setPreview] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    setUrl(defaultValue ?? "");
    setPreview(defaultValue ?? "");
  }, [defaultValue]);

  // Clears the success message on its own so it doesn't linger stale if the field is
  // later edited by pasting a URL instead of uploading again.
  useEffect(() => {
    if (!isUploaded) return;
    const timeout = window.setTimeout(() => setIsUploaded(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [isUploaded]);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsUploaded(false);
    setError("");

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("alt", label);

    const response = await fetch("/api/admin/media/upload", {
      body: formData,
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | { asset?: MediaAsset; error?: string }
      | null;

    URL.revokeObjectURL(localPreview);

    if (!response.ok || !payload?.asset) {
      setError(payload?.error ?? "Image upload failed.");
      setIsUploading(false);
      return;
    }

    setUrl(payload.asset.url);
    setPreview(payload.asset.url);
    setIsUploading(false);
    setIsUploaded(true);
  }

  return (
    <div className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
      <span>{label}</span>
      <input name={name} type="hidden" value={url} />
      <input
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={uploadImage}
        type="file"
      />
      <button
        className="group flex min-h-40 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white/80 p-4 text-center transition hover:border-[color:var(--color-gold-deep)] hover:bg-[color:var(--color-paper)]"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {preview ? (
          <span className="relative mb-3 block aspect-[16/9] w-full overflow-hidden rounded-xl bg-[color:var(--color-paper)]">
            <Image
              alt={label}
              className="object-cover"
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              src={preview}
              unoptimized={preview.startsWith("blob:")}
            />
          </span>
        ) : (
          <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(212,175,55,0.22),rgba(255,255,255,0.98))] text-[color:var(--color-gold-deep)]">
            <ImagePlus className="size-5" />
          </span>
        )}
        <span className="flex items-center gap-2 font-semibold">
          {isUploading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Uploading image...
            </>
          ) : isUploaded ? (
            <span className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="size-4" />
              Image uploaded successfully
            </span>
          ) : (
            "Click to upload image"
          )}
        </span>
        {url ? (
          <span className="mt-2 max-w-full truncate text-xs font-normal text-[color:var(--color-muted-foreground)]">
            {url}
          </span>
        ) : null}
      </button>
      <div className="flex gap-2">
        <input
          className="flex h-11 w-full rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm text-[color:var(--color-charcoal)] outline-none transition focus:border-[color:var(--color-gold-deep)]"
          onChange={(event) => {
            setUrl(event.target.value);
            setPreview(event.target.value);
            setIsUploaded(false);
          }}
          placeholder="Or paste image URL"
          type="url"
          value={url}
        />
        <Button
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          Browse
        </Button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
