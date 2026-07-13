"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ColorOption = { name: string; imageUrl: string };
type ColorImageContextValue = { selectedImageUrl: string; setSelectedColor: (color: string) => void };

const ColorImageContext = createContext<ColorImageContextValue | null>(null);

export function ProductColorImageProvider({ children, colorOptions, initialColor = "" }: { children: ReactNode; colorOptions: ColorOption[]; initialColor?: string }) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const selectedImageUrl = useMemo(
    () => colorOptions.find((option) => option.name === selectedColor)?.imageUrl || "",
    [colorOptions, selectedColor],
  );

  return <ColorImageContext.Provider value={{ selectedImageUrl, setSelectedColor }}>{children}</ColorImageContext.Provider>;
}

export function useProductColorImage() {
  return useContext(ColorImageContext);
}
