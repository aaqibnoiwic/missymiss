// Banner.presentation decides whether the title/subtitle are drawn over the artwork.
// "image" = artwork only (the image already carries its own text). "cover" is the
// legacy value from before this option existed and keeps showing the text.
export const BANNER_PRESENTATION_OPTIONS = [
  ["image", "Image only — no text on banner"],
  ["overlay", "Show title & subtitle on banner"],
] as const;

export const BANNER_TEXT_ALIGNMENT_OPTIONS = [
  ["left", "Left"],
  ["center", "Centre"],
  ["right", "Right"],
] as const;

export const BANNER_IMAGE_HINTS = {
  desktop: "Desktop & tablet (768px+): 1984 × 528 px (about 3.75 : 1). Edges may crop on very wide screens.",
  mobile: "Mobile: 1122 × 1402 px (4 : 5 portrait). Falls back to the desktop image if empty.",
} as const;

export function bannerShowsText(presentation: string) {
  return presentation === "overlay" || presentation === "cover";
}
