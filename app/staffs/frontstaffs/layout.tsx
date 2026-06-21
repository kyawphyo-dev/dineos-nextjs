import type { Metadata } from "next";
import { TablesProvider } from "@/context/TablesContext";

export const metadata: Metadata = {
  title: "DineOS — Front Staff",
  description: "Table management and session control for front-of-house staff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

        <TablesProvider>{children}</TablesProvider>
  );
}
