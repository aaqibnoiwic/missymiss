import type { Metadata } from "next";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getCategoryImage } from "@/lib/category-images";
import { getEnabledBanners, getPublishedCategory } from "@/lib/cms";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublishedCategory(slug);

  if (!category) return {};

  return {
    title: category.metaTitle || category.title,
    description: category.metaDescription || category.description,
    keywords: category.keywords,
    openGraph: {
      images: category.ogImage ? [category.ogImage] : [],
      title: category.metaTitle || category.title,
      description: category.metaDescription || category.description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getPublishedCategory(slug);

  if (!category) notFound();

  const banners = await getEnabledBanners("category", category.slug);
  const hero = banners[0];
  const categoryImage = category.imageUrl || getCategoryImage(category.slug, category.title);
  const products = category.products
    .map((item) => item.product)
    .filter((product) => product.isPublished);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-[color:var(--color-border)]">
        {categoryImage ? <><Image alt="" className="object-cover" fill priority sizes="100vw" src={categoryImage} /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,20,20,.82),rgba(20,20,20,.25))]" /></> : <div className="absolute inset-0 hero-mesh opacity-80" />}
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:gap-10 sm:px-6 sm:py-20 md:px-10 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-16">
          <div className={categoryImage ? "text-white" : ""}>
            <p className="section-label">
              {category.eyebrow || category.collectionType}
            </p>
            <h1 className={`mt-4 font-display text-4xl leading-[1.02] tracking-[-0.05em] sm:text-5xl md:text-6xl ${categoryImage ? "text-white" : "text-[color:var(--color-charcoal)]"}`}>
              {hero?.title || category.title}
            </h1>
            <p className={`mt-4 max-w-2xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8 ${categoryImage ? "text-white/75" : "text-[color:var(--color-muted-foreground)]"}`}>
              {hero?.subtitle || category.description}
            </p>
            {hero?.ctaHref ? (
              <a href={hero.ctaHref} className="mt-8 inline-flex">
                <Button>{hero.ctaLabel || "Explore"}</Button>
              </a>
            ) : null}
          </div>
          <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_100px_rgba(117,95,56,0.16)] sm:rounded-[2.5rem] sm:p-8">
            <p className="font-display text-3xl text-[color:var(--color-charcoal)]">
              {products.length} curated styles
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
              Thoughtfully selected silhouettes made for effortless,
              confident dressing.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-16">
        {products.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[color:var(--color-border-strong)] bg-white/70 p-6 text-center sm:p-10 text-[color:var(--color-muted-foreground)]">
            Products assigned to this collection will appear here.
          </div>
        )}
      </section>
    </main>
  );
}
