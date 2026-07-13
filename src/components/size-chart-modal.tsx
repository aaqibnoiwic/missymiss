"use client";

import Image from "next/image";
import { Ruler, X } from "lucide-react";
import { useEffect, useState } from "react";

export function SizeChartModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    document.body.dataset.sizeChartOpen = "true";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      delete document.body.dataset.sizeChartOpen;
    };
  }, [open]);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-charcoal)] underline decoration-[color:var(--color-gold-deep)] underline-offset-4 transition hover:text-[color:var(--color-gold-deep)]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Ruler className="size-4" />
        Know your size
      </button>
      {open ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-6 backdrop-blur-sm sm:items-center sm:pt-4"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <div
            className="relative my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close size chart"
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:bg-[color:var(--color-paper)]"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X className="size-5" />
            </button>
            <div className="max-h-[88svh] overflow-y-auto rounded-xl">
              <Image
                alt="Missy Miss size chart and body measurement guide"
                className="h-auto w-full rounded-xl"
                height={1536}
                priority
                src="/size-chart.png"
                width={1024}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
