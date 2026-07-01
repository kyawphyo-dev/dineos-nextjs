import { RoleProvider } from "@/context/RoleContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { RestaurantProvider } from "@/context/RestaurantContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <CatalogProvider>
        <RestaurantProvider>{children}</RestaurantProvider>
      </CatalogProvider>
    </RoleProvider>
  );
}
