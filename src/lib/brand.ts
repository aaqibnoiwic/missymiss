import type { BrandAsset } from "@/types/media";

export const brandAssets: BrandAsset = {
  logoFull: "/brand/missy-miss-logo-full.png",
  logoSymbol: "/brand/missy-miss-logo-symbol.png",
};

export const featuredCategories = [
  {
    title: "Tops & Shirts",
    kicker: "Everyday polish",
    description:
      "Relaxed tailoring, feminine drape, and easy structure for busy wardrobes.",
    tint: "bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(255,255,255,0.8),rgba(245,241,234,0.9))]",
  },
  {
    title: "Dresses",
    kicker: "Signature silhouettes",
    description:
      "From day dresses to occasion pieces with elegant movement and soft detail.",
    tint: "bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(212,175,55,0.12),rgba(200,155,60,0.18))]",
  },
  {
    title: "Baby Girls",
    kicker: "Playful refinement",
    description:
      "Gentle fabrics and charming shapes that feel sweet without losing polish.",
    tint: "bg-[linear-gradient(135deg,rgba(245,241,234,0.95),rgba(255,255,255,0.92),rgba(212,175,55,0.16))]",
  },
  {
    title: "Ethnic Wear",
    kicker: "Modern heritage",
    description:
      "Graceful festive pieces with a cleaner, more contemporary visual finish.",
    tint: "bg-[linear-gradient(135deg,rgba(200,155,60,0.16),rgba(255,255,255,0.85),rgba(245,241,234,0.95))]",
  },
  {
    title: "Office Wear",
    kicker: "Confident dressing",
    description:
      "Co-ord sets, formal shirts, and power layers softened by elegant styling.",
    tint: "bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,241,234,0.88),rgba(212,175,55,0.14))]",
  },
  {
    title: "Reclaimed Thread",
    kicker: "Circular fashion",
    description:
      "A dedicated sustainable story built to spotlight upcycled collections and campaigns.",
    tint: "bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(245,241,234,0.9),rgba(255,255,255,0.95))]",
  },
] as const;

export const featuredProducts = [
  {
    name: "Aurora Shirt",
    category: "Best Seller",
    note: "Soft tailoring with luminous gold-button detail",
    price: "₹2,890",
    tint: "bg-[linear-gradient(160deg,rgba(212,175,55,0.18),rgba(255,255,255,0.5),rgba(245,241,234,0.95))]",
  },
  {
    name: "Juniper Midi",
    category: "New Arrival",
    note: "Fluid movement and understated event dressing",
    price: "₹4,250",
    tint: "bg-[linear-gradient(160deg,rgba(255,255,255,0.54),rgba(212,175,55,0.12),rgba(245,241,234,0.92))]",
  },
  {
    name: "Luna Set",
    category: "Trending",
    note: "Polished co-ord built for elevated workwear",
    price: "₹5,490",
    tint: "bg-[linear-gradient(160deg,rgba(245,241,234,0.95),rgba(255,255,255,0.65),rgba(200,155,60,0.14))]",
  },
  {
    name: "Mini Bloom Dress",
    category: "Kids Pick",
    note: "Playful silhouette with a luxury finishing touch",
    price: "₹1,980",
    tint: "bg-[linear-gradient(160deg,rgba(212,175,55,0.14),rgba(255,255,255,0.82),rgba(245,241,234,0.96))]",
  },
] as const;

export const testimonials = [
  {
    quote:
      "The whole experience feels beautifully premium. The brand finally has atmosphere.",
    name: "Riya K.",
    role: "Early brand reviewer",
  },
  {
    quote:
      "The gold butterfly identity comes through beautifully without overpowering the rest of the page.",
    name: "Aanya S.",
    role: "Fashion buyer",
  },
  {
    quote:
      "Reclaimed Thread feels like a real story, not a throwaway sustainability section.",
    name: "Mitali P.",
    role: "Conscious shopper",
  },
] as const;
