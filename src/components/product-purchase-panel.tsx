"use client";

import type { ProductVariant } from "@prisma/client";
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { isShiprocketCheckoutEnabled, openShiprocketCheckout } from "@/lib/shiprocket-checkout-client";
import { Button } from "@/components/ui/button";

function money(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);
}

export function ProductPurchasePanel({
  initialVariantId = "",
  product,
  variants,
}: {
  initialVariantId?: string;
  product: { id: string; slug: string; name: string; featuredImage: string; price: number; compareAtPrice: number | null; inventory: number; sku: string };
  variants: ProductVariant[];
}) {
  const available = variants.filter((variant) => variant.isEnabled);
  const [variantId, setVariantId] = useState(available.some((variant) => variant.id === initialVariantId) ? initialVariantId : available.find((variant) => variant.inventory > 0)?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { addItem } = useCart();
  const selected = available.find((variant) => variant.id === variantId);
  const inventory = selected?.inventory ?? product.inventory;
  const price = selected?.price ?? product.price;
  const canBuy = available.length ? Boolean(selected && selected.inventory > 0) : product.inventory > 0;

  const sizes = [...new Set(available.map((variant) => variant.size).filter(Boolean))];
  const colors = [...new Set(available.map((variant) => variant.color).filter(Boolean))];
  function choose(key: "size" | "color", value: string) {
    const candidate = available.find((variant) => variant[key] === value && (key === "size" ? !selected?.color || variant.color === selected.color : !selected?.size || variant.size === selected.size) && variant.inventory > 0)
      ?? available.find((variant) => variant[key] === value && variant.inventory > 0);
    if (candidate) { setVariantId(candidate.id); setQuantity(1); }
  }
  function cartItem() {
    return { lineId: selected?.id ?? `product:${product.id}`, variantId: selected?.id, productId: product.id, slug: product.slug, name: product.name, variantName: selected?.title || [selected?.color, selected?.size].filter(Boolean).join(" / ") || "Standard", sku: selected?.sku || product.sku, imageUrl: product.featuredImage, price, quantity, inventory };
  }
  function add() { if (!canBuy) return; addItem(cartItem()); setAdded(true); window.setTimeout(() => setAdded(false), 1600); }
  async function buyNow(event: MouseEvent<HTMLButtonElement>) {
    if (!canBuy) return;
    setCheckoutLoading(true);
    if (isShiprocketCheckoutEnabled()) {
      try {
        const variantId = selected?.id ?? product.id;
        await openShiprocketCheckout(event, [{ variant_id: variantId, quantity }], `${window.location.origin}/products/${product.slug}`);
        setCheckoutLoading(false);
        return;
      } catch {
        // Fall back to the on-site cart checkout if Shiprocket Checkout is unavailable.
      }
    }
    addItem(cartItem());
    window.location.assign("/cart");
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center gap-3"><p className="font-display text-3xl">{money(price)}</p>{product.compareAtPrice && product.compareAtPrice > price ? <><span className="text-lg text-[color:var(--color-muted-foreground)] line-through">{money(product.compareAtPrice)}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{Math.round((1 - price / product.compareAtPrice) * 100)}% off</span></> : null}</div>
    {sizes.length ? <OptionGroup label="Size" options={sizes} selected={selected?.size} onChoose={(value) => choose("size", value)} /> : null}
    {colors.length ? <OptionGroup label="Color" options={colors} selected={selected?.color} onChoose={(value) => choose("color", value)} /> : null}
    {available.length && !sizes.length && !colors.length ? <OptionGroup label="Choose option" options={available.map((variant) => variant.title)} selected={selected?.title} onChoose={(value) => { const variant = available.find((item) => item.title === value); if (variant) setVariantId(variant.id); }} /> : null}
    <div className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-3"><span className="text-sm font-semibold">Quantity</span><div className="flex items-center gap-3"><button aria-label="Decrease quantity" className="flex size-9 items-center justify-center rounded-full border transition hover:bg-[color:var(--color-paper)]" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="size-4" /></button><strong>{quantity}</strong><button aria-label="Increase quantity" className="flex size-9 items-center justify-center rounded-full border transition hover:bg-[color:var(--color-paper)]" onClick={() => setQuantity(Math.min(inventory, quantity + 1))}><Plus className="size-4" /></button></div></div>
    <div className="grid gap-3 sm:grid-cols-2"><Button disabled={!canBuy} onClick={add} size="lg" variant="outline">{added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}{added ? "Added to cart" : "Add to cart"}</Button><Button disabled={!canBuy || checkoutLoading} onClick={buyNow} size="lg"><Zap className="size-4" />{checkoutLoading ? "Starting checkout..." : "Buy now"}</Button></div>
    <p className={`text-sm font-semibold ${canBuy ? "text-emerald-700" : "text-red-700"}`}>{canBuy ? `${inventory} in stock` : "Currently sold out"}{selected?.sku || product.sku ? ` · SKU ${selected?.sku || product.sku}` : ""}</p>
    <div className="grid gap-2 text-sm text-[color:var(--color-muted-foreground)] sm:grid-cols-2"><p className="flex items-center gap-2"><Truck className="size-4" />Secure tracked delivery</p><p className="flex items-center gap-2"><ShieldCheck className="size-4" />Protected checkout</p></div>
  </div>;
}

function OptionGroup({ label, onChoose, options, selected }: { label: string; onChoose: (value: string) => void; options: string[]; selected?: string }) {
  return <div className="space-y-3"><p className="text-xs font-bold uppercase tracking-[.25em] text-[color:var(--color-muted-foreground)]">{label}</p><div className="flex flex-wrap gap-2">{options.map((option) => <button className={`rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[color:var(--color-gold-deep)] ${option === selected ? "border-[color:var(--color-gold-deep)] bg-[color:var(--color-paper)]" : "border-[color:var(--color-border-strong)] bg-white"}`} key={option} onClick={() => onChoose(option)}>{option}</button>)}</div></div>;
}
