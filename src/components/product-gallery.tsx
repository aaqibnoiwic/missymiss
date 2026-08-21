"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import { useProductColorImage } from "@/components/product-color-image-context";

export function ProductGallery({
  images,
  productName,
  selectedImageUrl,
}: {
  images: Array<{ id: string; imageUrl: string; alt: string }>;
  productName: string;
  selectedImageUrl?: string;
}) {
  const colorImage = useProductColorImage()?.selectedImageUrl || "";
  const activeImageUrl = selectedImageUrl || colorImage;
  const displayImages = activeImageUrl && !images.some((image) => image.imageUrl === activeImageUrl)
    ? [...images, { id: "selected-color", imageUrl: activeImageUrl, alt: `${productName} selected color` }]
    : images;
  const selectedIndex = activeImageUrl ? displayImages.findIndex((image) => image.imageUrl === activeImageUrl) : -1;
  const [active, setActive] = useState(selectedIndex >= 0 ? selectedIndex : 0);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (selectedIndex >= 0) setActive(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[active];
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active]);

  const selected = displayImages[active] ?? displayImages[0];
  if (!selected) return <div className="aspect-[4/5] rounded-[2.5rem] bg-[color:var(--color-paper)]" />;

  const showPrevious = () => {
    setActive((current) => (current === 0 ? displayImages.length - 1 : current - 1));
  };

  const showNext = () => {
    setActive((current) => (current === displayImages.length - 1 ? 0 : current + 1));
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    const rail = thumbnailRailRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-paper)]">
        <Image
          alt={selected.alt || productName}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fill
          priority={active === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={selected.imageUrl}
        />
        {displayImages.length > 1 ? (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[color:var(--color-charcoal)] shadow-lg transition hover:bg-white"
              onClick={showPrevious}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-[color:var(--color-charcoal)] shadow-lg transition hover:bg-white"
              onClick={showNext}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>
      {displayImages.length > 1 ? (
        <div className="flex items-center gap-3">
          <button
            aria-label="Scroll thumbnails left"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)]"
            onClick={() => scrollThumbnails("left")}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex gap-3 overflow-x-auto scroll-smooth pb-1" ref={thumbnailRailRef}>
              {displayImages.map((image, index) => (
                <button
                  aria-label={`View image ${index + 1}`}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border ${index === active ? "border-[color:var(--color-gold-deep)]" : "border-[color:var(--color-border)]"}`}
                  key={image.id}
                  onClick={() => setActive(index)}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type="button"
                >
                  <Image alt={image.alt || productName} className="object-cover" fill sizes="80px" src={image.imageUrl} />
                </button>
              ))}
            </div>
          </div>
          <button
            aria-label="Scroll thumbnails right"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)]"
            onClick={() => scrollThumbnails("right")}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
