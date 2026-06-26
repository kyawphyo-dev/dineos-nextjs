import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/shared/AuthSessionProvider";

export const metadata: Metadata = {
  title: "DineOS",
  description:
    "Restaurant management platform — ordering, kitchen, cashier, and admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
