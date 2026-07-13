import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { prisma } from "@/lib/db";
import { fetchCheckoutOrderDetails } from "@/lib/shiprocket-checkout";
import { upsertShiprocketCheckoutOrder } from "@/lib/shiprocket-checkout-orders";
import { syncOrderToShiprocket } from "@/lib/shiprocket-order-sync";

function money(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; oid?: string; ost?: string }>;
}) {
  const { order, oid, ost } = await searchParams;
  const orderNumber = oid || order || "";

  if (oid) {
    const checkoutOrder = await fetchCheckoutOrderDetails(oid).catch(() => null);
    if (checkoutOrder) {
      const syncedOrder = await upsertShiprocketCheckoutOrder(checkoutOrder).catch(() => null);
      if (syncedOrder) {
        await syncOrderToShiprocket(syncedOrder.id).catch((error) => {
          console.error("Shiprocket shipping sync failed", error);
        });
      }
    }
  }

  const savedOrder = orderNumber
    ? await prisma.order.findFirst({
        where: { OR: [{ orderNumber }, { checkoutOrderId: orderNumber }] },
        include: { items: true },
      })
    : null;

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-6 py-16 text-center">
      <div className="w-full rounded-[2.5rem] border border-[color:var(--color-border)] bg-white/85 p-10 shadow-[0_24px_80px_rgba(117,96,58,.1)]">
        <CheckCircle2 className="mx-auto size-12 text-[color:var(--color-gold-deep)]" />
        <p className="section-label mt-6">Order received</p>
        <h1 className="mt-3 font-display text-5xl tracking-[-.05em]">Thank you for shopping with purpose.</h1>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-[color:var(--color-muted-foreground)]">
          {orderNumber ? `Order ${orderNumber} is saved.` : "Your order is saved."} We will confirm it and share Shiprocket tracking once dispatch begins.
        </p>
        {savedOrder ? (
          <div className="mt-8 rounded-[1.5rem] bg-[color:var(--color-paper)] p-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[color:var(--color-muted-foreground)]">Recent order</p>
                <h2 className="mt-1 font-display text-2xl">{savedOrder.orderNumber}</h2>
              </div>
              <p className="font-semibold">{money(savedOrder.total)}</p>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[color:var(--color-muted-foreground)]">
              <p>Status: {ost || savedOrder.status}</p>
              <p>Payment: {savedOrder.paymentMethod || "Shiprocket Checkout"} · {savedOrder.paymentStatus}</p>
              {savedOrder.customerPhone ? <p>Phone: {savedOrder.customerPhone}</p> : null}
            </div>
            {savedOrder.items.length ? (
              <div className="mt-5 grid gap-2 text-sm">
                {savedOrder.items.map((item) => (
                  <p className="flex justify-between gap-4" key={item.id}>
                    <span>{item.quantity} × {item.productName}</span>
                    <span>{money(item.total)}</span>
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <Link className={buttonVariants({ className: "mt-8" })} href="/shop">Continue shopping</Link>
      </div>
    </main>
  );
}
