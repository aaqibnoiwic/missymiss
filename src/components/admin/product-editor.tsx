"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveProductEditor } from "@/app/admin/actions";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";
import { Button } from "@/components/ui/button";
import { initialAdminActionState } from "@/lib/admin-ui";

type CategoryOption = { id: string; title: string; collectionType: string };
type VariantValue = {
  title: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  inventory: number;
  weight: number;
  length: number;
  breadth: number;
  height: number;
  isEnabled: boolean;
};
type SizeGuideRowValue = {
  size: string;
  ageRange: string;
  chest: string;
  waist: string;
  hip: string;
  length: string;
  notes: string;
};
type ProductValue = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  highlights: string;
  material: string;
  fitDetails: string;
  careInstructions: string;
  sizeGuide: string;
  shippingReturns: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  inventory: number;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isSustainable: boolean;
  videoUrl: string;
  sizes: string;
  colors: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  categoryIds: string[];
  imageUrls: string[];
  variants: VariantValue[];
  sizeGuideRows: SizeGuideRowValue[];
  colorGuideOptions?: { name: string }[];
};

const input = "mt-2 h-11 w-full rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm outline-none focus:border-[color:var(--color-gold-deep)]";
const textarea = `${input} min-h-28 py-3`;
const section = "rounded-2xl border border-[color:var(--color-border)] bg-white/85 p-5";
const sizeOptions = ["0-2 Years", "2-5 Years", "XS", "S", "M", "L", "XL", "XXL", "Free Size"];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Field({
  defaultValue,
  error,
  label,
  name,
  placeholder,
  type = "text",
}: {
  defaultValue?: string | number;
  error?: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input className={input} defaultValue={defaultValue} name={name} placeholder={placeholder} type={type} />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function Check({ defaultChecked, label, name }: { defaultChecked?: boolean; label: string; name: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}

function SizeSelect({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="text-xs font-semibold">
      {label}
      <select className={input} onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Select size</option>
        {sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
      </select>
    </label>
  );
}

export function ProductEditor({ categories, product }: { categories: CategoryOption[]; product?: ProductValue }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveProductEditor, initialAdminActionState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [variants, setVariants] = useState<VariantValue[]>(product?.variants ?? []);
  const [sizeGuideRows, setSizeGuideRows] = useState<SizeGuideRowValue[]>(product?.sizeGuideRows ?? []);
  const [colors, setColors] = useState(product?.colors || product?.colorGuideOptions?.map((option) => option.name).filter(Boolean).join(", ") || "");

  useEffect(() => {
    if (state.success && state.entityId && !product) router.replace(`/admin/products/${state.entityId}`);
  }, [product, router, state.entityId, state.success]);

  function updateVariant(index: number, key: keyof VariantValue, value: string | boolean) {
    setVariants((current) => current.map((variant, itemIndex) => itemIndex === index
      ? { ...variant, [key]: typeof variant[key] === "number" ? Number(value) : value }
      : variant));
  }

  function updateSizeGuideRow(index: number, key: keyof SizeGuideRowValue, value: string) {
    setSizeGuideRows((current) => current.map((row, itemIndex) => itemIndex === index ? { ...row, [key]: value } : row));
  }

  const sizeSummary = [
    ...new Set([...sizeGuideRows.map((row) => row.size), ...variants.map((variant) => variant.size)].map((value) => value.trim()).filter(Boolean)),
  ].join(", ");
  const colorGuideOptions = [
    ...new Set(colors.split(",").map((color) => color.trim()).filter(Boolean)),
  ].map((color) => ({ name: color, swatchHex: "", imageUrl: "", description: "" }));

  return (
    <form action={formAction} className="space-y-5">
      {product ? <input name="id" type="hidden" value={product.id} /> : null}
      <input name="variantsJson" type="hidden" value={JSON.stringify(variants)} />
      <input name="sizeGuideRowsJson" type="hidden" value={JSON.stringify(sizeGuideRows)} />
      <input name="colorGuideOptionsJson" type="hidden" value={JSON.stringify(colorGuideOptions)} />
      <input name="sizes" type="hidden" value={sizeSummary} />
      {state.formError ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.formError}</p> : null}
      {state.message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{state.message}</p> : null}

      <section className={section}>
        <div className="mb-5">
          <p className="section-label">Essentials</p>
          <h2 className="mt-2 font-display text-3xl">Product basics</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Product name
            <input
              className={input}
              name="name"
              onChange={(event) => {
                setName(event.target.value);
                if (!slugEdited) setSlug(slugify(event.target.value));
              }}
              value={name}
            />
            {state.fieldErrors.name ? <span className="mt-1 block text-xs text-red-700">{state.fieldErrors.name}</span> : null}
          </label>
          <label className="text-sm font-semibold">
            Slug
            <input className={input} name="slug" onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} value={slug} />
            {state.fieldErrors.slug ? <span className="mt-1 block text-xs text-red-700">{state.fieldErrors.slug}</span> : null}
          </label>
          <Field defaultValue={(product?.price ?? 0) / 100} error={state.fieldErrors.price} label="Price in rupees" name="price" type="number" />
          <Field defaultValue={product?.inventory ?? 0} error={state.fieldErrors.inventory} label="Basic stock" name="inventory" type="number" />
          <Field defaultValue={product?.sku} label="Basic SKU (optional)" name="sku" />
          <Field defaultValue={product?.compareAtPrice ? product.compareAtPrice / 100 : ""} label="Compare-at price in rupees" name="compareAtPrice" type="number" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label className="flex items-center gap-2 text-sm" key={category.id}>
              <input defaultChecked={product?.categoryIds.includes(category.id)} name="categoryIds" type="checkbox" value={category.id} />
              <span>{category.title} <small className="text-[color:var(--color-muted-foreground)]">({category.collectionType})</small></span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-5">
          <Check defaultChecked={product?.isPublished ?? true} label="Published" name="isPublished" />
          <Check defaultChecked={product?.isFeatured} label="Featured" name="isFeatured" />
        </div>
      </section>

      <section className={section}>
        <p className="mb-4 text-sm font-semibold">Product images</p>
        <MultiImageUpload defaultUrls={product?.imageUrls} />
      </section>

      <details className={section} open>
        <summary className="cursor-pointer font-display text-2xl">Size and color guides</summary>
        <div className="mt-5 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Size guide rows</p>
                <p className="text-xs text-[color:var(--color-muted-foreground)]">Use inches or cm consistently in each product.</p>
              </div>
              <Button
                onClick={() => setSizeGuideRows((current) => [...current, { size: "", ageRange: "", chest: "", waist: "", hip: "", length: "", notes: "" }])}
                type="button"
                variant="outline"
              >
                <Plus className="size-4" /> Add size
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {sizeGuideRows.map((row, index) => (
                <div className="grid gap-3 rounded-2xl border border-[color:var(--color-border)] p-4 md:grid-cols-4" key={index}>
                  <SizeSelect label="Size" onChange={(value) => updateSizeGuideRow(index, "size", value)} value={row.size} />
                  {(["ageRange", "chest", "waist", "hip", "length", "notes"] as const).map((key) => (
                    <label className={`text-xs font-semibold ${key === "notes" ? "md:col-span-2" : ""}`} key={key}>
                      {key === "ageRange" ? "Age range" : key}
                      <input className={input} onChange={(event) => updateSizeGuideRow(index, key, event.target.value)} value={row[key]} />
                    </label>
                  ))}
                  <Button onClick={() => setSizeGuideRows((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button" variant="ghost">
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              ))}
              {state.fieldErrors.sizeGuideRows ? <p className="text-sm text-red-700">{state.fieldErrors.sizeGuideRows}</p> : null}
            </div>
          </div>

          <label className="block text-sm font-semibold">
            Colors
            <input className={input} name="colors" onChange={(event) => setColors(event.target.value)} placeholder="Ivory, Pink, Sage" value={colors} />
            <span className="mt-1 block text-xs text-[color:var(--color-muted-foreground)]">Separate colors with commas.</span>
            {state.fieldErrors.colorGuideOptions ? <span className="mt-1 block text-xs text-red-700">{state.fieldErrors.colorGuideOptions}</span> : null}
          </label>
        </div>
      </details>

      <details className={section}>
        <summary className="cursor-pointer font-display text-2xl">Description and useful details</summary>
        <div className="mt-5 grid gap-4">
          <Field defaultValue={product?.shortDescription} label="Short description" name="shortDescription" />
          <label className="text-sm font-semibold">Full description<textarea className={textarea} defaultValue={product?.description} name="description" /></label>
          <label className="text-sm font-semibold">Highlights<textarea className={textarea} defaultValue={product?.highlights} name="highlights" /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <Field defaultValue={product?.material} label="Material" name="material" />
            <Field defaultValue={product?.fitDetails} label="Fit details" name="fitDetails" />
            <Field defaultValue={product?.careInstructions} label="Care instructions" name="careInstructions" />
            <Field defaultValue={product?.sizeGuide} label="Size guide notes" name="sizeGuide" placeholder="Extra fit notes shown below structured guide" />
          </div>
        </div>
      </details>

      <details className={section}>
        <summary className="cursor-pointer font-display text-2xl">Variants (optional)</summary>
        <div className="mt-5 space-y-4">
          {variants.map((variant, index) => (
            <div className="grid gap-3 rounded-2xl border border-[color:var(--color-border)] p-4 md:grid-cols-4" key={index}>
              {(["title", "sku", "color", "price", "inventory", "weight", "length", "breadth", "height"] as const).map((key) => (
                <label className="text-xs font-semibold capitalize" key={key}>
                  {key}
                  <input
                    className={input}
                    onChange={(event) => updateVariant(index, key, event.target.value)}
                    type={["price", "inventory", "weight", "length", "breadth", "height"].includes(key) ? "number" : "text"}
                    value={variant[key] as string | number}
                  />
                </label>
              ))}
              <SizeSelect label="Size" onChange={(value) => updateVariant(index, "size", value)} value={variant.size} />
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input checked={variant.isEnabled} onChange={(event) => updateVariant(index, "isEnabled", event.target.checked)} type="checkbox" />
                Enabled
              </label>
              <Button onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button" variant="ghost">
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          ))}
          <Button onClick={() => setVariants((current) => [...current, { title: "", sku: "", size: "", color: "", price: (product?.price ?? 0) / 100, inventory: 0, weight: 0, length: 0, breadth: 0, height: 0, isEnabled: true }])} type="button" variant="outline">
            <Plus className="size-4" /> Add variant
          </Button>
          {state.fieldErrors.variants ? <p className="text-sm text-red-700">{state.fieldErrors.variants}</p> : null}
        </div>
      </details>

      <details className={section}>
        <summary className="cursor-pointer font-display text-2xl">Shipping, marketing and SEO</summary>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field defaultValue={product?.shippingReturns} label="Shipping and returns" name="shippingReturns" />
          <Field defaultValue={product?.videoUrl} label="Video URL" name="videoUrl" type="url" />
          <Field defaultValue={product?.metaTitle} label="Meta title" name="metaTitle" />
          <Field defaultValue={product?.metaDescription} label="Meta description" name="metaDescription" />
          <Field defaultValue={product?.keywords} label="Keywords" name="keywords" />
          <Field defaultValue={product?.ogImage} label="Open Graph image URL" name="ogImage" type="url" />
        </div>
        <div className="mt-5 flex flex-wrap gap-5">
          <Check defaultChecked={product?.isNewArrival} label="New arrival" name="isNewArrival" />
          <Check defaultChecked={product?.isBestSeller} label="Best seller" name="isBestSeller" />
          <Check defaultChecked={product?.isTrending} label="Trending" name="isTrending" />
          <Check defaultChecked={product?.isSustainable} label="Sustainable" name="isSustainable" />
        </div>
      </details>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white/95 p-4 shadow-xl backdrop-blur-xl">
        <p aria-live="polite" className="text-sm text-[color:var(--color-muted-foreground)]">{pending ? "Saving images, details, guides, inventory, and variants..." : "Changes are validated before publishing."}</p>
        <Button disabled={pending} pendingLabel="Saving product..." type="submit">{product ? "Save changes" : "Create product"}</Button>
      </div>
    </form>
  );
}
