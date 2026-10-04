import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import { getNavigationCategories, getShopFilterOptions, getShopProducts } from "@/lib/cms";
import type { ShopFilterSearch } from "@/lib/shop-filter-query";

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopFilterSearch> }) {
  const filters = await searchParams;
  const rupees = (value?: string) => value && Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value) * 100)) : undefined;
  const [products, categories, options] = await Promise.all([
    getShopProducts({
      ...filters,
      minPrice: rupees(filters.minPrice),
      maxPrice: rupees(filters.maxPrice),
    }),
    getNavigationCategories(),
    getShopFilterOptions(),
  ]);
  const sizes = [...new Set(options.flatMap((product) => [...product.sizes.split(","), ...product.variants.map((variant) => variant.size)].map((value) => value.trim()).filter(Boolean)))].sort();
  const colors = [...new Set(options.flatMap((product) => [...product.colors.split(","), ...product.variants.map((variant) => variant.color)].map((value) => value.trim()).filter(Boolean)))].sort();

  return <main>
    <section className="relative border-b border-[color:var(--color-border)]"><div className="absolute inset-0 hero-mesh opacity-80" /><div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10 lg:px-16"><p className="section-label">Shop all products</p><h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.05em] md:text-6xl">Find your next favourite</h1><p className="mt-5 max-w-2xl text-lg text-[color:var(--color-muted-foreground)]">Search and refine every Missy Miss collection by category, size, colour, availability, and price.</p></div></section>
    <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <ShopFilters categories={categories} colors={colors} filters={filters} sizes={sizes} />
      <div className="my-7 flex items-center justify-between"><p className="text-sm font-semibold">{products.length} {products.length === 1 ? "product" : "products"}</p>{filters.q ? <p className="text-sm text-[color:var(--color-muted-foreground)]">Results for “{filters.q}”</p> : null}</div>
      {products.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[2rem] border border-dashed p-12 text-center"><h2 className="font-display text-3xl">No styles found</h2><p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">Try clearing one or more filters.</p></div>}
    </section>
  </main>;
}
