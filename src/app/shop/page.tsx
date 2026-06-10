import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { getNavigationCategories, getShopFilterOptions, getShopProducts } from "@/lib/cms";

type Search = { q?: string; category?: string; size?: string; color?: string; minPrice?: string; maxPrice?: string; availability?: string; sort?: string };
const field = "h-11 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-3 text-sm outline-none focus:border-[color:var(--color-gold-deep)]";

export default async function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const rupees = (value?: string) => value && Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value) * 100)) : undefined;
  const [products, categories, options] = await Promise.all([
    getShopProducts({ ...filters, minPrice: rupees(filters.minPrice), maxPrice: rupees(filters.maxPrice) }),
    getNavigationCategories(),
    getShopFilterOptions(),
  ]);
  const sizes = [...new Set(options.flatMap((product) => [...product.sizes.split(","), ...product.variants.map((variant) => variant.size)].map((value) => value.trim()).filter(Boolean)))].sort();
  const colors = [...new Set(options.flatMap((product) => [...product.colors.split(","), ...product.variants.map((variant) => variant.color)].map((value) => value.trim()).filter(Boolean)))].sort();

  return <main>
    <section className="relative border-b border-[color:var(--color-border)]"><div className="absolute inset-0 hero-mesh opacity-80" /><div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10 lg:px-16"><p className="section-label">Shop all products</p><h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.05em] md:text-6xl">Find your next favourite</h1><p className="mt-5 max-w-2xl text-lg text-[color:var(--color-muted-foreground)]">Search and refine every Missy Miss collection by category, size, colour, availability, and price.</p></div></section>
    <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <form className="grid gap-3 rounded-[2rem] border border-[color:var(--color-border)] bg-white/88 p-5 shadow-[0_18px_60px_rgba(116,94,56,.08)] md:grid-cols-4 lg:grid-cols-8">
        <input className={`${field} md:col-span-2`} defaultValue={filters.q} name="q" placeholder="Search products..." />
        <select className={field} defaultValue={filters.category} name="category"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.title}</option>)}</select>
        <select className={field} defaultValue={filters.size} name="size"><option value="">All sizes</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select>
        <select className={field} defaultValue={filters.color} name="color"><option value="">All colours</option>{colors.map((color) => <option key={color}>{color}</option>)}</select>
        <input className={field} defaultValue={filters.minPrice} min="0" name="minPrice" placeholder="Min ₹" type="number" />
        <input className={field} defaultValue={filters.maxPrice} min="0" name="maxPrice" placeholder="Max ₹" type="number" />
        <select className={field} defaultValue={filters.sort} name="sort"><option value="">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select>
        <label className="flex h-11 items-center gap-2 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-3 text-sm"><input defaultChecked={filters.availability === "in-stock"} name="availability" type="checkbox" value="in-stock" />In stock</label>
        <button className={buttonVariants({ className: "md:col-span-2" })}>Apply filters</button><Link className={buttonVariants({ variant: "ghost" })} href="/shop">Clear</Link>
      </form>
      <div className="my-7 flex items-center justify-between"><p className="text-sm font-semibold">{products.length} products</p>{filters.q ? <p className="text-sm text-[color:var(--color-muted-foreground)]">Results for “{filters.q}”</p> : null}</div>
      {products.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[2rem] border border-dashed p-12 text-center"><h2 className="font-display text-3xl">No styles found</h2><p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">Try clearing one or more filters.</p></div>}
    </section>
  </main>;
}
