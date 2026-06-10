import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-6 py-16 text-center">
      <div className="w-full rounded-[2.5rem] border border-[color:var(--color-border)] bg-white/85 p-10 shadow-[0_24px_80px_rgba(117,96,58,.1)]">
        <CheckCircle2 className="mx-auto size-12 text-[color:var(--color-gold-deep)]" />
        <p className="section-label mt-6">Order received</p>
        <h1 className="mt-3 font-display text-5xl tracking-[-.05em]">Thank you for shopping with purpose.</h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-[color:var(--color-muted-foreground)]">Shiprocket will send your confirmation and delivery updates using the contact details provided at checkout.</p>
        <Link className={buttonVariants({ className: "mt-8" })} href="/shop">Continue shopping</Link>
      </div>
    </main>
  );
}
