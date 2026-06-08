export function RichText({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="space-y-5 text-base leading-8 text-[color:var(--color-muted-foreground)]">
      {blocks.map((block) => {
        if (block.startsWith("### ")) {
          return (
            <h3
              className="font-display text-3xl leading-tight text-[color:var(--color-charcoal)]"
              key={block}
            >
              {block.replace("### ", "")}
            </h3>
          );
        }

        if (block.includes("\n- ")) {
          const items = block
            .split("\n")
            .map((item) => item.replace(/^- /, "").trim())
            .filter(Boolean);

          return (
            <ul className="grid gap-3" key={block}>
              {items.map((item) => (
                <li
                  className="rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-4 py-3"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return <p key={block}>{block}</p>;
      })}
    </div>
  );
}
