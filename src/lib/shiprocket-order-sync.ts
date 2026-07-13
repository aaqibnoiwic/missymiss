import { prisma } from "@/lib/db";
import { createShiprocketOrder, isShiprocketShippingConfigured } from "@/lib/shiprocket";

function addressValue(address: unknown, ...keys: string[]) {
  if (!address || typeof address !== "object") return "";
  const data = address as Record<string, unknown>;
  return keys.map((key) => String(data[key] ?? "").trim()).find(Boolean) ?? "";
}

function combinedAddress(address: unknown) {
  return [addressValue(address, "address", "line1"), addressValue(address, "line2")]
    .filter(Boolean)
    .join(", ");
}

function orderItemSku(orderNumber: string, sku: string, index: number) {
  const cleanSku = sku.trim();
  if (cleanSku) return cleanSku.slice(0, 50);
  return `MM-${orderNumber.slice(-8).toUpperCase()}-${index + 1}`;
}

export async function syncOrderToShiprocket(orderId: string) {
  if (!isShiprocketShippingConfigured()) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } }, shipment: true },
  });
  if (!order || order.shiprocketOrderId) return null;

  const packageWeight = order.items.reduce(
    (sum, item) => sum + (item.variant?.weight ?? 0) * item.quantity,
    0,
  );
  const packageLength = Math.max(...order.items.map((item) => item.variant?.length ?? 0), 1);
  const packageBreadth = Math.max(...order.items.map((item) => item.variant?.breadth ?? 0), 1);
  const packageHeight = Math.max(
    order.items.reduce((sum, item) => sum + (item.variant?.height ?? 0) * item.quantity, 0),
    1,
  );
  const shippingAddress = order.shippingAddress ?? order.billingAddress;
  const firstName = addressValue(shippingAddress, "first_name") || order.customerName.split(" ")[0] || "Missy";
  const lastName = addressValue(shippingAddress, "last_name") || order.customerName.split(" ").slice(1).join(" ") || "Miss";
  const billingName =
    order.customerName ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Missy Miss Customer";

  const payload = await createShiprocketOrder({
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().slice(0, 16).replace("T", " "),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: billingName,
    billing_last_name: lastName,
    billing_address: addressValue(shippingAddress, "address", "line1"),
    billing_address_2: addressValue(shippingAddress, "line2"),
    billing_city: addressValue(shippingAddress, "city"),
    billing_pincode: addressValue(shippingAddress, "pincode"),
    billing_state: addressValue(shippingAddress, "state"),
    billing_country: addressValue(shippingAddress, "country") || "India",
    billing_email: order.customerEmail || addressValue(shippingAddress, "email") || "orders@missymiss.in",
    billing_phone: order.customerPhone || addressValue(shippingAddress, "phone"),
    shipping_is_billing: true,
    shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: combinedAddress(shippingAddress),
    shipping_address_2: addressValue(shippingAddress, "line2"),
    shipping_city: addressValue(shippingAddress, "city"),
    shipping_pincode: addressValue(shippingAddress, "pincode"),
    shipping_state: addressValue(shippingAddress, "state"),
    shipping_country: addressValue(shippingAddress, "country") || "India",
    shipping_email: order.customerEmail || addressValue(shippingAddress, "email") || "orders@missymiss.in",
    shipping_phone: order.customerPhone || addressValue(shippingAddress, "phone"),
    order_items: order.items.map((item, index) => ({
      name: item.productName,
      sku: orderItemSku(order.orderNumber, item.sku, index),
      units: item.quantity,
      selling_price: item.unitPrice / 100,
    })),
    payment_method: order.paymentMethod.toLowerCase().includes("cod") ? "COD" : "Prepaid",
    sub_total: order.subtotal / 100,
    length: packageLength,
    breadth: packageBreadth,
    height: packageHeight,
    weight: Math.max(packageWeight / 1000, 0.1),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "approved",
      shiprocketOrderId: String(payload.order_id ?? ""),
      shipment: {
        upsert: {
          create: {
            status: payload.status ?? "created",
            shiprocketShipmentId: String(payload.shipment_id ?? ""),
            rawPayload: JSON.parse(JSON.stringify(payload)),
          },
          update: {
            status: payload.status ?? "created",
            shiprocketShipmentId: String(payload.shipment_id ?? ""),
            rawPayload: JSON.parse(JSON.stringify(payload)),
          },
        },
      },
    },
  });

  return payload;
}
