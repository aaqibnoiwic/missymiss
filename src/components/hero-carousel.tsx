"use client";

import type { Banner } from "@prisma/client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isExternalOptimizedImage } from "@/components/cdn-aware-image";
import { buttonVariants } from "@/components/ui/button-variants";
import { bannerShowsText } from "@/lib/banner-display";

export type HeroSlide = Pick<
  Banner,
  "id" | "title" | "subtitle" | "ctaLabel" | "ctaHref" | "desktopImage" | "mobileImage" | "presentation" | "textAlignment"
>;

// Shown when no enabled home hero banner exists in the CMS.
const FALLBACK_SLIDE: HeroSlide = {
  id: "fallback",
  title: "Missy Miss — Discover your everyday elegance",
  subtitle: "",
  ctaLabel: "",
  ctaHref: "/shop",
  desktopImage: "/hero/missy-miss-hero.png",
  mobileImage: "/hero/missy-miss-hero-portrait.png",
  presentation: "image",
  textAlignment: "center",
};

const ALIGNMENT = {
  left: "items-start text-left md:mr-auto",
  center: "items-center text-center mx-auto",
  right: "items-end text-right md:ml-auto",
} as const;

const SCRIM = {
  left: "md:bg-[linear-gradient(90deg,rgba(20,20,20,.6),rgba(20,20,20,.15)_60%,transparent)]",
  center: "md:bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,.5),rgba(20,20,20,.1)_70%)]",
  right: "md:bg-[linear-gradient(270deg,rgba(20,20,20,.6),rgba(20,20,20,.15)_60%,transparent)]",
} as const;

function SlideImage({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  const desktop = slide.desktopImage || slide.mobileImage;
  const mobile = slide.mobileImage || slide.desktopImage;
  if (!desktop) return <div className="absolute inset-0 hero-mesh" />;

  const common = { alt: slide.title, fill: true, priority, sizes: "100vw" };
  const { props: { srcSet: desktopSrcSet } } = getImageProps({ ...common, src: desktop, unoptimized: isExternalOptimizedImage(desktop) });
  const { props: { srcSet: mobileSrcSet, ...img } } = getImageProps({ ...common, src: mobile, unoptimized: isExternalOptimizedImage(mobile) });

  // <picture> art direction: each device downloads only its own artwork.
  return (
    <picture>
      <source media="(min-width: 768px)" sizes="100vw" srcSet={desktopSrcSet ?? desktop} />
      <source sizes="100vw" srcSet={mobileSrcSet ?? mobile} />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img} className="object-cover object-center" />
    </picture>
  );
}

export function HeroCarousel({ banners }: { banners: HeroSlide[] }) {
  const slides = banners.length ? banners : [FALLBACK_SLIDE];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const interval = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(interval);
  }, [slides.length, paused]);

  const go = (index: number) => setActive((index + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      className="relative border-b border-[color:var(--color-border)] bg-[#efe3c6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/5] max-h-[85svh] w-full overflow-hidden md:aspect-[1984/528] md:max-h-none">
        {slides.map((slide, index) => {
          const showText = bannerShowsText(slide.presentation) && Boolean(slide.title || slide.subtitle);
          const showButton = Boolean(slide.ctaLabel);
          const href = slide.ctaHref || "/shop";
          const align = (slide.textAlignment in ALIGNMENT ? slide.textAlignment : "left") as keyof typeof ALIGNMENT;
          const Heading = index === 0 ? "h1" : "h2";

          return (
            <div
              aria-hidden={index !== active}
              aria-roledescription="slide"
              className={`absolute inset-0 transition-opacity duration-700 ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
              key={slide.id}
            >
              <SlideImage priority={index === 0} slide={slide} />
              {/* Without a button the whole banner is the link. */}
              {!showButton ? (
                <Link aria-label={slide.title || "Shop the collection"} className="absolute inset-0" href={href} tabIndex={index === active ? 0 : -1} />
              ) : null}
              {!showText && index === 0 ? <h1 className="sr-only">{slide.title}</h1> : null}

              {showText || showButton ? (
                <>
                  {showText ? (
                    <div className={`pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(20,20,20,.7),rgba(20,20,20,.1)_60%,transparent)] ${SCRIM[align]}`} />
                  ) : null}
                  <div className={`pointer-events-none relative mx-auto flex h-full max-w-7xl px-6 pb-14 md:items-center md:px-10 md:pb-0 lg:px-16 ${showText ? "items-end" : "items-end md:items-end md:pb-10"}`}>
                    <div className={`flex w-full flex-col gap-4 md:max-w-xl ${ALIGNMENT[align]}`}>
                      {showText ? (
                        <>
                          {slide.title ? <Heading className="font-display text-4xl leading-[.95] tracking-[-.04em] text-white drop-shadow-sm sm:text-5xl lg:text-6xl">{slide.title}</Heading> : null}
                          {slide.subtitle ? <p className="max-w-lg text-base leading-7 text-white/85 md:text-lg">{slide.subtitle}</p> : null}
                        </>
                      ) : null}
                      {showButton ? (
                        <Link className={buttonVariants({ className: "pointer-events-auto mt-1", size: "lg" })} href={href} tabIndex={index === active ? 0 : -1}>
                          {slide.ctaLabel}
                          <ArrowRight className="size-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 md:bottom-5">
          <button aria-label="Previous banner" className="hidden size-9 items-center justify-center rounded-full bg-white/80 text-[color:var(--color-charcoal)] shadow-sm backdrop-blur transition hover:bg-white md:flex" onClick={() => go(active - 1)} type="button">
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur">
            {slides.map((slide, index) => (
              <button
                aria-current={index === active}
                aria-label={`Show banner ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-[color:var(--color-gold-deep)]" : "w-1.5 bg-[color:var(--color-charcoal)]/30"}`}
                key={slide.id}
                onClick={() => go(index)}
                type="button"
              />
            ))}
          </div>
          <button aria-label="Next banner" className="hidden size-9 items-center justify-center rounded-full bg-white/80 text-[color:var(--color-charcoal)] shadow-sm backdrop-blur transition hover:bg-white md:flex" onClick={() => go(active + 1)} type="button">
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
