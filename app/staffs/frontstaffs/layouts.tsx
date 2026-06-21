"use client";

import PageTransition from "@/components/PageTransition";
import { TablesProvider } from "@/context/TablesContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TablesProvider>
      <PageTransition>{children}</PageTransition>
      
    </TablesProvider>
  );
}