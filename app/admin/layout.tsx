import type { Metadata } from "next";
import { RoleProvider } from "@/context/RoleContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { StaffProvider } from "@/context/StaffContext";
import Sidebar from "@/app/admin/components/Sidebar";

export const metadata: Metadata = {
  title: "DineOS — Admin",
  description: "Restaurant management dashboard for owners and managers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
        <RoleProvider>
          <CatalogProvider>
            <StaffProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 px-5 sm:px-8 py-6 max-w-6xl">{children}</main>
              </div>
            </StaffProvider>
          </CatalogProvider>
        </RoleProvider>


  );
}
