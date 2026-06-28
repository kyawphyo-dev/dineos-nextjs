import { RoleProvider } from "@/context/RoleContext";
import { CatalogProvider } from "@/context/CatalogContext";

import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <CatalogProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 px-5 sm:px-8 py-6 max-w-6xl">{children}</main>
        </div>
      </CatalogProvider>
    </RoleProvider>
  );
}
