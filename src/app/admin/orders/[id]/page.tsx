import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getRecommendedCouriers, isShiprocketShippingConfigured } from "@/lib/shiprocket";

function addressValue(address: unknown, key: string) {
  if (!address || typeof address !== "object") return "";
  return String((address as Record<string, unknown>)[key] ?? "");
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { variant: true } }, shipment: true } });
  if (!order) notFound();
  const shippingReady = isShiprocketShippingConfigured();
  const deliveryPostcode = addressValue(order.shippingAddress, "pincode");
  const result = shippingReady && order.shipment?.shiprocketShipmentId && deliveryPostcode && process.env.SHIPROCKET_PICKUP_POSTCODE
    ? await getRecommendedCouriers({ deliveryPostcode, pickupPostcode: process.env.SHIPROCKET_PICKUP_POSTCODE, cod: order.paymentMethod.toLowerCase().includes("cod"), weight: Math.max(order.items.reduce((sum, item) => sum + (item.variant?.weight ?? 0) * item.quantity, 0) / 1000, 0.1) }).catch(() => null)
    : null;
  const couriers = result?.data?.available_courier_companies?.slice(0, 8).map((courier) => ({ id: String(courier.courier_company_id ?? ""), name: String(courier.courier_name ?? "Courier"), detail: `₹${courier.rate ?? "-"} · ${courier.etd ?? "ETA pending"}` })) ?? [];
  return <AdminShell eyebrow="Operations" title={`Order ${order.orderNumber}`}><OrdersManager couriers={{ [order.id]: couriers }} orders={[order]} shippingReady={shippingReady} /></AdminShell>;
}
