import type {
  Banner,
  Category,
  GalleryImage,
  MediaAsset,
  Product,
  ProductCategory,
  ProductImage,
  SitePage,
  Testimonial,
} from "@prisma/client";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  deleteBanner,
  deleteGalleryImage,
  deletePage,
  deleteProduct,
  deleteProductImage,
  saveBanner,
  saveCategory,
  saveGalleryImage,
  savePage,
  saveProduct,
  saveProductImage,
  saveTestimonial,
} from "@/app/admin/actions";

type ProductWithRelations = Product & {
  categories: (ProductCategory & { category: Category })[];
  images: ProductImage[];
};

type CmsData = {
  banners: Banner[];
  categories: Category[];
  galleryImages: GalleryImage[];
  mediaAssets: MediaAsset[];
  pages: SitePage[];
  products: ProductWithRelations[];
  testimonials: Testimonial[];
};

const fieldClass =
  "flex h-11 w-full rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm text-[color:var(--color-charcoal)] outline-none transition focus:border-[color:var(--color-gold-deep)]";
const textareaClass =
  "flex min-h-28 w-full rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm text-[color:var(--color-charcoal)] outline-none transition focus:border-[color:var(--color-gold-deep)]";

const pageTypeOptions = [
  ["main", "Main Page"],
  ["policy", "Policy Page"],
  ["support", "Support Page"],
  ["collection", "Collection Story"],
] as const;

const collectionTypeOptions = [
  ["main", "Main"],
  ["women", "Women's Collection"],
  ["baby-girls", "Baby Girls"],
  ["reclaimed-thread", "Reclaimed Thread"],
] as const;

const bannerScopeOptions = [
  ["home", "Homepage"],
  ["category", "Category Page"],
  ["collection", "Collection Page"],
] as const;

const galleryScopeOptions = [
  ["lifestyle", "Lifestyle"],
  ["category", "Category"],
  ["product", "Product"],
  ["promo", "Promotional"],
] as const;

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  type = "text",
}: {
  defaultValue?: number | string | null;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
      <span>{label}</span>
      <input
        className={fieldClass}
        defaultValue={defaultValue ?? ""}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function TextArea({
  defaultValue,
  label,
  name,
  rows = 5,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
      <span>{label}</span>
      <textarea
        className={textareaClass}
        defaultValue={defaultValue ?? ""}
        name={name}
        rows={rows}
      />
    </label>
  );
}

function SelectField({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
      <span>{label}</span>
      <select className={fieldClass} defaultValue={defaultValue ?? ""} name={name}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function CategoryTargetSelect({
  categories,
  defaultValue,
  label = "Target category",
  name = "targetSlug",
}: {
  categories: Category[];
  defaultValue?: string | null;
  label?: string;
  name?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
      <span>{label}</span>
      <select className={fieldClass} defaultValue={defaultValue ?? ""} name={name}>
        <option value="">None</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({
  defaultChecked = true,
  label,
  name,
}: {
  defaultChecked?: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-charcoal)]">
      <input defaultChecked={defaultChecked} name={name} type="checkbox" />
      {label}
    </label>
  );
}

function Panel({
  children,
  id,
  kicker,
  title,
}: {
  children: ReactNode;
  id?: string;
  kicker: string;
  title: string;
}) {
  return (
    <section
      className="rounded-[2rem] border border-[color:var(--color-border)] bg-white/88 p-6 shadow-[0_20px_70px_rgba(117,96,58,0.08)]"
      id={id}
    >
      <p className="section-label">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl text-[color:var(--color-charcoal)]">
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function SeoFields({
  item,
}: {
  item?: {
    keywords?: string | null;
    metaDescription?: string | null;
    metaTitle?: string | null;
    ogImage?: string | null;
  };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field defaultValue={item?.metaTitle} label="Meta title" name="metaTitle" />
      <Field
        defaultValue={item?.metaDescription}
        label="Meta description"
        name="metaDescription"
      />
      <Field defaultValue={item?.keywords} label="Keywords" name="keywords" />
      <ImageUploadField
        defaultValue={item?.ogImage}
        folder="missy-miss/editorial"
        label="Open Graph image"
        name="ogImage"
      />
    </div>
  );
}

function DeleteButton({ action, id }: { action: (formData: FormData) => Promise<void>; id: string }) {
  return (
    <form action={action}>
      <input name="id" type="hidden" value={id} />
      <Button type="submit" variant="outline">
        Delete
      </Button>
    </form>
  );
}

export function CmsManagementPanel({ data }: { data: CmsData }) {
  const womenCategories = data.categories.filter(
    (category) => category.collectionType === "women",
  );
  const babyCategories = data.categories.filter(
    (category) => category.collectionType === "baby-girls",
  );
  const reclaimedCategories = data.categories.filter(
    (category) => category.collectionType === "reclaimed-thread",
  );

  return (
    <div className="space-y-8">
      <Panel id="admin-sections" kicker="Quick Access" title="Jump to a Section">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted-foreground)]">
              Core Sections
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["#cms-pages", "Pages"],
                ["#cms-categories", "Categories"],
                ["#cms-banners", "Banners"],
                ["#cms-products", "Products"],
                ["#cms-gallery", "Gallery"],
                ["#cms-testimonials", "Testimonials"],
                ["#cms-media", "Media"],
              ].map(([href, label]) => (
                <a
                  className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)]"
                  href={href}
                  key={href}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted-foreground)]">
              Women&apos;s Categories
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {womenCategories.map((category) => (
                <a
                  className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)]"
                  href={`#category-${category.slug}`}
                  key={category.id}
                >
                  {category.title}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted-foreground)]">
              Baby Girls
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {babyCategories.map((category) => (
                <a
                  className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)]"
                  href={`#category-${category.slug}`}
                  key={category.id}
                >
                  {category.title}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/55 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted-foreground)]">
              Reclaimed Thread
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reclaimedCategories.map((category) => (
                <a
                  className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-charcoal)] transition hover:border-[color:var(--color-gold-deep)]"
                  href={`#category-${category.slug}`}
                  key={category.id}
                >
                  {category.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel id="cms-pages" kicker="CMS" title="Pages & Policy Content">
        <details className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-5" open>
          <summary className="cursor-pointer font-semibold">Create New Page</summary>
          <form action={savePage} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Slug" name="slug" placeholder="about-us" />
              <Field label="Title" name="title" />
              <SelectField label="Page type" name="pageType" options={pageTypeOptions} />
            </div>
            <Field label="Eyebrow" name="eyebrow" />
            <TextArea label="Excerpt" name="excerpt" rows={3} />
            <TextArea label="Body" name="body" rows={8} />
            <SeoFields />
            <Check label="Published" name="isPublished" />
            <Button type="submit">Save Page</Button>
          </form>
        </details>
        {data.pages.map((page) => (
          <details
            className="rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5"
            key={page.id}
          >
            <summary className="cursor-pointer font-semibold">
              {page.title} <span className="text-[color:var(--color-muted-foreground)]">/{page.slug}</span>
            </summary>
            <form action={savePage} className="mt-5 grid gap-4">
              <input name="id" type="hidden" value={page.id} />
              <div className="grid gap-4 md:grid-cols-3">
                <Field defaultValue={page.slug} label="Slug" name="slug" />
                <Field defaultValue={page.title} label="Title" name="title" />
                <SelectField
                  defaultValue={page.pageType}
                  label="Page type"
                  name="pageType"
                  options={pageTypeOptions}
                />
              </div>
              <Field defaultValue={page.eyebrow} label="Eyebrow" name="eyebrow" />
              <TextArea defaultValue={page.excerpt} label="Excerpt" name="excerpt" rows={3} />
              <TextArea defaultValue={page.body} label="Body" name="body" rows={10} />
              <SeoFields item={page} />
              <Check defaultChecked={page.isPublished} label="Published" name="isPublished" />
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Update Page</Button>
                <DeleteButton action={deletePage} id={page.id} />
              </div>
            </form>
          </details>
        ))}
      </Panel>

      <Panel id="cms-categories" kicker="Collections" title="Category Pages">
        <form action={saveCategory} className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Slug" name="slug" />
            <Field label="Title" name="title" />
            <SelectField
              label="Collection type"
              name="collectionType"
              options={collectionTypeOptions}
            />
            <Field label="Sort order" name="sortOrder" type="number" />
          </div>
          <Field label="Eyebrow" name="eyebrow" />
          <TextArea label="Description" name="description" rows={4} />
          <SeoFields />
          <Check label="Published" name="isPublished" />
          <Button type="submit">Create Category</Button>
        </form>
        {data.categories.map((category) => (
          <details
            className="rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5"
            id={`category-${category.slug}`}
            key={category.id}
          >
            <summary className="cursor-pointer font-semibold">{category.title}</summary>
            <form action={saveCategory} className="mt-5 grid gap-4">
              <input name="id" type="hidden" value={category.id} />
              <div className="grid gap-4 md:grid-cols-4">
                <Field defaultValue={category.slug} label="Slug" name="slug" />
                <Field defaultValue={category.title} label="Title" name="title" />
                <SelectField
                  defaultValue={category.collectionType}
                  label="Collection type"
                  name="collectionType"
                  options={collectionTypeOptions}
                />
                <Field defaultValue={category.sortOrder} label="Sort order" name="sortOrder" type="number" />
              </div>
              <Field defaultValue={category.eyebrow} label="Eyebrow" name="eyebrow" />
              <TextArea defaultValue={category.description} label="Description" name="description" rows={4} />
              <SeoFields item={category} />
              <Check defaultChecked={category.isPublished} label="Published" name="isPublished" />
              <Button type="submit">Update Category</Button>
            </form>
          </details>
        ))}
      </Panel>

      <Panel id="cms-banners" kicker="Banners" title="Home & Category Banners">
        <form action={saveBanner} className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Title" name="title" />
            <SelectField label="Scope" name="scope" options={bannerScopeOptions} />
            <CategoryTargetSelect categories={data.categories} />
            <Field label="Sort order" name="sortOrder" type="number" />
          </div>
          <TextArea label="Subtitle" name="subtitle" rows={3} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="CTA label" name="ctaLabel" />
            <Field label="CTA URL" name="ctaHref" />
            <Field label="Starts at" name="startsAt" type="datetime-local" />
            <Field label="Ends at" name="endsAt" type="datetime-local" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadField
              folder="missy-miss/editorial"
              label="Desktop banner image"
              name="desktopImage"
            />
            <ImageUploadField
              folder="missy-miss/editorial"
              label="Mobile banner image"
              name="mobileImage"
            />
          </div>
          <SeoFields />
          <Check label="Enabled" name="isEnabled" />
          <Button type="submit">Create Banner</Button>
        </form>
        {data.banners.map((banner) => (
          <details className="rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5" key={banner.id}>
            <summary className="cursor-pointer font-semibold">{banner.title}</summary>
            <form action={saveBanner} className="mt-5 grid gap-4">
              <input name="id" type="hidden" value={banner.id} />
              <div className="grid gap-4 md:grid-cols-4">
                <Field defaultValue={banner.title} label="Title" name="title" />
                <SelectField
                  defaultValue={banner.scope}
                  label="Scope"
                  name="scope"
                  options={bannerScopeOptions}
                />
                <CategoryTargetSelect
                  categories={data.categories}
                  defaultValue={banner.targetSlug}
                />
                <Field defaultValue={banner.sortOrder} label="Sort order" name="sortOrder" type="number" />
              </div>
              <TextArea defaultValue={banner.subtitle} label="Subtitle" name="subtitle" rows={3} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field defaultValue={banner.ctaLabel} label="CTA label" name="ctaLabel" />
                <Field defaultValue={banner.ctaHref} label="CTA URL" name="ctaHref" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ImageUploadField
                  defaultValue={banner.desktopImage}
                  folder="missy-miss/editorial"
                  label="Desktop banner image"
                  name="desktopImage"
                />
                <ImageUploadField
                  defaultValue={banner.mobileImage}
                  folder="missy-miss/editorial"
                  label="Mobile banner image"
                  name="mobileImage"
                />
              </div>
              <SeoFields item={banner} />
              <Check defaultChecked={banner.isEnabled} label="Enabled" name="isEnabled" />
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Update Banner</Button>
                <DeleteButton action={deleteBanner} id={banner.id} />
              </div>
            </form>
          </details>
        ))}
      </Panel>

      <Panel id="cms-products" kicker="Catalog" title="Products, Inventory & Variants">
        <form action={saveProduct} className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Slug" name="slug" />
            <Field label="Name" name="name" />
            <Field label="Price in paise" name="price" type="number" />
            <Field label="Inventory" name="inventory" type="number" />
          </div>
          <TextArea label="Short description" name="shortDescription" rows={3} />
          <TextArea label="Description" name="description" rows={5} />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Product video URL" name="videoUrl" />
            <Field label="SKU" name="sku" />
            <Field label="Sizes" name="sizes" placeholder="S,M,L" />
            <Field label="Colors" name="colors" placeholder="Ivory,Gold" />
          </div>
          <ImageUploadField
            folder="missy-miss/products"
            label="Featured product image"
            name="featuredImage"
          />
          <label className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
            <span>Assign categories</span>
            <select className={fieldClass} multiple name="categoryIds">
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-4">
            <Check label="Published" name="isPublished" />
            <Check defaultChecked={false} label="Featured" name="isFeatured" />
            <Check defaultChecked={false} label="New arrival" name="isNewArrival" />
            <Check defaultChecked={false} label="Best seller" name="isBestSeller" />
            <Check defaultChecked={false} label="Trending" name="isTrending" />
            <Check defaultChecked={false} label="Sustainable" name="isSustainable" />
          </div>
          <SeoFields />
          <Button type="submit">Create Product</Button>
        </form>
        {data.products.map((product) => (
          <details className="rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5" key={product.id}>
            <summary className="cursor-pointer font-semibold">{product.name}</summary>
            <form action={saveProduct} className="mt-5 grid gap-4">
              <input name="id" type="hidden" value={product.id} />
              <div className="grid gap-4 md:grid-cols-4">
                <Field defaultValue={product.slug} label="Slug" name="slug" />
                <Field defaultValue={product.name} label="Name" name="name" />
                <Field defaultValue={product.price} label="Price in paise" name="price" type="number" />
                <Field defaultValue={product.inventory} label="Inventory" name="inventory" type="number" />
              </div>
              <TextArea defaultValue={product.shortDescription} label="Short description" name="shortDescription" rows={3} />
              <TextArea defaultValue={product.description} label="Description" name="description" rows={5} />
              <div className="grid gap-4 md:grid-cols-3">
                <Field defaultValue={product.videoUrl} label="Product video URL" name="videoUrl" />
                <Field defaultValue={product.sku} label="SKU" name="sku" />
                <Field defaultValue={product.sizes} label="Sizes" name="sizes" />
                <Field defaultValue={product.colors} label="Colors" name="colors" />
              </div>
              <ImageUploadField
                defaultValue={product.featuredImage}
                folder="missy-miss/products"
                label="Featured product image"
                name="featuredImage"
              />
              <label className="space-y-2 text-sm font-medium text-[color:var(--color-charcoal)]">
                <span>Assign categories</span>
                <select
                  className={fieldClass}
                  defaultValue={product.categories.map((item) => item.categoryId)}
                  multiple
                  name="categoryIds"
                >
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-4">
                <Check defaultChecked={product.isPublished} label="Published" name="isPublished" />
                <Check defaultChecked={product.isFeatured} label="Featured" name="isFeatured" />
                <Check defaultChecked={product.isNewArrival} label="New arrival" name="isNewArrival" />
                <Check defaultChecked={product.isBestSeller} label="Best seller" name="isBestSeller" />
                <Check defaultChecked={product.isTrending} label="Trending" name="isTrending" />
                <Check defaultChecked={product.isSustainable} label="Sustainable" name="isSustainable" />
              </div>
              <SeoFields item={product} />
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Update Product</Button>
                <DeleteButton action={deleteProduct} id={product.id} />
              </div>
            </form>
            <form action={saveProductImage} className="mt-5 grid gap-4 rounded-3xl bg-[color:var(--color-paper)]/60 p-4">
              <input name="productId" type="hidden" value={product.id} />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Alt text" name="alt" />
                <Field label="Sort order" name="sortOrder" type="number" />
                <Check defaultChecked={false} label="Featured image" name="isFeatured" />
              </div>
              <ImageUploadField
                folder="missy-miss/products"
                label="Product gallery image"
                name="imageUrl"
              />
              <Button type="submit" variant="outline">Add Product Image</Button>
            </form>
            {product.images.length ? (
              <div className="mt-4 grid gap-3">
                {product.images.map((image) => (
                  <div
                    className="flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-white/80 p-4 text-sm md:flex-row md:items-center md:justify-between"
                    key={image.id}
                  >
                    <div>
                      <p className="font-semibold text-[color:var(--color-charcoal)]">
                        {image.alt || "Product image"}
                      </p>
                      <p className="mt-1 break-all text-[color:var(--color-muted-foreground)]">
                        {image.imageUrl}
                      </p>
                    </div>
                    <DeleteButton action={deleteProductImage} id={image.id} />
                  </div>
                ))}
              </div>
            ) : null}
          </details>
        ))}
      </Panel>

      <Panel id="cms-gallery" kicker="Gallery" title="Lifestyle, Category & Promotional Images">
        <form action={saveGalleryImage} className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Title" name="title" />
            <SelectField label="Scope" name="scope" options={galleryScopeOptions} />
            <CategoryTargetSelect categories={data.categories} />
            <Field label="Sort order" name="sortOrder" type="number" />
          </div>
          <ImageUploadField
            folder="missy-miss/editorial"
            label="Gallery image"
            name="imageUrl"
          />
          <Field label="Alt text" name="alt" />
          <div className="flex flex-wrap gap-4">
            <Check defaultChecked={false} label="Featured" name="isFeatured" />
            <Check label="Enabled" name="isEnabled" />
          </div>
          <Button type="submit">Add Gallery Image</Button>
        </form>
        {data.galleryImages.map((image) => (
          <details className="rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5" key={image.id}>
            <summary className="cursor-pointer font-semibold">{image.title || image.imageUrl}</summary>
            <form action={saveGalleryImage} className="mt-5 grid gap-4">
              <input name="id" type="hidden" value={image.id} />
              <div className="grid gap-4 md:grid-cols-4">
                <Field defaultValue={image.title} label="Title" name="title" />
                <SelectField
                  defaultValue={image.scope}
                  label="Scope"
                  name="scope"
                  options={galleryScopeOptions}
                />
                <CategoryTargetSelect
                  categories={data.categories}
                  defaultValue={image.targetSlug}
                />
                <Field defaultValue={image.sortOrder} label="Sort order" name="sortOrder" type="number" />
              </div>
              <ImageUploadField
                defaultValue={image.imageUrl}
                folder="missy-miss/editorial"
                label="Gallery image"
                name="imageUrl"
              />
              <Field defaultValue={image.alt} label="Alt text" name="alt" />
              <div className="flex flex-wrap gap-4">
                <Check defaultChecked={image.isFeatured} label="Featured" name="isFeatured" />
                <Check defaultChecked={image.isEnabled} label="Enabled" name="isEnabled" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Update Image</Button>
                <DeleteButton action={deleteGalleryImage} id={image.id} />
              </div>
            </form>
          </details>
        ))}
      </Panel>

      <Panel id="cms-testimonials" kicker="Social Proof" title="Testimonials">
        <form action={saveTestimonial} className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)]/50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Name" name="name" />
            <Field label="Role" name="role" />
            <Field label="Rating" name="rating" type="number" />
            <Field label="Sort order" name="sortOrder" type="number" />
          </div>
          <TextArea label="Quote" name="quote" rows={4} />
          <Check label="Enabled" name="isEnabled" />
          <Button type="submit">Save Testimonial</Button>
        </form>
        {data.testimonials.map((testimonial) => (
          <form action={saveTestimonial} className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-white/70 p-5" key={testimonial.id}>
            <input name="id" type="hidden" value={testimonial.id} />
            <div className="grid gap-4 md:grid-cols-4">
              <Field defaultValue={testimonial.name} label="Name" name="name" />
              <Field defaultValue={testimonial.role} label="Role" name="role" />
              <Field defaultValue={testimonial.rating} label="Rating" name="rating" type="number" />
              <Field defaultValue={testimonial.sortOrder} label="Sort order" name="sortOrder" type="number" />
            </div>
            <TextArea defaultValue={testimonial.quote} label="Quote" name="quote" rows={4} />
            <Check defaultChecked={testimonial.isEnabled} label="Enabled" name="isEnabled" />
            <Button type="submit">Update Testimonial</Button>
          </form>
        ))}
      </Panel>

      <Panel id="cms-media" kicker="Uploaded Assets" title="Recent Media URLs">
        <div className="grid gap-3">
          {data.mediaAssets.map((asset) => (
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 p-4 text-sm" key={asset.id}>
              <p className="font-semibold text-[color:var(--color-charcoal)]">{asset.alt || asset.publicId}</p>
              <p className="mt-2 break-all text-[color:var(--color-muted-foreground)]">{asset.url}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
