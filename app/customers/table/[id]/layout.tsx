import PageTransition from "@/components/PageTransition";
import { CartProvider } from "@/context/CartContext";
import { OrdersProvider } from "@/context/OrdersContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
      <CartProvider>
          <OrdersProvider>
            <PageTransition>{children}</PageTransition>
          </OrdersProvider>
        </CartProvider>
      </body>
    </html>
  );
}