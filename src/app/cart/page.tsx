"use client";

import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent, type MouseEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { isShiprocketCheckoutEnabled, openShiprocketCheckout } from "@/lib/shiprocket-checkout-client";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";

function money(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);
}

export default function CartPage() {
  const { clear, items, removeItem, setQuantity } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expressLoading, setExpressLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const expressCheckoutAvailable = isShiprocketCheckoutEnabled();

  async function expressCheckout(event: MouseEvent<HTMLButtonElement>) {
    if (!items.length) return;
    setExpressLoading(true);
    setError("");
    try {
      await openShiprocketCheckout(
        event,
        items.map((item) => ({ variant_id: item.variantId ?? item.productId, quantity: item.quantity })),
        `${window.location.origin}/cart`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Express checkout could not be started.");
    } finally {
      setExpressLoading(false);
    }
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
        customer: {
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          pincode: formData.get("pincode"),
          country: "India",
          paymentMethod: formData.get("paymentMethod"),
          notes: formData.get("notes"),
        },
      }),
    });
    const payload = (await response.json()) as { redirectUrl?: string; error?: string };
    if (!response.ok || !payload.redirectUrl) {
      setError(payload.error ?? "Order could not be placed.");
      setLoading(false);
      return;
    }
    clear();
    window.location.assign(payload.redirectUrl);
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
                  {item.imageUrl ? <Image alt={item.name} className="object-cover" fill src={item.imageUrl} /> : null}
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
            {expressCheckoutAvailable ? (
              <div className="mb-4 space-y-3">
                <Button className="w-full" disabled={expressLoading || !items.length} onClick={expressCheckout} size="lg" type="button">
                  {expressLoading ? "Opening checkout..." : "Express checkout"} <ArrowRight className="size-4" />
                </Button>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[.25em] text-white/45">
                  <span className="h-px flex-1 bg-white/15" />or<span className="h-px flex-1 bg-white/15" />
                </div>
              </div>
            ) : null}
            <form className="space-y-4" onSubmit={checkout}>
              <p className="text-xs font-bold uppercase tracking-[.25em] text-white/55">Delivery details</p>
              <div className="flex justify-between border-b border-white/15 pb-5"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <Input autoComplete="name" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" name="name" placeholder="Full name" required />
              <Input autoComplete="tel" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" inputMode="tel" name="phone" placeholder="Phone" required />
              <Input autoComplete="email" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" name="email" placeholder="Email" type="email" />
              <Input autoComplete="street-address" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" name="address" placeholder="Address" required />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Input autoComplete="address-level2" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" name="city" placeholder="City" required />
                <Input autoComplete="address-level1" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" name="state" placeholder="State" required />
              </div>
              <Input autoComplete="postal-code" className="border-white/15 bg-white text-[color:var(--color-charcoal)]" inputMode="numeric" maxLength={6} name="pincode" placeholder="Pincode" required />
              <select className="h-12 w-full rounded-2xl border border-white/15 bg-white px-4 text-sm text-[color:var(--color-charcoal)] outline-none" name="paymentMethod" defaultValue="COD">
                <option value="COD">Cash on delivery</option>
                <option value="Prepaid">Prepaid</option>
              </select>
              <Input className="border-white/15 bg-white text-[color:var(--color-charcoal)]" name="notes" placeholder="Order note" />
              <Button className="w-full" disabled={loading} size="lg" type="submit">{loading ? "Placing order..." : "Place order"} <ArrowRight className="size-4" /></Button>
              {error ? <p className="rounded-2xl bg-white/10 p-3 text-sm text-white/80">{error}</p> : null}
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
