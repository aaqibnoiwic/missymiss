import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReviewsManager } from "@/components/admin/commerce-managers";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) { await requireAdmin(); const { id } = await params; const review = await prisma.productReview.findUnique({ where: { id }, include: { product: true } }); if (!review) notFound(); return <AdminShell eyebrow="Social proof" title={`Edit ${review.authorName}'s review`}><ReviewsManager products={[]} reviews={[review]} showCreate={false} /></AdminShell>; }
