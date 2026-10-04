import { ArrowRight, Leaf, Star } from "lucide-react";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CategoryQuickLinks } from "@/components/category-quick-links";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { getCategoryImage } from "@/lib/category-images";
import { getHomeData } from "@/lib/cms";

export default async function Home() {
  const { banners, categories, featuredProducts, newArrivals, testimonials } =
    await getHomeData();
  const heroBanners = banners.filter((banner) => banner.placement === "hero");
  const promoBanners = banners.filter((banner) => banner.placement !== "hero");
  const homepageProducts = [
    ...featuredProducts,
    ...newArrivals.filter(
      (arrival) => !featuredProducts.some((featured) => featured.id === arrival.id),
    ),
  ].slice(0, 4);
  return (
    <main className="overflow-hidden">
      <HeroCarousel banners={heroBanners} />
      <CategoryQuickLinks categories={categories} />

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="space-y-5">
            <p className="section-label">Style In Motion</p>
            <h2 className="section-title max-w-xl">
              Office fit check, captured in real time
            </h2>
            <p className="max-w-lg text-base leading-8 text-[color:var(--color-muted-foreground)]">
              A closer look at Missy Miss styling with soft tailoring, elegant
              texture, and a polished everyday silhouette.
            </p>
            <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
              Shop The Look
            </Link>
          </div>
          <div className="flex justify-center">
            <video
              className="h-auto max-h-[80svh] w-full max-w-md object-contain"
              controls
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/IMG_3906.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:auto-rows-fr xl:grid-cols-3">
          {categories.map((category, index) => (
            <article
              key={category.title}
              className="group relative h-[22rem] w-[78vw] max-w-[20rem] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-white/80 p-5 shadow-[0_18px_60px_rgba(116,94,56,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--color-gold-deep)]/40 hover:shadow-[0_28px_80px_rgba(116,94,56,.16)] md:h-auto md:min-h-80 md:w-auto md:max-w-none md:p-7 lg:h-full"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {category.imageUrl || getCategoryImage(category.slug, category.title) ? (
                <Image
                  alt={category.title}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  src={category.imageUrl || getCategoryImage(category.slug, category.title)}
                />
              ) : (
                <div className="absolute inset-0 hero-mesh" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,.05),rgba(20,20,20,.82))]" />
              <div className="relative flex h-full min-h-0 flex-col justify-end gap-3 text-white md:min-h-[16rem] md:gap-4 lg:h-full">
                <span className="inline-flex rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-charcoal)] md:px-3 md:text-xs md:tracking-[0.25em] lg:w-fit">
                  {category.eyebrow || category.collectionType}
                </span>
                <div className="space-y-2 md:space-y-3 lg:min-h-[9.5rem]">
                  <h3 className="font-display text-2xl md:text-3xl">
                    {category.title}
                  </h3>
                  <p className="line-clamp-2 max-w-sm text-xs leading-5 text-white/75 md:line-clamp-none md:text-sm md:leading-7">
                    {category.description}
                  </p>
                </div>
                <a
                  className="flex items-center gap-2 text-sm font-semibold lg:mt-auto"
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

      {promoBanners.length ? (
        <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 md:px-10 lg:grid-cols-2 lg:px-16">
          {promoBanners.slice(0, 4).map((banner) => (
            <Link className="group relative min-h-80 overflow-hidden rounded-[2.25rem] bg-[color:var(--color-charcoal)] text-white" href={banner.ctaHref || "/shop"} key={banner.id}>
              {banner.desktopImage ? <Image alt={banner.title} className="object-cover transition duration-700 group-hover:scale-105" fill sizes="(max-width: 1024px) 100vw, 50vw" src={banner.desktopImage} /> : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(20,20,20,.78))]" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs font-bold uppercase tracking-[.25em] text-white/65">{banner.ctaLabel || "Discover"}</p>
                <h2 className="mt-2 font-display text-4xl">{banner.title}</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">{banner.subtitle}</p>
              </div>
            </Link>
          ))}
        </section>
      ) : null}

      <section
        id="sustainability"
        className="relative border-y border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(245,241,234,0.75),rgba(250,249,246,0.95))]"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16">
          <div className="group relative min-h-[34rem] overflow-hidden rounded-[2.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] text-white shadow-[0_20px_80px_rgba(25,25,25,0.18)]">
            <Image alt="Reclaimed textiles in the Missy Miss atelier" className="object-cover transition duration-1000 group-hover:scale-105" fill sizes="(min-width: 1024px) 45vw, 100vw" src="/editorial/reclaimed-thread.webp" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,.16),rgba(20,20,20,.88))]" />
            <div className="relative flex min-h-[34rem] flex-col justify-end p-7 md:p-9">
              <p className="section-label text-white/70">Reclaimed Thread</p>
              <h2 className="mt-3 max-w-lg font-display text-4xl leading-tight">
                A sustainable movement dressed in elegance
              </h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/76">
                Reclaimed Thread is a sustainable movement that rescues
                discarded textiles, production scraps, and unsold garments,
                turning them into high-quality, wearable clothing and
                accessories.
              </p>
              <div className="mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-white/20 bg-black/25 px-4 py-3 text-sm backdrop-blur-md">
                <Leaf className="size-4 text-[color:var(--color-gold)]" />
                Circular fashion with elevated finishing
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-rows-2">
            {[
              {
                title: "Textile rescue",
                description:
                  "Give discarded fabrics and unsold garments a second life through thoughtful sourcing and material recovery.",
              },
              {
                title: "Curated & premium womenswear",
                description:
                  "Shape every collection, campaign, and product story around an elevated, feminine, and carefully edited point of view.",
              },
              {
                title: "Coord sets",
                description:
                  "Matching sets designed for effortless dressing, polished silhouettes, and easy day-to-night styling.",
              },
              {
                title: "Lounge wear",
                description:
                  "Comfort-led pieces with a refined finish, created for relaxed routines without losing the Missy Miss elegance.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-6 shadow-[0_16px_50px_rgba(117,96,58,0.08)] lg:flex lg:h-full lg:flex-col"
              >
                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(212,175,55,0.25),rgba(255,255,255,0.95))] text-[color:var(--color-gold-deep)]">
                  <Star className="size-4" />
                </div>
                <h3 className="font-display text-2xl text-[color:var(--color-charcoal)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted-foreground)]">
                  {item.description}
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
          {homepageProducts.map((product) => (
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
              Contemporary fashion shaped by elegance, comfort, and a more
              thoughtful approach to every wardrobe.
            </p>
          </div>
          <nav aria-label="Shop collections" className="grid gap-2 text-sm text-[color:var(--color-muted-foreground)] sm:grid-cols-3 sm:gap-10">
            <Link className="rounded-md transition hover:text-[color:var(--color-gold-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]" href="/shop?collection=women">Women</Link>
            <Link className="rounded-md transition hover:text-[color:var(--color-gold-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]" href="/shop?collection=baby-girls">Kids</Link>
            <Link className="rounded-md transition hover:text-[color:var(--color-gold-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]" href="/shop?collection=reclaimed-thread">Reclaimed Thread</Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
