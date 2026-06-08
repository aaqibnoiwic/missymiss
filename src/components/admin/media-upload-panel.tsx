"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Copy, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { allowedFolders, type MediaAsset } from "@/types/media";

export function MediaUploadPanel({
  initialAssets,
  storageEnabled,
}: {
  initialAssets: MediaAsset[];
  storageEnabled: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [folder, setFolder] = useState<(typeof allowedFolders)[number]>(
    "missy-miss/products",
  );
  const [alt, setAlt] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  useEffect(() => {
    if (!file) {
      const frame = window.requestAnimationFrame(() => setPreview(null));
      return () => window.cancelAnimationFrame(frame);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    return () => {
      reader.onload = null;
    };
  }, [file]);

  const isDisabled = useMemo(
    () => !storageEnabled || !file || isUploading,
    [storageEnabled, file, isUploading],
  );

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setError(null);
    setSuccess(null);
  }

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", alt);
    formData.append("folder", folder);

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; asset?: MediaAsset }
      | null;

    if (!response.ok || !payload?.asset) {
      setError(payload?.error ?? "Upload failed.");
      setIsUploading(false);
      return;
    }

    setAssets((current) => [payload.asset as MediaAsset, ...current]);
    setFile(null);
    setAlt("");
    setSuccess("Image uploaded and saved to the media library.");
    setIsUploading(false);
  }

  async function copyAsset(asset: MediaAsset) {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          publicId: asset.publicId,
          url: asset.url,
          alt: asset.alt,
          folder: asset.folder,
        },
        null,
        2,
      ),
    );
    setSuccess(`Copied asset details for ${asset.publicId}.`);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/88 p-6 shadow-[0_20px_70px_rgba(117,96,58,0.08)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(212,175,55,0.22),rgba(255,255,255,0.98))] text-[color:var(--color-gold-deep)]">
            <ImagePlus className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-3xl text-[color:var(--color-charcoal)]">
              Upload Media
            </h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Add polished product and editorial visuals to the permanent brand
              library.
            </p>
          </div>
        </div>

        {!storageEnabled ? (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-paper)] px-5 py-4 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
            Media storage is not configured yet. Add the upload credentials in
            your environment to enable this studio.
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-charcoal)]">
              Image file
            </label>
            <Input type="file" accept="image/*" onChange={onFileChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-charcoal)]">
              Collection folder
            </label>
            <select
              value={folder}
              onChange={(event) =>
                setFolder(event.target.value as (typeof allowedFolders)[number])
              }
              className="flex h-12 w-full rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm text-[color:var(--color-charcoal)] outline-none transition focus:border-[color:var(--color-gold-deep)]"
            >
              {allowedFolders.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-charcoal)]">
              Alt text
            </label>
            <Textarea
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Editorial product shot for the women’s launch collection"
              rows={4}
            />
          </div>

          {preview ? (
            <div className="overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-paper)] p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-[1.75rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-paper)]/85 text-sm text-[color:var(--color-muted-foreground)]">
              Choose a file to preview it here.
            </div>
          )}

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <Button
            size="lg"
            onClick={handleUpload}
            disabled={isDisabled}
            className="w-full"
          >
            {isUploading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Save to Media Library
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/88 p-6 shadow-[0_20px_70px_rgba(117,96,58,0.08)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-[color:var(--color-charcoal)]">
              Saved Assets
            </h2>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Recently uploaded images stored in the connected database.
            </p>
          </div>
          <span className="rounded-full bg-[color:var(--color-paper)] px-3 py-1 text-sm font-semibold text-[color:var(--color-charcoal)]">
            {assets.length}
          </span>
        </div>

        {assets.length ? (
          <div className="grid gap-4">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="grid gap-4 rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/55 p-4 sm:grid-cols-[9rem_1fr]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-white">
                  <Image
                    src={asset.url}
                    alt={asset.alt || asset.publicId}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
                      {asset.folder}
                    </span>
                    <span className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
                      {asset.width} x {asset.height}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--color-charcoal)]">
                      {asset.publicId}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                      {asset.alt || "No alt text supplied yet."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-muted-foreground)]">
                    <span>{asset.format.toUpperCase()}</span>
                    <span>{Math.round(asset.bytes / 1024)} KB</span>
                    <span>{new Date(asset.createdAt).toLocaleString()}</span>
                  </div>
                  <Button variant="outline" onClick={() => copyAsset(asset)}>
                    <Copy className="size-4" />
                    Copy Asset JSON
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-56 items-center justify-center rounded-[1.75rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-paper)]/75 px-6 text-center text-sm leading-7 text-[color:var(--color-muted-foreground)]">
            Uploaded assets will appear here so you can reuse their URLs and
            references in future product forms.
          </div>
        )}
      </section>
    </div>
  );
}
