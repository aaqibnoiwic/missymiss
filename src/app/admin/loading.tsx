export default function AdminLoading() {
  return (
    <main aria-label="Loading admin page" className="mx-auto w-full max-w-7xl animate-pulse px-6 py-10 md:px-10 lg:px-16">
      <div className="relative h-2 overflow-hidden rounded-full bg-[color:var(--color-paper)]">
        <div className="loading-shimmer absolute inset-y-0 w-1/3 rounded-full bg-[linear-gradient(90deg,var(--color-gold),var(--color-gold-deep))]" />
      </div>
      <div className="mt-6 h-40 rounded-[2rem] bg-[color:var(--color-charcoal)]/10" />
      <div className="mt-8 grid gap-3" role="status">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="h-20 rounded-2xl bg-[color:var(--color-paper)]" key={index} />
        ))}
        <span className="sr-only">Loading admin data...</span>
      </div>
    </main>
  );
}
