import { Leaf, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductColorImageProvider } from "@/components/product-color-image-context";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductCard } from "@/components/product-card";
import { SizeChartModal } from "@/components/size-chart-modal";
import { prisma } from "@/lib/db";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { variant = "" } = await searchParams;
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      categories: { include: { category: true } },
      images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] },
      variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
      sizeGuideRows: { orderBy: { sortOrder: "asc" } },
      colorGuideOptions: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!product) notFound();
  const relatedProducts = await prisma.product.findMany({
    where: {
      isPublished: true,
      id: { not: product.id },
      categories: { some: { categoryId: { in: product.categories.map((item) => item.categoryId) } } },
    },
    include: {
      images: { orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] },
      variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });

  const images = [
    ...(product.featuredImage
      ? [{ id: "featured", imageUrl: product.featuredImage, alt: product.name }]
      : []),
    ...product.images.filter((image) => image.imageUrl !== product.featuredImage),
  ];
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  const details = [
    ["Highlights", product.highlights],
    ["Material", product.material],
    ["Fit & silhouette", product.fitDetails],
    ["Care instructions", product.careInstructions],
    ["Size notes", product.sizeGuide],
    ["Shipping & returns", product.shippingReturns],
  ].filter(([, value]) => value);

  return (
    <main>
      <ProductColorImageProvider
        colorOptions={product.colorGuideOptions.map(({ name, imageUrl }) => ({ name, imageUrl }))}
        initialColor={product.variants.find((item) => item.id === variant)?.color || product.colors.split(",")[0]?.trim() || ""}
      >
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-16">
        <ProductGallery images={images} productName={product.name} />
        <div className="space-y-7 lg:sticky lg:top-28 lg:h-fit">
          <p className="section-label">
            {product.categories.map((item) => item.category.title).join(" / ") || "Missy Miss"}
          </p>
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {product.isNewArrival ? <span className="rounded-full bg-[color:var(--color-paper)] px-3 py-1 text-xs font-bold uppercase tracking-wider"><Sparkles className="mr-1 inline size-3" />New arrival</span> : null}
              {product.isBestSeller ? <span className="rounded-full bg-[color:var(--color-charcoal)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Bestseller</span> : null}
              {product.isSustainable ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800"><Leaf className="mr-1 inline size-3" />Sustainable</span> : null}
            </div>
            <h1 className="font-display text-5xl leading-none tracking-[-0.05em] text-[color:var(--color-charcoal)] md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-[color:var(--color-muted-foreground)]">
              {product.shortDescription}
            </p>
          </div>
          {averageRating ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex text-[color:var(--color-gold-deep)]">
                {Array.from({ length: 5 }).map((_, index) => <Star className="size-4" fill={index < Math.round(averageRating) ? "currentColor" : "none"} key={index} />)}
              </span>
              <span>{averageRating.toFixed(1)} from {product.reviews.length} reviews</span>
            </div>
          ) : null}
          <ProductPurchasePanel initialVariantId={variant} product={product} variants={product.variants} />
          <SizeChartModal />
          <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/80 p-6">
            <p className="leading-8 text-[color:var(--color-muted-foreground)]">{product.description}</p>
          </div>
        </div>
      </section>
      </ProductColorImageProvider>

      {product.sizeGuideRows.length || product.colorGuideOptions.length ? (
        <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 md:px-10 lg:grid-cols-[1.1fr_.9fr] lg:px-16">
          {product.sizeGuideRows.length ? (
            <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/82 p-6">
              <p className="section-label">Size Guide</p>
              <h2 className="mt-2 font-display text-3xl">Find the right fit</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="border-b border-[color:var(--color-border)] text-xs uppercase tracking-[.18em] text-[color:var(--color-muted-foreground)]">
                    <tr>
                      <th className="py-3 pr-4">Size</th>
                      <th className="py-3 pr-4">Age</th>
                      <th className="py-3 pr-4">Chest</th>
                      <th className="py-3 pr-4">Waist</th>
                      <th className="py-3 pr-4">Hip</th>
                      <th className="py-3 pr-4">Length</th>
                      <th className="py-3 pr-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeGuideRows.map((row) => (
                      <tr className="border-b border-[color:var(--color-border)] last:border-0" key={row.id}>
                        <td className="py-3 pr-4 font-semibold">{row.size}</td>
                        <td className="py-3 pr-4">{row.ageRange || "-"}</td>
                        <td className="py-3 pr-4">{row.chest || "-"}</td>
                        <td className="py-3 pr-4">{row.waist || "-"}</td>
                        <td className="py-3 pr-4">{row.hip || "-"}</td>
                        <td className="py-3 pr-4">{row.length || "-"}</td>
                        <td className="py-3 pr-4">{row.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          {product.colorGuideOptions.length ? (
            <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/82 p-6">
              <p className="section-label">Color Guide</p>
              <h2 className="mt-2 font-display text-3xl">Available shades</h2>
              <div className="mt-5 grid gap-3">
                {product.colorGuideOptions.map((option) => (
                  <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-3" key={option.id}>
                    {option.imageUrl ? (
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-paper)]">
                        <Image alt={option.name} className="object-cover" fill sizes="56px" src={option.imageUrl} />
                      </span>
                    ) : (
                      <span className="size-14 shrink-0 rounded-xl border border-[color:var(--color-border-strong)]" style={{ backgroundColor: option.swatchHex || "#ffffff" }} />
                    )}
                    <span className="min-w-0">
                      <strong className="block">{option.name}</strong>
                      {option.description ? <span className="mt-1 block text-sm text-[color:var(--color-muted-foreground)]">{option.description}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {details.length ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 lg:px-16">
          <div className="grid gap-4 md:grid-cols-2">
            {details.map(([title, value]) => (
              <details className="group rounded-[2rem] border border-[color:var(--color-border)] bg-white/82 p-6 transition hover:border-[color:var(--color-gold-deep)]/40" key={title} open={title === "Highlights"}>
                <summary className="cursor-pointer font-display text-2xl">{title}</summary>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[color:var(--color-muted-foreground)]">{value}</p>
              </details>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold"><Link className="rounded-full border bg-white px-4 py-2 transition hover:border-[color:var(--color-gold-deep)]" href="/shipping-and-returns">Shipping & returns policy</Link><Link className="rounded-full border bg-white px-4 py-2 transition hover:border-[color:var(--color-gold-deep)]" href="/faqs">Frequently asked questions</Link></div>
        </section>
      ) : null}

      {product.reviews.length ? (
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-paper)]/60">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16">
            <p className="section-label">Customer Notes</p>
            <h2 className="section-title">Loved in real wardrobes</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {product.reviews.map((review) => (
                <blockquote className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/90 p-6" key={review.id}>
                  <div className="flex text-[color:var(--color-gold-deep)]">{Array.from({ length: review.rating }).map((_, index) => <Star className="size-4" fill="currentColor" key={index} />)}</div>
                  <p className="mt-5 font-display text-2xl">{review.title || "Beautifully considered"}</p>
                  <p className="mt-3 leading-7 text-[color:var(--color-muted-foreground)]">{review.body}</p>
                  <footer className="mt-5 text-sm font-semibold">{review.authorName}{review.authorTitle ? ` · ${review.authorTitle}` : ""}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {relatedProducts.length ? <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16"><p className="section-label">Complete the edit</p><h2 className="section-title">You may also love</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{relatedProducts.map((related) => <ProductCard key={related.id} product={related} />)}</div></section> : null}
    </main>
  );
}
