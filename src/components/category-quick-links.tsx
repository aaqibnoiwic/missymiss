import Link from "next/link";
import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import { getCategoryQuickLink } from "@/lib/category-images";

type CategoryQuickLinksProps = {
  categories: Array<{
    imageUrl: string;
    slug: string;
    title: string;
  }>;
};

export function CategoryQuickLinks({ categories }: CategoryQuickLinksProps) {
  return (
    <section
      aria-label="Shop by category"
      className="border-b border-[color:var(--color-border)] bg-white/70"
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:px-10 lg:px-16">
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 md:grid-cols-6 md:gap-5">
          {categories.map((category) => {
            const link = getCategoryQuickLink(category);

            return (
              <Link
                aria-label={`Shop ${link.title}`}
                className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2.5 rounded-2xl py-1 text-center outline-none sm:w-auto"
                href={link.href}
                key={category.slug}
              >
                <span className="relative size-20 overflow-hidden rounded-full border-2 border-white bg-[color:var(--color-paper)] shadow-[0_10px_30px_rgba(116,94,56,.14)] ring-1 ring-[color:var(--color-border-strong)] transition duration-300 group-hover:-translate-y-1 group-hover:ring-[color:var(--color-gold-deep)] group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--color-gold-deep)] md:size-24 lg:size-28">
                  {link.imageUrl ? (
                    <Image
                      alt=""
                      className="object-cover transition duration-500 group-hover:scale-105"
                      fill
                      sizes="(min-width: 1024px) 112px, (min-width: 768px) 96px, 80px"
                      src={link.imageUrl}
                    />
                  ) : (
                    <span className="hero-mesh block h-full w-full" />
                  )}
                </span>
                <span className="max-w-28 text-xs font-semibold leading-5 text-[color:var(--color-charcoal)] transition group-hover:text-[color:var(--color-gold-deep)]">
                  {link.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
