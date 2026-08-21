"use client";

import { ArrowRight, Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { isShiprocketCheckoutEnabled, openShiprocketCheckout } from "@/lib/shiprocket-checkout-client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

function money(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);
}

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCart();
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const checkoutEnabled = isShiprocketCheckoutEnabled();

  async function expressCheckout(event: MouseEvent<HTMLButtonElement>) {
    if (!items.length) return;
    setCheckoutLoading(true);
    setError("");
    if (!checkoutEnabled) {
      setError("Shiprocket Checkout is not configured yet.");
      setCheckoutLoading(false);
      return;
    }
    try {
      await openShiprocketCheckout(
        event,
        items.map((item) => ({ variant_id: item.variantId ?? item.productId, quantity: item.quantity })),
        `${window.location.origin}/cart`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Shiprocket Checkout could not be started.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-14 md:px-10 lg:px-16">
      <p className="section-label">Shopping Bag</p>
      <h1 className="mt-3 font-display text-5xl tracking-[-.05em]">Your considered edit</h1>
      {!items.length ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-[color:var(--color-border-strong)] bg-white/70 p-12 text-center">
          <p className="text-[color:var(--color-muted-foreground)]">Your bag is waiting for something beautiful.</p>
          <Link className={buttonVariants({ className: "mt-6" })} href="/shop">Explore shop</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            {items.map((item) => (
              <article className="grid grid-cols-[6rem_1fr] gap-5 rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-4 sm:grid-cols-[7rem_1fr_auto]" key={item.lineId}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[color:var(--color-paper)]">
                  {item.imageUrl ? <Image alt={item.name} className="object-cover" fill sizes="(max-width: 640px) 96px, 112px" src={item.imageUrl} /> : null}
                </div>
                <div className="space-y-2">
                  <Link className="font-display text-2xl" href={`/products/${item.slug}`}>{item.name}</Link>
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">{item.variantName}</p>
                  <p className="font-semibold">{money(item.price)}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex size-8 items-center justify-center rounded-full border" onClick={() => setQuantity(item.lineId, item.quantity - 1)}><Minus className="size-3" /></button>
                    <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button className="flex size-8 items-center justify-center rounded-full border" onClick={() => setQuantity(item.lineId, item.quantity + 1)}><Plus className="size-3" /></button>
                  </div>
                </div>
                <button aria-label={`Remove ${item.name}`} className="col-start-2 flex size-9 items-center justify-center justify-self-end rounded-full text-[color:var(--color-muted-foreground)] sm:col-start-3" onClick={() => removeItem(item.lineId)}><Trash2 className="size-4" /></button>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] p-6 text-white lg:sticky lg:top-28">
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-white/55">Shiprocket Checkout</p>
              <div className="flex justify-between border-b border-white/15 pb-5"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <p className="text-sm leading-6 text-white/65">
                Continue on Shiprocket&apos;s hosted checkout page for delivery options, address, payment, and tracking-ready order flow.
              </p>
              <Button className="w-full" disabled={checkoutLoading || !items.length} onClick={expressCheckout} size="lg" type="button">
                {checkoutLoading ? "Opening checkout..." : "Open Shiprocket checkout"} <ArrowRight className="size-4" />
              </Button>
              {error ? <p className="rounded-2xl bg-white/10 p-3 text-sm text-white/80">{error}</p> : null}
              <div className="grid gap-2 text-sm text-white/60">
                <p className="flex items-center gap-2"><Truck className="size-4" />Live delivery options</p>
                <p className="flex items-center gap-2"><ShieldCheck className="size-4" />Secure hosted payment flow</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
