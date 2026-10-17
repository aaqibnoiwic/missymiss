import { ReactNode } from "react";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SupportChat } from "@/components/support-chat";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
      <SupportChat />
    </CartProvider>
  );
}
