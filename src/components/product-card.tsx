import Image from "next/image";
import Link from "next/link";
import type { Product, ProductImage } from "@prisma/client";
import { buttonVariants } from "@/components/ui/button";

type ProductCardProps = {
  product: Product & {
    images?: ProductImage[];
  };
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    currency,
    style: "currency",
  }).format(price / 100);
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.featuredImage || product.images?.[0]?.imageUrl;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 shadow-[0_20px_60px_rgba(116,94,56,0.08)]">
      <div className="relative h-72 bg-[linear-gradient(160deg,rgba(212,175,55,0.18),rgba(255,255,255,0.5),rgba(245,241,234,0.95))]">
        {image ? (
          <Image
            alt={product.name}
            className="object-cover"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            src={image}
          />
        ) : (
          <div className="flex h-full items-end p-6">
            <div className="w-full rounded-[1.5rem] border border-white/60 bg-white/20 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-charcoal)]/70">
                Missy Miss
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-[color:var(--color-charcoal)]">
              {product.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[color:var(--color-muted-foreground)]">
              {product.shortDescription}
            </p>
          </div>
          <span className="rounded-full bg-[color:var(--color-paper)] px-3 py-1 text-sm font-semibold text-[color:var(--color-charcoal)]">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        <Link
          className={buttonVariants({ variant: "ghost", className: "px-0" })}
          href={`/products/${product.slug}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
