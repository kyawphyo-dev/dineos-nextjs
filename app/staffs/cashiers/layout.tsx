import type { Metadata } from "next";
import { SessionsProvider } from "@/context/SessionsContext";

export const metadata: Metadata = {
  title: "DineOS — Cashier",
  description: "Billing, payment, and session management for cashier staff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

        <SessionsProvider>{children}</SessionsProvider>

  );
}
