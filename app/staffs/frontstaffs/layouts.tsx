"use client";

import { TablesProvider } from "@/context/TablesContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TablesProvider>
      {children}
    </TablesProvider>
  );
}