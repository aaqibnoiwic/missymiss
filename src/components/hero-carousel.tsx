"use client";

import type { Banner } from "@prisma/client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import { buttonVariants } from "@/components/ui/button-variants";

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);
  const slides = banners.length
    ? banners
    : [
        {
          id: "fallback",
          title: "Fashion With Purpose",
          subtitle: "Premium fashion crafted with elegance, comfort, and a lighter footprint.",
          ctaLabel: "Shop the Collection",
          ctaHref: "/shop",
          desktopImage: "",
          mobileImage: "",
        } as Banner,
      ];

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const slide = slides[active];
  return (
    <section className="relative min-h-[72vh] overflow-hidden border-b border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] text-white">
      {slide.desktopImage ? (
        <>
          <Image alt={slide.title} className="hidden object-cover md:block" fill priority={active === 0} sizes="100vw" src={slide.desktopImage} />
          <Image
            alt={slide.title}
            className="object-cover md:hidden"
            fill
            priority={active === 0}
            sizes="100vw"
            src={slide.mobileImage || slide.desktopImage}
          />
        </>
      ) : (
        <div className="absolute inset-0 hero-mesh opacity-40" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,20,20,.78),rgba(20,20,20,.2),rgba(20,20,20,.08))]" />
      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-end px-6 py-16 md:items-center md:px-10 lg:px-16">
        <div className="max-w-2xl space-y-6 reveal-up">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/70">Missy Miss Editorial</p>
          <h1 className="font-display text-5xl leading-[.95] tracking-[-.05em] sm:text-7xl">{slide.title}</h1>
          <p className="max-w-xl text-lg leading-8 text-white/78">{slide.subtitle}</p>
          <Link className={buttonVariants({ size: "lg" })} href={slide.ctaHref || "/shop"}>
            {slide.ctaLabel || "Discover collection"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 md:right-10 lg:right-16">
          <button aria-label="Previous banner" className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/20 backdrop-blur" onClick={() => setActive((active - 1 + slides.length) % slides.length)}>
            <ArrowLeft className="size-4" />
          </button>
          <span className="px-2 text-xs font-semibold tracking-[.2em]">{active + 1} / {slides.length}</span>
          <button aria-label="Next banner" className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/20 backdrop-blur" onClick={() => setActive((active + 1) % slides.length)}>
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
