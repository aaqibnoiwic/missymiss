"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  buildShopHref,
  EMPTY_SHOP_FILTERS,
  toShopFilterState,
  type ShopFilterSearch,
  type ShopFilterState,
} from "@/lib/shop-filter-query";

type ShopFiltersProps = {
  categories: Array<{ id: string; slug: string; title: string }>;
  colors: string[];
  filters: ShopFilterSearch;
  sizes: string[];
};

const COLLECTION_LABELS: Record<string, string> = {
  women: "Women",
  "baby-girls": "Kids",
  "reclaimed-thread": "Reclaimed Thread",
};

const SORT_LABELS: Record<string, string> = {
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Name: A to Z",
};

const control =
  "h-11 w-full rounded-xl border border-[color:var(--color-border-strong)] bg-white px-3.5 text-sm text-[color:var(--color-charcoal)] outline-none transition-colors placeholder:text-[color:var(--color-muted-foreground)] hover:border-[color:var(--color-gold-deep)]/60 focus:border-[color:var(--color-gold-deep)] focus:ring-2 focus:ring-[color:var(--color-gold)]/20";

function Field({ children, htmlFor, label }: { children: ReactNode; htmlFor: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted-foreground)]" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ children, id, onChange, value }: { children: ReactNode; id: string; onChange: (value: string) => void; value: string }) {
  return (
    <div className="relative">
      <select className={`${control} cursor-pointer appearance-none truncate pr-9`} id={id} name={id} onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
    </div>
  );
}

export function ShopFilters({ categories, colors, filters, sizes }: ShopFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ShopFilterState>(() => toShopFilterState(filters));
  const applied = toShopFilterState(filters);
  const isDirty = buildShopHref(values) !== buildShopHref(applied);

  function update<Key extends keyof ShopFilterState>(key: Key, value: ShopFilterState[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function navigate(next: ShopFilterState) {
    setValues(next);
    startTransition(() => {
      router.push(buildShopHref(next), { scroll: false });
    });
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(values);
  }

  const categoryTitle = (slug: string) => categories.find((category) => category.slug === slug)?.title ?? slug;
  const price =
    applied.minPrice && applied.maxPrice
      ? `₹${applied.minPrice} – ₹${applied.maxPrice}`
      : applied.minPrice
        ? `From ₹${applied.minPrice}`
        : applied.maxPrice
          ? `Up to ₹${applied.maxPrice}`
          : "";
  type Chip = { label: string; clear: Partial<ShopFilterState> };
  const chips = ([
    applied.q && { label: `“${applied.q}”`, clear: { q: "" } },
    applied.collection && { label: COLLECTION_LABELS[applied.collection], clear: { collection: "" as const } },
    applied.category && { label: categoryTitle(applied.category), clear: { category: "" } },
    applied.size && { label: `Size ${applied.size}`, clear: { size: "" } },
    applied.color && { label: applied.color, clear: { color: "" } },
    price && { label: price, clear: { minPrice: "", maxPrice: "" } },
    applied.availability && { label: "In stock", clear: { availability: false } },
    applied.sort && { label: SORT_LABELS[applied.sort] ?? applied.sort, clear: { sort: "" } },
  ] as Array<Chip | false | "">).filter((chip): chip is Chip => Boolean(chip));

  return (
    <form
      aria-busy={isPending}
      className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-white/90 shadow-[0_18px_60px_rgba(116,94,56,.08)]"
      onSubmit={applyFilters}
    >
      <div className="flex flex-col gap-3 border-b border-[color:var(--color-border)] p-4 sm:flex-row sm:items-center md:p-5">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
          <input
            aria-label="Search products"
            className={`${control} pl-10`}
            name="q"
            onChange={(event) => update("q", event.target.value)}
            placeholder="Search by name, category or SKU"
            type="search"
            value={values.q}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex h-11 shrink-0 cursor-pointer select-none items-center gap-2.5 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-3.5 text-sm transition-colors hover:border-[color:var(--color-gold-deep)]/60">
            <input
              checked={values.availability}
              className="size-4 cursor-pointer accent-[color:var(--color-gold-deep)]"
              name="availability"
              onChange={(event) => update("availability", event.target.checked)}
              type="checkbox"
            />
            In stock only
          </label>
          <div className="w-full sm:w-52">
            <Select id="sort" onChange={(value) => update("sort", value)} value={values.sort}>
              <option value="">Sort: Newest</option>
              {Object.entries(SORT_LABELS).map(([value, label]) => <option key={value} value={value}>Sort: {label}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-5 lg:grid-cols-5">
        <Field htmlFor="collection" label="Collection">
          <Select id="collection" onChange={(value) => update("collection", value as ShopFilterState["collection"])} value={values.collection}>
            <option value="">All collections</option>
            {Object.entries(COLLECTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </Field>
        <Field htmlFor="category" label="Category">
          <Select id="category" onChange={(value) => update("category", value)} value={values.category}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.title}</option>)}
          </Select>
        </Field>
        <Field htmlFor="size" label="Size">
          <Select id="size" onChange={(value) => update("size", value)} value={values.size}>
            <option value="">All sizes</option>
            {sizes.map((size) => <option key={size}>{size}</option>)}
          </Select>
        </Field>
        <Field htmlFor="color" label="Colour">
          <Select id="color" onChange={(value) => update("color", value)} value={values.color}>
            <option value="">All colours</option>
            {colors.map((color) => <option key={color}>{color}</option>)}
          </Select>
        </Field>
        <Field htmlFor="minPrice" label="Price (₹)">
          <div className="flex items-center gap-2">
            <input aria-label="Minimum price" className={control} id="minPrice" inputMode="numeric" min="0" name="minPrice" onChange={(event) => update("minPrice", event.target.value)} placeholder="Min" type="number" value={values.minPrice} />
            <span aria-hidden className="text-[color:var(--color-muted-foreground)]">–</span>
            <input aria-label="Maximum price" className={control} inputMode="numeric" min="0" name="maxPrice" onChange={(event) => update("maxPrice", event.target.value)} placeholder="Max" type="number" value={values.maxPrice} />
          </div>
        </Field>
      </div>

      <div className="flex flex-col gap-4 rounded-b-[1.75rem] border-t border-[color:var(--color-border)] bg-[color:var(--color-paper)]/60 p-4 md:flex-row md:items-center md:justify-between md:px-5">
        <div className="flex min-h-9 flex-wrap items-center gap-2">
          {chips.length ? (
            chips.map((chip) => (
              <button
                aria-label={`Remove filter ${chip.label}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[color:var(--color-border-strong)] bg-white pl-3 pr-2 text-xs font-medium transition-colors hover:border-[color:var(--color-gold-deep)] disabled:opacity-50"
                disabled={isPending}
                key={chip.label}
                onClick={() => navigate({ ...applied, ...chip.clear })}
                type="button"
              >
                {chip.label}
                <X aria-hidden className="size-3.5 text-[color:var(--color-muted-foreground)]" />
              </button>
            ))
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted-foreground)]">
              <SlidersHorizontal aria-hidden className="size-4" />
              No filters applied
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className={buttonVariants({ className: "flex-1 md:flex-none", variant: "outline" })}
            disabled={isPending || (!chips.length && !isDirty)}
            onClick={() => navigate(EMPTY_SHOP_FILTERS)}
            type="button"
          >
            Clear all
          </button>
          <button className={buttonVariants({ className: "min-w-36 flex-1 md:flex-none" })} disabled={isPending || !isDirty} type="submit">
            {isPending ? <><Loader2 aria-hidden className="size-4 animate-spin" />Applying…</> : "Apply filters"}
          </button>
        </div>
      </div>
    </form>
  );
}
