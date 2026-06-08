import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { getPublishedPage } from "@/lib/cms";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.excerpt,
    keywords: page.keywords,
    openGraph: {
      images: page.ogImage ? [page.ogImage] : [],
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.excerpt,
    },
  };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) notFound();

  return (
    <main>
      <section className="relative border-b border-[color:var(--color-border)]">
        <div className="absolute inset-0 hero-mesh opacity-80" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center md:px-10 lg:px-16">
          <p className="section-label">{page.eyebrow || page.pageType}</p>
          <h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.05em] text-[color:var(--color-charcoal)] md:text-6xl">
            {page.title}
          </h1>
          {page.excerpt ? (
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[color:var(--color-muted-foreground)]">
              {page.excerpt}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 md:px-10">
        <div className="rounded-[2.5rem] border border-[color:var(--color-border)] bg-white/85 p-7 shadow-[0_20px_70px_rgba(117,96,58,0.08)] md:p-10">
          <RichText body={page.body} />
          {slug === "contact-us" ? (
            <div className="mt-8">
              <Button>Send an Enquiry</Button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
