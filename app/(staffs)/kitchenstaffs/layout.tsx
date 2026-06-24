import type { Metadata } from "next";
import { TicketsProvider } from "@/context/TicketsContext";

export const metadata: Metadata = {
  title: "DineOS — Kitchen Staff",
  description: "Order management and ticket tracking for kitchen staff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (


        <TicketsProvider>{children}</TicketsProvider>

  );
}
