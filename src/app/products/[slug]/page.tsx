import { Star } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
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
      variants: { where: { isEnabled: true }, orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!product) notFound();

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
    ["Size guide", product.sizeGuide],
    ["Shipping & returns", product.shippingReturns],
  ].filter(([, value]) => value);

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-16">
        <ProductGallery images={images} productName={product.name} />
        <div className="space-y-7 lg:sticky lg:top-28 lg:h-fit">
          <p className="section-label">
            {product.categories.map((item) => item.category.title).join(" / ") || "Missy Miss"}
          </p>
          <div>
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
          <ProductPurchasePanel product={product} variants={product.variants} />
          <div className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/80 p-6">
            <p className="leading-8 text-[color:var(--color-muted-foreground)]">{product.description}</p>
          </div>
        </div>
      </section>

      {details.length ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 lg:px-16">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {details.map(([title, value]) => (
              <article className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/82 p-6" key={title}>
                <h2 className="font-display text-2xl">{title}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[color:var(--color-muted-foreground)]">{value}</p>
              </article>
            ))}
          </div>
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
    </main>
  );
}
