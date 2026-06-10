import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/admin/logout-button";

const links = [
  ["/admin", "Overview"],
  ["/admin/products", "Products"],
  ["/admin/orders", "Orders"],
  ["/admin/reviews", "Reviews"],
  ["/admin/banners", "Banners"],
  ["/admin/content", "Content"],
  ["/admin/media", "Media"],
  ["/admin/settings", "Settings"],
];

export function AdminShell({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] p-5 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-2"><BrandLogo variant="symbol" className="w-12" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[.25em] text-white/55">{eyebrow}</p><h1 className="mt-1 font-display text-4xl">{title}</h1></div>
          </div>
          <LogoutButton />
        </div>
        <nav className="mt-5 flex gap-2 overflow-auto border-t border-white/15 pt-5">
          {links.map(([href, label]) => <Link className="whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white" href={href} key={href}>{label}</Link>)}
        </nav>
      </div>
      {children}
    </main>
  );
}
