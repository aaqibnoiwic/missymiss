"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      aria-label={`Shopping bag with ${count} items`}
      className="relative flex size-11 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white/80 transition hover:border-[color:var(--color-gold-deep)] hover:bg-[color:var(--color-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]"
      href="/cart"
    >
      <ShoppingBag className="size-4" />
      {count ? (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[color:var(--color-charcoal)] text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
