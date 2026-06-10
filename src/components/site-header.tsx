import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { getNavigationCategories } from "@/lib/cms";

export async function SiteHeader() {
  const categories = await getNavigationCategories().catch(() => []);
  const women = categories.filter((item) => item.collectionType === "women").slice(0, 3);
  const reclaimed = categories.find((item) => item.collectionType === "reclaimed-thread");

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(250,249,246,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo variant="symbol" className="w-12" />
          <div className="hidden sm:block">
            <p className="font-display text-xl leading-none text-[color:var(--color-charcoal)]">
              Missy Miss
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-muted-foreground)]">
              Luxury Fashion
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[color:var(--color-muted-foreground)] md:flex">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          {women.map((item) => (
            <Link href={`/collections/${item.slug}`} key={item.id}>
              {item.title}
            </Link>
          ))}
          <Link href={reclaimed ? `/collections/${reclaimed.slug}` : "/reclaimed-thread"}>
            Reclaimed Thread
          </Link>
          <Link href="/about-us">About</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <CartLink />
      </div>
    </header>
  );
}
