import { ArrowRight, Leaf, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ProductCard } from "@/components/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { getHomeData } from "@/lib/cms";

export default async function Home() {
  const { banners, categories, featuredProducts, newArrivals, testimonials } =
    await getHomeData();
  const hero = banners[0];
  const shopKidsCategory = categories.find(
    (category) => category.collectionType === "baby-girls",
  );
  const reclaimedCategory = categories.find(
    (category) => category.collectionType === "reclaimed-thread",
  );
  const heroCtaHref = hero?.ctaHref || "/shop";
  const shopKidsHref = shopKidsCategory
    ? `/collections/${shopKidsCategory.slug}`
    : "/shop";
  const reclaimedHref = reclaimedCategory
    ? `/collections/${reclaimedCategory.slug}`
    : "/reclaimed-thread";

  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-[color:var(--color-border)]">
        <div className="absolute inset-0 hero-mesh opacity-80" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-gold),transparent)]" />
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-14 px-6 py-10 md:px-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-16">
          <div className="relative z-10 max-w-2xl space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-charcoal)] shadow-[0_10px_30px_rgba(110,93,58,0.08)] backdrop-blur">
              <Sparkles className="size-3.5 text-[color:var(--color-gold-deep)]" />
              Premium Fashion House
            </span>
            <div className="space-y-6 reveal-up">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-[color:var(--color-muted-foreground)]">
                Missy Miss
              </p>
              <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] text-[color:var(--color-charcoal)] sm:text-6xl lg:text-7xl">
                {hero?.title || "Fashion With Purpose"}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[color:var(--color-muted-foreground)] sm:text-xl">
                {hero?.subtitle ||
                  "Premium women's and kids fashion crafted with style, elegance, and sustainability."}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href={heroCtaHref}
                className={buttonVariants({ size: "lg", className: "group" })}
              >
                {hero?.ctaLabel || "Shop Women"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={shopKidsHref}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Shop Kids
              </Link>
              <Link
                href={reclaimedHref}
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Explore Reclaimed Thread
              </Link>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {[
                { value: "Curated", label: "Luxury-first visual system" },
                { value: "Atelier", label: "Collections crafted with intent" },
                { value: "Editorial", label: "Motion, texture, and warmth" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5 shadow-[0_16px_60px_rgba(115,97,67,0.08)] backdrop-blur"
                >
                  <p className="font-display text-2xl text-[color:var(--color-charcoal)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.28),transparent_58%)] blur-3xl" />
            <div className="logo-panel reveal-up relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(245,241,234,0.72))] p-8 shadow-[0_30px_100px_rgba(117,95,56,0.18)] sm:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.48),transparent_38%,rgba(212,175,55,0.12)_70%,transparent)]" />
              <div className="relative flex flex-col items-center gap-8">
                <BrandLogo variant="full" priority className="w-full max-w-[25rem]" />
                <div className="grid w-full gap-4 rounded-[2rem] border border-white/70 bg-white/60 p-5 text-left backdrop-blur sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted-foreground)]">
                      Signature
                    </p>
                    <p className="font-display text-2xl text-[color:var(--color-charcoal)]">
                      Gold butterfly mark
                    </p>
                  </div>
                  <p className="text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                    Presented with more contrast, more breathing room, and a
                    soft foil glow so the logo feels intentional across hero,
                    header, and footer placements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Featured Categories</p>
            <h2 className="section-title">A wardrobe shaped around real life</h2>
          </div>
          <Link href="/shop" className={buttonVariants({ variant: "ghost" })}>
            View Collection
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <article
              key={category.title}
              className="group relative overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-white/80 p-7 shadow-[0_18px_60px_rgba(116,94,56,0.08)] transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(255,255,255,0.8),rgba(245,241,234,0.9))] opacity-80" />
              <div className="relative space-y-6">
                <span className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-charcoal)]">
                  {category.eyebrow || category.collectionType}
                </span>
                <div className="space-y-3">
                  <h3 className="font-display text-3xl text-[color:var(--color-charcoal)]">
                    {category.title}
                  </h3>
                  <p className="max-w-sm text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                    {category.description}
                  </p>
                </div>
                <a
                  className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-charcoal)]"
                  href={`/collections/${category.slug}`}
                >
                  Discover
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="sustainability"
        className="relative border-y border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(245,241,234,0.75),rgba(250,249,246,0.95))]"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16">
          <div className="rounded-[2.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] px-7 py-8 text-white shadow-[0_20px_80px_rgba(25,25,25,0.18)]">
            <p className="section-label text-white/70">Reclaimed Thread</p>
            <h2 className="mt-3 font-display text-4xl leading-tight">
              A sustainable movement dressed in elegance
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/76">
              Reclaimed Thread rescues discarded textiles, production scraps,
              and unsold garments, transforming them into high-quality wearable
              pieces with a lighter footprint.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-3 text-sm">
              <Leaf className="size-4 text-[color:var(--color-gold)]" />
              Circular fashion with elevated finishing
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Textile rescue",
              "Small-batch redesign",
              "Luxury finishing",
              "Lower waste footprint",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-6 shadow-[0_16px_50px_rgba(117,96,58,0.08)]"
              >
                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(212,175,55,0.25),rgba(255,255,255,0.95))] text-[color:var(--color-gold-deep)]">
                  <Star className="size-4" />
                </div>
                <h3 className="font-display text-2xl text-[color:var(--color-charcoal)]">
                  {item}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  A distinct brand story designed to support future product
                  drops, campaigns, and circular fashion edits.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Featured Products</p>
            <h2 className="section-title">Best sellers, new arrivals, and editorial picks</h2>
          </div>
          <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
            Shop All
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[...featuredProducts, ...newArrivals].slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6 md:px-10 lg:px-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((quote) => (
            <blockquote
              key={quote.id}
              className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-7 shadow-[0_16px_50px_rgba(117,96,58,0.08)]"
            >
              <p className="font-display text-3xl text-[color:var(--color-gold-deep)]">
                &ldquo;
              </p>
              <p className="mt-2 text-base leading-8 text-[color:var(--color-charcoal)]">
                {quote.quote}
              </p>
              <footer className="mt-6">
                <p className="font-semibold text-[color:var(--color-charcoal)]">
                  {quote.name}
                </p>
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  {quote.role}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16">
        <div className="rounded-[2.5rem] border border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,rgba(250,249,246,0.92),rgba(245,241,234,0.96),rgba(212,175,55,0.12))] px-6 py-8 shadow-[0_22px_80px_rgba(118,96,56,0.1)] sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <p className="section-label">Newsletter</p>
              <h2 className="section-title max-w-xl">
                Join the Missy Miss circle for launches, edits, and stories
              </h2>
              <p className="max-w-xl text-base leading-8 text-[color:var(--color-muted-foreground)]">
                Receive first looks at limited releases, thoughtful styling
                notes, and Reclaimed Thread stories.
              </p>
            </div>
            <form className="grid gap-3 sm:grid-cols-[minmax(0,20rem)_auto]">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-[3.25rem] rounded-full border border-[color:var(--color-border-strong)] bg-white/85 px-5 text-sm text-[color:var(--color-charcoal)] outline-none ring-0 transition focus:border-[color:var(--color-gold-deep)]"
              />
              <Button size="lg">Stay in the Loop</Button>
            </form>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="space-y-4">
            <BrandLogo variant="symbol" className="w-20" />
            <p className="max-w-md text-sm leading-7 text-[color:var(--color-muted-foreground)]">
              Built to grow into catalog, checkout, and editorial storytelling
              while keeping the gold butterfly identity centered.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-[color:var(--color-muted-foreground)] sm:grid-cols-3 sm:gap-10">
            <span>Women</span>
            <span>Kids</span>
            <span>Reclaimed Thread</span>
          </div>
        </div>
      </section>
    </main>
  );
}
