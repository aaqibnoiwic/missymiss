"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
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
  colorGuideOptions?: { name: string; swatchHex?: string; imageUrl?: string; description?: string }[];
};

type ShippingDefaults = {
  weight: number;
  length: number;
  breadth: number;
  height: number;
};

const input = "mt-2 h-11 w-full rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm outline-none focus:border-[color:var(--color-gold-deep)]";
const textarea = `${input} min-h-28 py-3`;
const section = "rounded-2xl border border-[color:var(--color-border)] bg-white/85 p-5";
const sizeOptions = ["0-2 Years", "2-5 Years", "XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const defaultColorOptions = [
  "Black",
  "White",
  "Ivory",
  "Cream",
  "Beige",
  "Brown",
  "Grey",
  "Navy",
  "Blue",
  "Pink",
  "Red",
  "Maroon",
  "Green",
  "Sage",
  "Yellow",
  "Gold",
  "Silver",
];

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

export function ProductEditor({
  categories,
  colorOptions,
  product,
}: {
  categories: CategoryOption[];
  colorOptions: string[];
  product?: ProductValue;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveProductEditor, initialAdminActionState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [highlights, setHighlights] = useState(product?.highlights ?? "");
  const [imageUrls, setImageUrls] = useState(product?.imageUrls ?? []);
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [variants, setVariants] = useState<VariantValue[]>(product?.variants ?? []);
  const [shippingDefaults, setShippingDefaults] = useState<ShippingDefaults>(() => ({
    weight: product?.variants.find((variant) => variant.weight > 0)?.weight ?? 0,
    length: product?.variants.find((variant) => variant.length > 0)?.length ?? 0,
    breadth: product?.variants.find((variant) => variant.breadth > 0)?.breadth ?? 0,
    height: product?.variants.find((variant) => variant.height > 0)?.height ?? 0,
  }));
  const [customColor, setCustomColor] = useState("");
  const [colorImageUrls, setColorImageUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries((product?.colorGuideOptions ?? []).map((option) => [option.name, option.imageUrl ?? ""])),
  );
  const [selectedColors, setSelectedColors] = useState(() => {
    const savedColors = [
      ...(product?.colors ?? "").split(","),
      ...(product?.colorGuideOptions ?? []).map((option) => option.name),
    ].map((color) => color.trim()).filter(Boolean);
    return [...new Set(savedColors)];
  });
  const availableColorOptions = [...new Set([...defaultColorOptions, ...colorOptions, ...selectedColors])]
    .map((color) => color.trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
  const [selectedSizes, setSelectedSizes] = useState(() => {
    const savedSizes = (product?.sizes ?? "").split(",").map((size) => size.trim()).filter(Boolean);
    const detailSizes = [
      ...(product?.sizeGuideRows ?? []).map((row) => row.size),
      ...(product?.variants ?? []).map((variant) => variant.size),
    ].map((size) => size.trim()).filter(Boolean);
    return [...new Set([...savedSizes, ...detailSizes])];
  });

  useEffect(() => {
    if (state.success && !product) router.replace("/admin/products");
  }, [product, router, state.success]);

  function updateVariant(index: number, key: keyof VariantValue, value: string | boolean) {
    setVariants((current) => current.map((variant, itemIndex) => itemIndex === index
      ? { ...variant, [key]: typeof variant[key] === "number" ? Number(value) : value }
      : variant));
  }

  function updateShippingDefault(key: keyof ShippingDefaults, value: number) {
    setShippingDefaults((current) => ({ ...current, [key]: Number.isFinite(value) ? Math.max(0, value) : 0 }));
  }

  function applyShippingDefaultsToVariants() {
    setVariants((current) => current.map((variant) => ({
      ...variant,
      weight: shippingDefaults.weight,
      length: shippingDefaults.length,
      breadth: shippingDefaults.breadth,
      height: shippingDefaults.height,
    })));
  }

  function toggleColor(color: string, checked: boolean) {
    setSelectedColors((current) => checked
      ? [...new Set([...current, color])]
      : current.filter((item) => item !== color));
  }

  function addCustomColor() {
    const normalized = customColor.trim();
    if (!normalized) return;
    setSelectedColors((current) => [...new Set([...current, normalized])]);
    setCustomColor("");
  }

  async function analyseFirstImage() {
    const imageUrl = imageUrls[0];
    if (!imageUrl) {
      setAnalysisError("Upload at least one image before analysing.");
      return;
    }

    setAnalysing(true);
    setAnalysisError("");
    try {
      const response = await fetch("/api/admin/products/analyse-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const payload = await response.json() as {
        productName?: string;
        description?: string;
        highlights?: string[];
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "AI analysis failed.");

      if (payload.productName) {
        setName(payload.productName);
        if (!slugEdited) setSlug(slugify(payload.productName));
      }
      if (payload.description) {
        setDescription(payload.description);
        setShortDescription(payload.description.split(".")[0]?.trim() || payload.description);
      }
      if (payload.highlights?.length) {
        setHighlights(payload.highlights.map((highlight) => `- ${highlight}`).join("\n"));
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "AI analysis failed.");
    } finally {
      setAnalysing(false);
    }
  }

  const colorGuideOptions = selectedColors.map((color) => ({ name: color, swatchHex: "", imageUrl: colorImageUrls[color] ?? "", description: "" }));

  return (
    <form action={formAction} className="space-y-5">
      {product ? <input name="id" type="hidden" value={product.id} /> : null}
      <input name="variantsJson" type="hidden" value={JSON.stringify(variants)} />
      <input name="sizeGuideRowsJson" type="hidden" value={JSON.stringify(product?.sizeGuideRows ?? [])} />
      <input name="colorGuideOptionsJson" type="hidden" value={JSON.stringify(colorGuideOptions)} />
      <input name="colors" type="hidden" value={selectedColors.join(", ")} />
      {selectedSizes.map((size) => <input key={size} name="sizes" type="hidden" value={size} />)}
      {state.formError ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.formError}</p> : null}
      {state.message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{state.message}</p> : null}

      <section className={section}>
        <div className="mb-5">
          <p className="section-label">Essentials</p>
          <h2 className="mt-2 font-display text-3xl">Product basics</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Product name *
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
            Slug (optional)
            <input className={input} name="slug" onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} value={slug} />
            {state.fieldErrors.slug ? <span className="mt-1 block text-xs text-red-700">{state.fieldErrors.slug}</span> : null}
          </label>
          <Field defaultValue={product ? product.price / 100 : ""} error={state.fieldErrors.price} label="Price in rupees *" name="price" type="number" />
          <Field defaultValue={product?.inventory ?? 0} error={state.fieldErrors.inventory} label="Basic stock" name="inventory" type="number" />
          <Field defaultValue={product?.sku} label="Basic SKU (optional)" name="sku" />
          <Field defaultValue={product?.compareAtPrice ? product.compareAtPrice / 100 : ""} label="Compare-at price in rupees" name="compareAtPrice" type="number" />
        </div>
        <div className="mt-5">
          <p className="text-sm font-semibold">Available sizes</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {sizeOptions.map((size) => (
              <label className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm font-semibold" key={size}>
                <input
                  checked={selectedSizes.includes(size)}
                  onChange={(event) => {
                    setSelectedSizes((current) => event.target.checked
                      ? [...new Set([...current, size])]
                      : current.filter((item) => item !== size));
                  }}
                  type="checkbox"
                />
                {size}
              </label>
            ))}
          </div>
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Product images *</p>
          <Button disabled={!imageUrls.length || analysing} onClick={analyseFirstImage} type="button" variant="outline">
            <Sparkles className="size-4" />
            {analysing ? "Analysing..." : "Analyse with AI"}
          </Button>
        </div>
        <MultiImageUpload defaultUrls={product?.imageUrls} onUrlsChange={setImageUrls} />
        {state.fieldErrors.galleryImageUrls ? <p className="mt-3 text-sm text-red-700">{state.fieldErrors.galleryImageUrls}</p> : null}
        {analysisError ? <p className="mt-3 text-sm text-red-700">{analysisError}</p> : null}
      </section>

      <details className={section} open>
        <summary className="cursor-pointer font-display text-2xl">Colors</summary>
        <div className="mt-5 space-y-4">
          <div className="relative">
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm font-semibold">
                <span>{selectedColors.length ? `${selectedColors.length} color${selectedColors.length === 1 ? "" : "s"} selected` : "Select colors"}</span>
                <span className="text-xs text-[color:var(--color-muted-foreground)]">Open</span>
              </summary>
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[color:var(--color-border)] bg-white p-3 shadow-[0_18px_60px_rgba(44,44,44,.14)]">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableColorOptions.map((color) => (
                    <label className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-[color:var(--color-paper)]" key={color}>
                      <input checked={selectedColors.includes(color)} onChange={(event) => toggleColor(color, event.target.checked)} type="checkbox" />
                      {color}
                    </label>
                  ))}
                </div>
              </div>
            </details>
          </div>

          {selectedColors.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedColors.map((color) => (
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-sm font-semibold" key={color}>
                  {color}
                  <button aria-label={`Remove ${color}`} onClick={() => toggleColor(color, false)} type="button">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          {selectedColors.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedColors.map((color) => (
                <label className="text-sm font-semibold" key={`${color}-image`}>
                  Image for {color}
                  <select
                    className={input}
                    onChange={(event) => setColorImageUrls((current) => ({ ...current, [color]: event.target.value }))}
                    value={colorImageUrls[color] ?? ""}
                  >
                    <option value="">Use main product image</option>
                    {imageUrls.map((url, index) => <option key={url} value={url}>Product image {index + 1}</option>)}
                  </select>
                </label>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="text-sm font-semibold">
              Custom color
              <input className={input} onChange={(event) => setCustomColor(event.target.value)} placeholder="Add another color" value={customColor} />
            </label>
            <Button onClick={addCustomColor} type="button" variant="outline">
              <Plus className="size-4" /> Add color
            </Button>
          </div>
          {state.fieldErrors.colorGuideOptions ? <span className="block text-xs text-red-700">{state.fieldErrors.colorGuideOptions}</span> : null}
        </div>
      </details>

      <details className={section}>
        <summary className="cursor-pointer font-display text-2xl">Description and useful details</summary>
        <div className="mt-5 grid gap-4">
          <label className="text-sm font-semibold">
            Short description
            <input className={input} name="shortDescription" onChange={(event) => setShortDescription(event.target.value)} value={shortDescription} />
          </label>
          <label className="text-sm font-semibold">
            Full description
            <textarea className={textarea} name="description" onChange={(event) => setDescription(event.target.value)} value={description} />
          </label>
          <label className="text-sm font-semibold">
            Highlights
            <textarea className={textarea} name="highlights" onChange={(event) => setHighlights(event.target.value)} value={highlights} />
          </label>
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
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Default shipping package for Shiprocket</p>
                <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
                  Use grams for weight and cm for L x B x H. New variants will start with these values.
                </p>
              </div>
              <Button disabled={!variants.length} onClick={applyShippingDefaultsToVariants} type="button" variant="outline">
                Apply to all variants
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <label className="text-xs font-semibold">
                Weight (grams)
                <input className={input} onChange={(event) => updateShippingDefault("weight", Number(event.target.value))} type="number" value={shippingDefaults.weight} />
              </label>
              <label className="text-xs font-semibold">
                Length (cm)
                <input className={input} onChange={(event) => updateShippingDefault("length", Number(event.target.value))} type="number" value={shippingDefaults.length} />
              </label>
              <label className="text-xs font-semibold">
                Breadth (cm)
                <input className={input} onChange={(event) => updateShippingDefault("breadth", Number(event.target.value))} type="number" value={shippingDefaults.breadth} />
              </label>
              <label className="text-xs font-semibold">
                Height (cm)
                <input className={input} onChange={(event) => updateShippingDefault("height", Number(event.target.value))} type="number" value={shippingDefaults.height} />
              </label>
            </div>
          </div>
          {variants.map((variant, index) => (
            <div className="grid gap-3 rounded-2xl border border-[color:var(--color-border)] p-4 md:grid-cols-4" key={index}>
              {(["title", "sku", "color", "price", "inventory", "weight", "length", "breadth", "height"] as const).map((key) => (
                <label className="text-xs font-semibold capitalize" key={key}>
                  {key === "weight" ? "Weight (grams)" : key === "length" ? "Length (cm)" : key === "breadth" ? "Breadth (cm)" : key === "height" ? "Height (cm)" : key}
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
          <Button onClick={() => setVariants((current) => [...current, { title: "", sku: "", size: "", color: "", price: (product?.price ?? 0) / 100, inventory: 0, weight: shippingDefaults.weight, length: shippingDefaults.length, breadth: shippingDefaults.breadth, height: shippingDefaults.height, isEnabled: true }])} type="button" variant="outline">
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
