import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] },
    },
  });

  if (!product) notFound();

  const image = product.featuredImage || product.images[0]?.imageUrl;

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[.9fr_1.1fr] lg:px-16">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-paper)]">
        {image ? (
          <Image alt={product.name} className="object-cover" fill src={image} />
        ) : null}
      </div>
      <section className="space-y-6">
        <p className="section-label">
          {product.categories.map((item) => item.category.title).join(" / ") ||
            "Missy Miss"}
        </p>
        <h1 className="font-display text-6xl leading-none tracking-[-0.05em] text-[color:var(--color-charcoal)]">
          {product.name}
        </h1>
        <p className="text-lg leading-8 text-[color:var(--color-muted-foreground)]">
          {product.description || product.shortDescription}
        </p>
        <div className="grid gap-3 rounded-[2rem] border border-[color:var(--color-border)] bg-white/80 p-6 text-sm text-[color:var(--color-muted-foreground)]">
          <p>Sizes: {product.sizes || "Update in admin"}</p>
          <p>Colors: {product.colors || "Update in admin"}</p>
          <p>Inventory: {product.inventory}</p>
        </div>
        <Button size="lg">Add to Cart</Button>
      </section>
    </main>
  );
}
