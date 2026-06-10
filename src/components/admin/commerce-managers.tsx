import type { Banner, Category, Order, OrderItem, Product, ProductCategory, ProductImage, ProductReview, ProductVariant, Shipment } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import {
  approveOrderForShipping,
  assignOrderCourier,
  cancelOrder,
  deleteBanner,
  deleteProductImage,
  deleteProductReview,
  deleteProductVariant,
  saveBanner,
  saveProduct,
  saveProductImage,
  saveProductReview,
  saveProductVariant,
  scheduleOrderPickup,
} from "@/app/admin/actions";

const input = "h-11 w-full rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm outline-none focus:border-[color:var(--color-gold-deep)]";
const area = `${input} h-auto min-h-24 py-3`;
const card = "rounded-[2rem] border border-[color:var(--color-border)] bg-white/85 p-6";
const Field = ({ name, label, value = "", type = "text" }: { name: string; label: string; value?: string | number | null; type?: string }) => <label className="space-y-2 text-sm font-semibold"><span>{label}</span><input className={input} defaultValue={value ?? ""} name={name} type={type} /></label>;
const Area = ({ name, label, value = "" }: { name: string; label: string; value?: string | null }) => <label className="space-y-2 text-sm font-semibold"><span>{label}</span><textarea className={area} defaultValue={value ?? ""} name={name} /></label>;
const Check = ({ name, label, checked = false }: { name: string; label: string; checked?: boolean }) => <label className="flex items-center gap-2 text-sm font-semibold"><input defaultChecked={checked} name={name} type="checkbox" />{label}</label>;
const Select = ({
  categories,
  defaultValue = [],
}: {
  categories: Category[];
  defaultValue?: string[];
}) => (
  <label className="space-y-2 text-sm font-semibold">
    <span>Categories</span>
    <select className={`${input} h-40`} defaultValue={defaultValue} multiple name="categoryIds">
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.title}
        </option>
      ))}
    </select>
  </label>
);

export function ProductsManager({
  categories,
  products,
}: {
  categories: Category[];
  products: Array<Product & {
    categories: Array<ProductCategory & { category: Category }>;
    images: ProductImage[];
    variants: ProductVariant[];
  }>;
}) {
  return <div className="space-y-6">
    <form action={saveProduct} className={`${card} grid gap-4`}>
      <input name="manageCategories" type="hidden" value="true" />
      <h2 className="font-display text-3xl">Create product</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Slug" name="slug" />
        <Field label="Name" name="name" />
        <Field label="Base price (paise)" name="price" type="number" />
        <Field label="Legacy inventory" name="inventory" type="number" />
      </div>
      <Area label="Short description" name="shortDescription" />
      <Area label="Full description" name="description" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Area label="Highlights" name="highlights" />
        <Area label="Material" name="material" />
        <Area label="Fit & silhouette" name="fitDetails" />
        <Area label="Care instructions" name="careInstructions" />
        <Area label="Size guide" name="sizeGuide" />
        <Area label="Shipping & returns" name="shippingReturns" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="SKU" name="sku" />
        <Field label="Compare at price" name="compareAtPrice" type="number" />
        <Field label="Sizes summary" name="sizes" />
        <Field label="Colors summary" name="colors" />
      </div>
      <ImageUploadField folder="missy-miss/products" label="Featured product image" name="featuredImage" />
      <Select categories={categories} />
      <div className="flex flex-wrap gap-4">
        <Check checked label="Published" name="isPublished" />
        <Check label="Featured" name="isFeatured" />
        <Check label="New arrival" name="isNewArrival" />
        <Check label="Best seller" name="isBestSeller" />
        <Check label="Trending" name="isTrending" />
        <Check label="Sustainable" name="isSustainable" />
      </div>
      <Button type="submit">Create product</Button>
    </form>
    {products.map((product) => <details className={card} key={product.id}><summary className="cursor-pointer font-display text-3xl">{product.name}</summary>
      <form action={saveProduct} className="mt-6 grid gap-4">
        <input name="id" type="hidden" value={product.id} />
        <input name="manageCategories" type="hidden" value="true" />
        <div className="grid gap-4 md:grid-cols-4"><Field label="Slug" name="slug" value={product.slug} /><Field label="Name" name="name" value={product.name} /><Field label="Base price (paise)" name="price" type="number" value={product.price} /><Field label="Legacy inventory" name="inventory" type="number" value={product.inventory} /></div>
        <Area label="Short description" name="shortDescription" value={product.shortDescription} /><Area label="Full description" name="description" value={product.description} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Area label="Highlights" name="highlights" value={product.highlights} /><Area label="Material" name="material" value={product.material} /><Area label="Fit & silhouette" name="fitDetails" value={product.fitDetails} /><Area label="Care instructions" name="careInstructions" value={product.careInstructions} /><Area label="Size guide" name="sizeGuide" value={product.sizeGuide} /><Area label="Shipping & returns" name="shippingReturns" value={product.shippingReturns} /></div>
        <div className="grid gap-4 md:grid-cols-4"><Field label="SKU" name="sku" value={product.sku} /><Field label="Compare at price" name="compareAtPrice" type="number" value={product.compareAtPrice} /><Field label="Sizes summary" name="sizes" value={product.sizes} /><Field label="Colors summary" name="colors" value={product.colors} /></div>
        <ImageUploadField defaultValue={product.featuredImage} folder="missy-miss/products" label="Featured product image" name="featuredImage" />
        <Select
          categories={categories}
          defaultValue={product.categories.map((item) => item.categoryId)}
        />
        <div className="flex flex-wrap gap-4"><Check checked={product.isPublished} label="Published" name="isPublished" /><Check checked={product.isFeatured} label="Featured" name="isFeatured" /><Check checked={product.isNewArrival} label="New arrival" name="isNewArrival" /><Check checked={product.isBestSeller} label="Best seller" name="isBestSeller" /><Check checked={product.isSustainable} label="Sustainable" name="isSustainable" /></div>
        <Button type="submit">Save product details</Button>
      </form>
      <div className="mt-8 border-t border-[color:var(--color-border)] pt-6"><h3 className="font-display text-2xl">Variants</h3>
        <form action={saveProductVariant} className="mt-4 grid gap-3 rounded-2xl bg-[color:var(--color-paper)]/60 p-4"><input name="productId" type="hidden" value={product.id} /><div className="grid gap-3 md:grid-cols-4"><Field label="Title" name="title" /><Field label="SKU" name="sku" /><Field label="Size" name="size" /><Field label="Color" name="color" /><Field label="Price (paise)" name="price" type="number" /><Field label="Stock" name="inventory" type="number" /><Field label="Weight (grams)" name="weight" type="number" /><Field label="Sort" name="sortOrder" type="number" /><Field label="Length (cm)" name="length" type="number" /><Field label="Breadth (cm)" name="breadth" type="number" /><Field label="Height (cm)" name="height" type="number" /></div><Check checked label="Enabled" name="isEnabled" /><Button type="submit" variant="outline">Add variant</Button></form>
        <div className="mt-3 grid gap-3">{product.variants.map((variant) => <form action={saveProductVariant} className="grid gap-3 rounded-2xl border border-[color:var(--color-border)] p-4 md:grid-cols-5" key={variant.id}><input name="id" type="hidden" value={variant.id} /><input name="productId" type="hidden" value={product.id} /><Field label="Title" name="title" value={variant.title} /><Field label="SKU" name="sku" value={variant.sku} /><Field label="Size" name="size" value={variant.size} /><Field label="Color" name="color" value={variant.color} /><Field label="Price" name="price" type="number" value={variant.price} /><Field label="Stock" name="inventory" type="number" value={variant.inventory} /><Field label="Weight g" name="weight" type="number" value={variant.weight} /><Field label="Length cm" name="length" type="number" value={variant.length} /><Field label="Breadth cm" name="breadth" type="number" value={variant.breadth} /><Field label="Height cm" name="height" type="number" value={variant.height} /><Check checked={variant.isEnabled} label="Enabled" name="isEnabled" /><div className="flex gap-2"><Button type="submit" variant="outline">Update</Button><Button formAction={deleteProductVariant} name="id" type="submit" value={variant.id} variant="ghost">Delete</Button></div></form>)}</div>
      </div>
      <form action={saveProductImage} className="mt-8 grid gap-4 border-t border-[color:var(--color-border)] pt-6"><input name="productId" type="hidden" value={product.id} /><h3 className="font-display text-2xl">Gallery images</h3><ImageUploadField folder="missy-miss/products" label="Add product image" name="imageUrl" /><div className="grid gap-3 md:grid-cols-3"><Field label="Alt text" name="alt" /><Field label="Sort order" name="sortOrder" type="number" /><Check label="Featured" name="isFeatured" /></div><Button type="submit" variant="outline">Add gallery image</Button></form>
      <div className="mt-3 flex flex-wrap gap-2">{product.images.map((image) => <form action={deleteProductImage} key={image.id}><Button name="id" type="submit" value={image.id} variant="ghost">Remove {image.alt || "image"}</Button></form>)}</div>
    </details>)}
  </div>;
}

export function BannersManager({ banners }: { banners: Banner[] }) {
  return <div className="space-y-5"><form action={saveBanner} className={`${card} grid gap-4`}><h2 className="font-display text-3xl">Create banner</h2><BannerFields /><Button type="submit">Create banner</Button></form>{banners.map((banner) => <details className={card} key={banner.id}><summary className="cursor-pointer font-display text-2xl">{banner.title} · {banner.placement}</summary><form action={saveBanner} className="mt-5 grid gap-4"><input name="id" type="hidden" value={banner.id} /><BannerFields banner={banner} /><div className="flex gap-3"><Button type="submit">Update banner</Button><Button formAction={deleteBanner} name="id" type="submit" value={banner.id} variant="outline">Delete</Button></div></form></details>)}</div>;
}

function BannerFields({ banner }: { banner?: Banner }) {
  return <><div className="grid gap-4 md:grid-cols-4"><Field label="Title" name="title" value={banner?.title} /><Field label="Scope" name="scope" value={banner?.scope ?? "home"} /><Field label="Placement" name="placement" value={banner?.placement ?? "hero"} /><Field label="Sort order" name="sortOrder" type="number" value={banner?.sortOrder} /></div><Area label="Subtitle" name="subtitle" value={banner?.subtitle} /><div className="grid gap-4 md:grid-cols-3"><Field label="CTA label" name="ctaLabel" value={banner?.ctaLabel} /><Field label="CTA URL" name="ctaHref" value={banner?.ctaHref} /><Field label="Target slug" name="targetSlug" value={banner?.targetSlug} /></div><div className="grid gap-4 md:grid-cols-2"><ImageUploadField defaultValue={banner?.desktopImage} folder="missy-miss/editorial" label="Desktop image" name="desktopImage" /><ImageUploadField defaultValue={banner?.mobileImage} folder="missy-miss/editorial" label="Mobile image" name="mobileImage" /></div><Check checked={banner?.isEnabled ?? true} label="Enabled" name="isEnabled" /></>;
}

export function ReviewsManager({ products, reviews }: { products: Product[]; reviews: Array<ProductReview & { product: Product }> }) {
  return <div className="space-y-5"><form action={saveProductReview} className={`${card} grid gap-4`}><h2 className="font-display text-3xl">Add review</h2><label className="space-y-2 text-sm font-semibold"><span>Product</span><select className={input} name="productId">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><ReviewFields /><Button type="submit">Save review</Button></form>{reviews.map((review) => <form action={saveProductReview} className={`${card} grid gap-4`} key={review.id}><input name="id" type="hidden" value={review.id} /><input name="productId" type="hidden" value={review.productId} /><h3 className="font-display text-2xl">{review.product.name} · {review.authorName}</h3><ReviewFields review={review} /><div className="flex gap-3"><Button type="submit">Update</Button><Button formAction={deleteProductReview} name="id" type="submit" value={review.id} variant="outline">Delete</Button></div></form>)}</div>;
}

function ReviewFields({ review }: { review?: ProductReview }) {
  return <><div className="grid gap-4 md:grid-cols-4"><Field label="Author name" name="authorName" value={review?.authorName} /><Field label="Author title" name="authorTitle" value={review?.authorTitle} /><Field label="Rating 1-5" name="rating" type="number" value={review?.rating ?? 5} /><Field label="Sort order" name="sortOrder" type="number" value={review?.sortOrder} /></div><Field label="Review title" name="title" value={review?.title} /><Area label="Review body" name="body" value={review?.body} /><div className="flex gap-4"><Check checked={review?.isPublished ?? true} label="Published" name="isPublished" /><Check checked={review?.isFeatured} label="Featured" name="isFeatured" /></div></>;
}

type OrderFull = Order & { items: OrderItem[]; shipment: Shipment | null };
export function OrdersManager({ orders, shippingReady, couriers = {} }: { orders: OrderFull[]; shippingReady: boolean; couriers?: Record<string, Array<{ id: string; name: string; detail: string }>> }) {
  return <div className="space-y-5">{!shippingReady ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Shiprocket shipping credentials missing. Orders remain safe locally until settings are configured.</div> : null}{orders.map((order) => <article className={card} key={order.id}><div className="flex flex-col gap-3 md:flex-row md:justify-between"><div><p className="section-label">{order.status}</p><h2 className="mt-2 font-display text-3xl">Order {order.orderNumber}</h2><p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{order.customerName} · {order.customerPhone} · {order.paymentStatus}</p></div><p className="font-display text-2xl">₹{(order.total / 100).toFixed(2)}</p></div><div className="mt-5 grid gap-2 text-sm">{order.items.map((item) => <p key={item.id}>{item.quantity} × {item.productName} {item.variantName ? `· ${item.variantName}` : ""}</p>)}</div><div className="mt-6 flex flex-wrap gap-3"><form action={approveOrderForShipping}><input name="orderId" type="hidden" value={order.id} /><Button disabled={!shippingReady || Boolean(order.shipment)} type="submit">Approve & send to Shiprocket</Button></form>{order.shipment?.shiprocketShipmentId ? <><form action={assignOrderCourier} className="flex flex-wrap gap-2"><input name="orderId" type="hidden" value={order.id} /><select className={input} defaultValue={couriers[order.id]?.[0]?.id ?? ""} name="courierId"><option value="">Shiprocket recommended</option>{couriers[order.id]?.map((courier) => <option key={courier.id} value={courier.id}>{courier.name} · {courier.detail}</option>)}</select><Button type="submit" variant="outline">Assign AWB</Button></form><form action={scheduleOrderPickup}><input name="orderId" type="hidden" value={order.id} /><Button type="submit" variant="outline">Schedule pickup</Button></form></> : null}<form action={cancelOrder}><input name="orderId" type="hidden" value={order.id} /><Button type="submit" variant="ghost">Cancel order</Button></form></div>{order.shipment ? <p className="mt-4 rounded-2xl bg-[color:var(--color-paper)] p-4 text-sm">Shipment: {order.shipment.status} {order.shipment.awbCode ? `· AWB ${order.shipment.awbCode}` : ""} {order.shipment.courierName ? `· ${order.shipment.courierName}` : ""}</p> : null}</article>)}</div>;
}
