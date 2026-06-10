import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { ADMIN_PAGE_SIZE } from "@/lib/admin-ui";

export function AdminListToolbar({
  actionHref,
  actionLabel,
  query,
  status,
  statuses,
}: {
  actionHref?: string;
  actionLabel?: string;
  query?: string;
  status?: string;
  statuses?: { label: string; value: string }[];
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border)] bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between">
      <form className="flex flex-1 gap-2">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm outline-none focus:border-[color:var(--color-gold-deep)]"
          defaultValue={query}
          name="q"
          placeholder="Search..."
        />
        {statuses?.length ? <select className="h-11 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-3 text-sm" defaultValue={status} name="status"><option value="">All statuses</option>{statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : null}
        <button className={buttonVariants({ variant: "outline" })} type="submit">Search</button>
      </form>
      {actionHref && actionLabel ? <Link className={buttonVariants()} href={actionHref}>{actionLabel}</Link> : null}
    </div>
  );
}

export function AdminList({
  children,
  empty,
}: {
  children: ReactNode;
  empty?: boolean;
}) {
  if (empty) {
    return <div className="rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white/70 p-10 text-center text-sm text-[color:var(--color-muted-foreground)]">No matching records found.</div>;
  }
  return <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white/85">{children}</div>;
}

export function AdminListRow({
  actions,
  children,
}: {
  actions?: ReactNode;
  children: ReactNode;
}) {
  return <div className="flex flex-col gap-4 border-b border-[color:var(--color-border)] p-4 last:border-b-0 md:flex-row md:items-center md:justify-between">{children}{actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}</div>;
}

export function AdminPagination({
  page,
  total,
  query,
  status,
}: {
  page: number;
  total: number;
  query?: string;
  status?: string;
}) {
  const previous = new URLSearchParams({ page: String(Math.max(page - 1, 1)), ...(query ? { q: query } : {}), ...(status ? { status } : {}) });
  const next = new URLSearchParams({ page: String(page + 1), ...(query ? { q: query } : {}), ...(status ? { status } : {}) });
  return (
    <div className="mt-5 flex items-center justify-between text-sm text-[color:var(--color-muted-foreground)]">
      <span>Page {page} · {total} records</span>
      <div className="flex gap-2">
        {page > 1 ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`?${previous}`}>Previous</Link> : null}
        {page * ADMIN_PAGE_SIZE < total ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`?${next}`}>Next</Link> : null}
      </div>
    </div>
  );
}
