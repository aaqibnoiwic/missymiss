import { StorefrontHeader } from "@/components/storefront-header";
import { getNavigationCategories } from "@/lib/cms";

export async function SiteHeader() {
  const categories = await getNavigationCategories().catch(() => []);
  return <StorefrontHeader categories={categories.map(({ id, slug, title, collectionType }) => ({ id, slug, title, collectionType }))} />;
}
