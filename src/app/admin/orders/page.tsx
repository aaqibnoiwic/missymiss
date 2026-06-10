import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminList, AdminListRow, AdminListToolbar, AdminPagination } from "@/components/admin/admin-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { buttonVariants } from "@/components/ui/button-variants";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_PAGE_SIZE, readPage, readQuery } from "@/lib/admin-ui";
import { prisma } from "@/lib/db";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string }> }) {
  await requireAdmin();
  const filters = await searchParams;
  const page = readPage(filters.page), query = readQuery(filters.q), status = readQuery(filters.status);
  const where: Prisma.OrderWhereInput = { ...(query ? { OR: [{ orderNumber: { contains: query, mode: "insensitive" } }, { customerName: { contains: query, mode: "insensitive" } }, { customerEmail: { contains: query, mode: "insensitive" } }] } : {}), ...(status ? { status } : {}) };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, select: { id: true, orderNumber: true, status: true, paymentStatus: true, customerName: true, total: true, createdAt: true, shipment: { select: { status: true } }, _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE }),
    prisma.order.count({ where }),
  ]);
  return <AdminShell eyebrow="Operations" title="Orders"><AdminListToolbar query={query} status={status} statuses={[{ label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Cancelled", value: "cancelled" }]} /><AdminList empty={!orders.length}>{orders.map((order) => <AdminListRow actions={<Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/admin/orders/${order.id}`}>View order</Link>} key={order.id}><div><h2 className="font-semibold">Order {order.orderNumber} · {order.customerName}</h2><p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">₹{(order.total / 100).toFixed(2)} · {order._count.items} items · {order.status} · Payment {order.paymentStatus}{order.shipment ? ` · Shipment ${order.shipment.status}` : ""}</p><p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">{order.createdAt.toLocaleString("en-IN")}</p></div></AdminListRow>)}</AdminList><AdminPagination page={page} query={query} status={status} total={total} /></AdminShell>;
}
