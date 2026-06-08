import { ProductCard } from "@/components/product-card";
import { getShopProducts } from "@/lib/cms";

export default async function ShopPage() {
  const products = await getShopProducts();

  return (
    <main>
      <section className="relative border-b border-[color:var(--color-border)]">
        <div className="absolute inset-0 hero-mesh opacity-80" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16">
          <p className="section-label">Shop All Products</p>
          <h1 className="mt-4 font-display text-6xl leading-none tracking-[-0.05em] text-[color:var(--color-charcoal)]">
            Shop Every Missy Miss Edit
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--color-muted-foreground)]">
            Browse published products from every women&apos;s, baby girls, and
            Reclaimed Thread collection.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
