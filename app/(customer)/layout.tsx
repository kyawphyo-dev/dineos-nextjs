import { CartProvider } from "@/context/CartContext";
import PageTransition from "@/components/shared/PageTransition";

// Customer-facing routes (landing, menu, cart, orders) are reached purely
// via QR code at the table — intentionally no auth/login wall here.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <PageTransition>{children}</PageTransition>
    </CartProvider>
  );
}
