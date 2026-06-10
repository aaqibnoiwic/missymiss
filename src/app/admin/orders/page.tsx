import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getRecommendedCouriers, isShiprocketShippingConfigured } from "@/lib/shiprocket";

function addressValue(address: unknown, key: string) {
  if (!address || typeof address !== "object") return "";
  return String((address as Record<string, unknown>)[key] ?? "");
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({ include: { items: { include: { variant: true } }, shipment: true }, orderBy: { createdAt: "desc" } });
  const shippingReady = isShiprocketShippingConfigured();
  const courierEntries = shippingReady
    ? await Promise.all(orders.filter((order) => order.shipment?.shiprocketShipmentId).map(async (order) => {
        const deliveryPostcode = addressValue(order.shippingAddress, "pincode");
        if (!deliveryPostcode || !process.env.SHIPROCKET_PICKUP_POSTCODE) return [order.id, []] as const;
        const result = await getRecommendedCouriers({
          deliveryPostcode,
          pickupPostcode: process.env.SHIPROCKET_PICKUP_POSTCODE,
          cod: order.paymentMethod.toLowerCase().includes("cod"),
          weight: Math.max(order.items.reduce((sum, item) => sum + (item.variant?.weight ?? 0) * item.quantity, 0) / 1000, 0.1),
        }).catch(() => null);
        const options = result?.data?.available_courier_companies?.slice(0, 8).map((courier) => ({
          id: String(courier.courier_company_id ?? ""),
          name: String(courier.courier_name ?? "Courier"),
          detail: `₹${courier.rate ?? "-"} · ${courier.etd ?? "ETA pending"}`,
        })) ?? [];
        return [order.id, options] as const;
      }))
    : [];
  return <AdminShell eyebrow="Operations" title="Orders & fulfillment"><OrdersManager couriers={Object.fromEntries(courierEntries)} orders={orders} shippingReady={shippingReady} /></AdminShell>;
}
