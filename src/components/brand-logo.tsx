import { CdnAwareImage as Image } from "@/components/cdn-aware-image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "symbol";
};

export function BrandLogo({
  className,
  priority = false,
  variant = "full",
}: BrandLogoProps) {
  const isFull = variant === "full";

  return (
    <Image
      src={
        isFull
          ? "/brand/missy-miss-logo-full.png"
          : "/brand/missy-miss-logo-symbol.png"
      }
      alt="Missy Miss logo"
      width={isFull ? 920 : 620}
      height={isFull ? 820 : 560}
      priority={priority}
      className={cn("h-auto drop-shadow-[0_14px_28px_rgba(184,145,40,0.18)]", className)}
    />
  );
}
