"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BatchMediaResponse } from "@/types/media";

export function MultiImageUpload({
  defaultUrls = [],
  onUrlsChange,
}: {
  defaultUrls?: string[];
  onUrlsChange?: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState(defaultUrls);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    onUrlsChange?.(urls);
  }, [onUrlsChange, urls]);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setErrors([]);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("folder", "missy-miss/products");
    formData.append("alt", "Product image");

    try {
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const payload = (await response.json()) as BatchMediaResponse;
      setUrls((current) => [...current, ...(payload.assets ?? []).map((asset) => asset.url)]);
      setErrors((payload.errors ?? []).map((failure) => `${failure.fileName}: ${failure.error}`));
    } catch {
      setErrors(["Images could not be uploaded. Please try again."]);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    setUrls((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function promote(index: number) {
    setUrls((current) => [current[index], ...current.filter((_, itemIndex) => itemIndex !== index)]);
  }

  return (
    <div className="space-y-4">
      {urls.map((url) => <input key={url} name="galleryImageUrls" type="hidden" value={url} />)}
      <input ref={inputRef} accept="image/*" className="hidden" multiple onChange={uploadFiles} type="file" />
      <button
        className="flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white/70 p-5 text-center transition hover:bg-[color:var(--color-paper)]"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {uploading ? <LoaderCircle className="mb-2 size-6 animate-spin" /> : <ImagePlus className="mb-2 size-6" />}
        <span className="font-semibold">{uploading ? `Uploading selected images...` : "Select multiple product images"}</span>
        <span className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">The first image is the featured image. Maximum 8MB per image.</span>
      </button>
      {urls.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {urls.map((url, index) => (
            <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white p-2" key={`${url}-${index}`}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[color:var(--color-paper)]">
                <Image alt={`Product image ${index + 1}`} className="object-cover" fill sizes="240px" src={url} />
                {index === 0 ? <span className="absolute left-2 top-2 rounded-full bg-[color:var(--color-charcoal)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Featured</span> : null}
              </div>
              <div className="mt-2 flex justify-center gap-1">
                <Button aria-label="Move left" disabled={index === 0} onClick={() => move(index, -1)} size="sm" type="button" variant="ghost"><ArrowLeft className="size-4" /></Button>
                <Button aria-label="Make featured" disabled={index === 0} onClick={() => promote(index)} size="sm" type="button" variant="ghost"><Star className="size-4" /></Button>
                <Button aria-label="Move right" disabled={index === urls.length - 1} onClick={() => move(index, 1)} size="sm" type="button" variant="ghost"><ArrowRight className="size-4" /></Button>
                <Button aria-label="Remove image" onClick={() => setUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))} size="sm" type="button" variant="ghost"><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {errors.map((error) => <p className="text-sm text-red-700" key={error}>{error}</p>)}
    </div>
  );
}
