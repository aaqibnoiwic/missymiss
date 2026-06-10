export default function StorefrontLoading() {
  return (
    <main aria-label="Loading page" className="mx-auto w-full max-w-7xl animate-pulse px-6 py-10 md:px-10 lg:px-16">
      <div className="relative h-2 overflow-hidden rounded-full bg-[color:var(--color-paper)]">
        <div className="loading-shimmer absolute inset-y-0 w-1/3 rounded-full bg-[linear-gradient(90deg,var(--color-gold),var(--color-gold-deep))]" />
      </div>
      <div className="mt-8 h-64 rounded-[2.5rem] bg-[color:var(--color-paper)]" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="space-y-3" key={index}>
            <div className="aspect-[4/5] rounded-[2rem] bg-[color:var(--color-paper)]" />
            <div className="h-4 w-2/3 rounded-full bg-[color:var(--color-paper)]" />
            <div className="h-3 w-1/3 rounded-full bg-[color:var(--color-paper)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
