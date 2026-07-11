import MenuItemsDashboard from "@/components/admin/MenuItemsDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import GetMenuWithCategoriesAndItems from "@/lib/actions/GetMenuWithCategoriesAndItems.action";

export default async function MenuItemsPage({
  params,
}: {
  params: Promise<{ restaurantId: string; branchId: string }>;
}) {
  const { restaurantId, branchId } = await params;
  const res = await GetMenuWithCategoriesAndItems({
    params: {
      branchId,
    },
  });
  if (!res?.success) {
    throw new Error(res?.message ?? "Failed to fetch menu items");
  }
  const menus = res?.data?.data ?? [];
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <MenuItemsDashboard menus={menus} />
    </RouteGuard>
  );
}
