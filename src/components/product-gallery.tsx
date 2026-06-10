"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  productName,
}: {
  images: Array<{ id: string; imageUrl: string; alt: string }>;
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const selected = images[active];
  if (!selected) return <div className="aspect-[4/5] rounded-[2.5rem] bg-[color:var(--color-paper)]" />;

  return (
    <div className="grid gap-4 lg:grid-cols-[5rem_1fr]">
      <div className="order-2 flex gap-3 overflow-auto lg:order-1 lg:flex-col">
        {images.map((image, index) => (
          <button
            aria-label={`View image ${index + 1}`}
            className={`relative aspect-square min-w-20 overflow-hidden rounded-2xl border ${index === active ? "border-[color:var(--color-gold-deep)]" : "border-[color:var(--color-border)]"}`}
            key={image.id}
            onClick={() => setActive(index)}
          >
            <Image alt={image.alt || productName} className="object-cover" fill src={image.imageUrl} />
          </button>
        ))}
      </div>
      <div className="group relative order-1 aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-paper)] lg:order-2">
        <Image
          alt={selected.alt || productName}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={selected.imageUrl}
        />
      </div>
    </div>
  );
}
