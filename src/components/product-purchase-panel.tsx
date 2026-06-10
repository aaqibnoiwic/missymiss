"use client";

import type { ProductVariant } from "@prisma/client";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";

function money(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);
}

export function ProductPurchasePanel({
  product,
  variants,
}: {
  product: { id: string; slug: string; name: string; featuredImage: string; price: number };
  variants: ProductVariant[];
}) {
  const available = variants.filter((variant) => variant.isEnabled);
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const selected = available.find((variant) => variant.id === variantId);

  function add() {
    if (!selected) return;
    addItem({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantName: selected.title || [selected.color, selected.size].filter(Boolean).join(" / "),
      sku: selected.sku,
      imageUrl: product.featuredImage,
      price: selected.price,
      quantity: 1,
      inventory: selected.inventory,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      <p className="font-display text-3xl text-[color:var(--color-charcoal)]">{money(selected?.price ?? product.price)}</p>
      {available.length ? (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[color:var(--color-muted-foreground)]">Choose option</p>
          <div className="flex flex-wrap gap-2">
            {available.map((variant) => (
              <button
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${variant.id === variantId ? "border-[color:var(--color-gold-deep)] bg-[color:var(--color-paper)]" : "border-[color:var(--color-border-strong)] bg-white"}`}
                disabled={variant.inventory < 1}
                key={variant.id}
                onClick={() => setVariantId(variant.id)}
              >
                {variant.title || [variant.color, variant.size].filter(Boolean).join(" / ")}
                {variant.inventory < 1 ? " - Sold out" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Variants are being prepared. Check back soon.</p>
      )}
      <Button className="w-full" disabled={!selected || selected.inventory < 1} onClick={add} size="lg">
        {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
        {added ? "Added to bag" : "Add to bag"}
      </Button>
      {selected ? <p className="text-xs text-[color:var(--color-muted-foreground)]">{selected.inventory} available · SKU {selected.sku}</p> : null}
    </div>
  );
}
