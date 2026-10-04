"use client";

import Link from "next/link";
import type { Product, ProductImage, ProductVariant } from "@prisma/client";
import { Check, ShoppingBag, Zap } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { isShiprocketCheckoutEnabled, openShiprocketCheckout } from "@/lib/shiprocket-checkout-client";
import { Button } from "@/components/ui/button";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";

type ProductCardProps = {
  product: Product & { images?: ProductImage[]; variants?: ProductVariant[] };
};

function money(price: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { currency, style: "currency" }).format(price / 100);
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.featuredImage || product.images?.[0]?.imageUrl;
  const available = product.variants?.filter((variant) => variant.isEnabled) ?? [];
  const [variantId, setVariantId] = useState("");
  const [added, setAdded] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { addItem } = useCart();
  const selected = available.find((variant) => variant.id === variantId);
  const inventory = selected?.inventory ?? product.inventory;
  const price = selected?.price ?? product.price;
  const canAdd = available.length ? Boolean(selected && selected.inventory > 0) : product.inventory > 0;
  const productUrl = `/products/${product.slug}${selected ? `?variant=${selected.id}` : ""}`;

  function add() {
    if (!canAdd) return;
    addItem({
      lineId: selected?.id ?? `product:${product.id}`,
      variantId: selected?.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantName: selected?.title || [selected?.color, selected?.size].filter(Boolean).join(" / ") || "Standard",
      sku: selected?.sku || product.sku,
      imageUrl: image ?? "",
      price,
      quantity: 1,
      inventory,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  async function buyNow(event: MouseEvent<HTMLButtonElement>) {
    if (!canAdd) return;

    if (isShiprocketCheckoutEnabled()) {
      try {
        setCheckoutLoading(true);
        await openShiprocketCheckout(
          event,
          [{ variant_id: selected?.id ?? product.id, quantity: 1 }],
          `${window.location.origin}${productUrl}`,
        );
        return;
      } catch {
        // If checkout script or token creation fails, fall back to the detail page.
      } finally {
        setCheckoutLoading(false);
      }
    }

    window.location.assign(productUrl);
  }

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-white/88 shadow-[0_16px_45px_rgba(116,94,56,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--color-gold-deep)]/40 hover:shadow-[0_26px_70px_rgba(116,94,56,0.16)] focus-within:border-[color:var(--color-gold-deep)] lg:flex lg:h-full lg:flex-col">
      <Link className="relative block h-72 overflow-hidden bg-[color:var(--color-paper)]" href={`/products/${product.slug}${selected ? `?variant=${selected.id}` : ""}`}>
        {image ? <Image alt={product.name} className="object-cover transition-transform duration-700 group-hover:scale-105" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" src={image} /> : <div className="hero-mesh h-full" />}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isNewArrival ? <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">New</span> : null}
          {product.isBestSeller ? <span className="rounded-full bg-[color:var(--color-charcoal)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Bestseller</span> : null}
        </div>
      </Link>
      <div className="flex flex-col gap-4 p-5 lg:flex-1">
        <div>
          <Link className="outline-none hover:text-[color:var(--color-gold-deep)] focus-visible:text-[color:var(--color-gold-deep)]" href={`/products/${product.slug}`}><h3 className="font-display text-2xl">{product.name}</h3></Link>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">{product.shortDescription}</p>
          <div className="mt-3 flex items-center gap-2"><strong>{money(price, product.currency)}</strong>{product.compareAtPrice && product.compareAtPrice > price ? <span className="text-sm text-[color:var(--color-muted-foreground)] line-through">{money(product.compareAtPrice, product.currency)}</span> : null}</div>
        </div>
        {available.length ? <select aria-label={`Choose option for ${product.name}`} className="h-10 w-full rounded-xl border border-[color:var(--color-border-strong)] bg-white px-3 text-sm outline-none focus:border-[color:var(--color-gold-deep)]" onChange={(event) => setVariantId(event.target.value)} value={variantId}><option value="">Choose size / color</option>{available.map((variant) => <option disabled={variant.inventory < 1} key={variant.id} value={variant.id}>{variant.title || [variant.color, variant.size].filter(Boolean).join(" / ")}{variant.inventory < 1 ? " - Sold out" : ""}</option>)}</select> : null}
        <div className="grid grid-cols-2 gap-2 lg:mt-auto">
          <Button disabled={!canAdd} onClick={add} size="sm" type="button" variant="outline">{added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}{added ? "Added" : "Add to cart"}</Button>
          <Button disabled={!canAdd || checkoutLoading} onClick={buyNow} size="sm" type="button">{checkoutLoading ? "Starting..." : <><Zap className="size-4" />Buy now</>}</Button>
        </div>
      </div>
    </article>
  );
}
