import CategoriesDashboard from "@/components/admin/CategoriesDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import GetMenuWithCategories from "@/lib/actions/GetMenuWithCategories";
import { toast } from "sonner";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ restaurantId: string; branchId: string }>;
}) {
  const { restaurantId, branchId } = await params;
  const res = await GetMenuWithCategories({
    branchId,
  });
  if (!res.success) {
    toast.error(res.message || "Failed to retrieve menu list.");
  }
  const menuList = res?.data?.menuList;
  console.log("From Categories Page", menuList);
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <CategoriesDashboard menuList={menuList || []} />
    </RouteGuard>
  );
}
