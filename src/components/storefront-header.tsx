"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LoaderCircle, Menu, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";

type CategoryLink = { id: string; slug: string; title: string; collectionType: string };
type SearchResults = {
  categories: Array<{ imageUrl: string; slug: string; title: string }>;
  products: Array<{ imageUrl: string; name: string; price: number; slug: string }>;
};
const navLink = "rounded-full px-3 py-2 transition hover:bg-[color:var(--color-paper)] hover:text-[color:var(--color-charcoal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]";

function SearchBox({ mobile = false, onSelect }: { mobile?: boolean; onSelect?: () => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ categories: [], products: [] });
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    if (deferredQuery.length < 2) {
      setResults({ categories: [], products: [] });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(deferredQuery)}`, { signal: controller.signal });
        if (response.ok) setResults(await response.json() as SearchResults);
      } catch {
        if (!controller.signal.aborted) setResults({ categories: [], products: [] });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [deferredQuery]);

  const showResults = focused && query.trim().length >= 2;
  const itemClass = "flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-[color:var(--color-paper)] focus-visible:bg-[color:var(--color-paper)] focus-visible:outline-none";

  return (
    <div className={`relative ${mobile ? "w-full" : "hidden md:block"}`}>
      <form action="/shop" className={`flex items-center border border-[color:var(--color-border-strong)] bg-white/90 px-3 shadow-sm transition focus-within:border-[color:var(--color-gold-deep)] focus-within:shadow-[0_12px_36px_rgba(116,94,56,.12)] ${mobile ? "rounded-2xl" : "rounded-full"}`}>
        {loading ? <LoaderCircle className="size-4 animate-spin text-[color:var(--color-gold-deep)]" /> : <Search className="size-4 text-[color:var(--color-muted-foreground)]" />}
        <input
          aria-label="Search products and collections"
          autoComplete="off"
          className={`h-11 min-w-0 bg-transparent px-2 text-sm outline-none transition-all ${mobile ? "flex-1" : "w-36 focus:w-52"}`}
          name="q"
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search..."
          value={query}
        />
      </form>
      {showResults ? (
        <div className={`absolute z-[70] mt-2 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/95 p-2 shadow-[0_24px_80px_rgba(44,44,44,.18)] backdrop-blur-xl ${mobile ? "inset-x-0" : "right-0 w-[24rem]"}`}>
          {loading && !results.products.length && !results.categories.length ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-[color:var(--color-muted-foreground)]"><LoaderCircle className="size-4 animate-spin" /> Finding beautiful pieces...</div>
          ) : null}
          {results.categories.length ? <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[.22em] text-[color:var(--color-muted-foreground)]">Collections</p> : null}
          {results.categories.map((category) => (
            <Link className={itemClass} href={`/collections/${category.slug}`} key={category.slug} onClick={onSelect}>
              <span className="relative size-11 overflow-hidden rounded-xl bg-[color:var(--color-paper)]">{category.imageUrl ? <Image alt="" className="object-cover" fill sizes="44px" src={category.imageUrl} /> : null}</span>
              <span><span className="block text-sm font-semibold">{category.title}</span><span className="text-xs text-[color:var(--color-muted-foreground)]">View collection</span></span>
            </Link>
          ))}
          {results.products.length ? <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[.22em] text-[color:var(--color-muted-foreground)]">Products</p> : null}
          {results.products.map((product) => (
            <Link className={itemClass} href={`/products/${product.slug}`} key={product.slug} onClick={onSelect}>
              <span className="relative size-11 overflow-hidden rounded-xl bg-[color:var(--color-paper)]">{product.imageUrl ? <Image alt="" className="object-cover" fill sizes="44px" src={product.imageUrl} /> : null}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{product.name}</span><span className="text-xs text-[color:var(--color-muted-foreground)]">₹{(product.price / 100).toLocaleString("en-IN")}</span></span>
            </Link>
          ))}
          {!loading && !results.categories.length && !results.products.length ? <p className="p-7 text-center text-sm text-[color:var(--color-muted-foreground)]">No matching styles yet.</p> : null}
          <Link className="mt-1 flex items-center justify-center rounded-2xl border border-[color:var(--color-gold-deep)] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-deep))] px-4 py-3 text-xs font-bold uppercase tracking-[.16em] text-[color:var(--color-charcoal)] shadow-[0_12px_28px_rgba(200,155,60,.24)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)] focus-visible:ring-offset-2" href={`/shop?q=${encodeURIComponent(query)}`} onClick={onSelect}>See all search results</Link>
        </div>
      ) : null}
    </div>
  );
}

export function StorefrontHeader({ categories }: { categories: CategoryLink[] }) {
  const [open, setOpen] = useState(false);
  const groupedCategories = [
    {
      label: "Women",
      items: categories.filter((item) => item.collectionType === "women"),
    },
    {
      label: "Baby Girls",
      items: categories.filter((item) => item.collectionType === "baby-girls"),
    },
    {
      label: "Reclaimed Thread",
      items: categories.filter((item) => item.collectionType === "reclaimed-thread"),
    },
  ].filter((group) => group.items.length);
  return <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(250,249,246,0.9)] backdrop-blur-xl" data-storefront-header="true">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-10 lg:px-16">
      <Link className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)]" href="/"><BrandLogo className="w-11" variant="symbol" /><div className="hidden sm:block"><p className="font-display text-xl leading-none">Missy Miss</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted-foreground)]">Luxury Fashion</p></div></Link>
      <nav className="hidden items-center gap-1 text-sm font-medium text-[color:var(--color-muted-foreground)] lg:flex">
        <Link className={navLink} href="/">Home</Link>
        <Link className={navLink} href="/shop">Shop</Link>
        <div className="relative">
          <details className="group">
            <summary className={`${navLink} flex cursor-pointer list-none items-center gap-1`}>
              Categories
              <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-full z-[80] mt-2 w-[28rem] rounded-[1.5rem] border border-[color:var(--color-border)] bg-white/95 p-5 shadow-[0_24px_80px_rgba(44,44,44,.16)] backdrop-blur-xl">
              <div className="grid gap-5 sm:grid-cols-2">
                {groupedCategories.map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-[color:var(--color-muted-foreground)]">{group.label}</p>
                    <div className="grid gap-1">
                      {group.items.map((item) => (
                        <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-[color:var(--color-charcoal)] transition hover:bg-[color:var(--color-paper)]" href={`/collections/${item.slug}`} key={item.id}>
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
        <Link className={navLink} href="/about-us">About</Link>
      </nav>
      <div className="flex items-center gap-2">
        <SearchBox />
        <CartLink />
        <button aria-expanded={open} aria-label="Open navigation" className="flex size-11 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white transition hover:bg-[color:var(--color-paper)] lg:hidden" onClick={() => setOpen(!open)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
    </div>
    {open ? <div className="max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-[color:var(--color-border)] bg-[color:var(--background)] px-4 py-5 lg:hidden">
      <SearchBox mobile onSelect={() => setOpen(false)} />
      <nav className="mt-4 grid gap-1 text-sm font-semibold"><Link className={navLink} href="/" onClick={() => setOpen(false)}>Home</Link><Link className={navLink} href="/shop" onClick={() => setOpen(false)}>Shop all</Link>{categories.map((item) => <Link className={navLink} href={`/collections/${item.slug}`} key={item.id} onClick={() => setOpen(false)}>{item.title}</Link>)}<Link className={navLink} href="/about-us" onClick={() => setOpen(false)}>About Missy Miss</Link></nav>
    </div> : null}
  </header>;
}
