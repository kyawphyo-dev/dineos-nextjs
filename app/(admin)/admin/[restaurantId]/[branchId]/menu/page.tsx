import MenuDashboard from "@/components/admin/MenuDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import GetMenuList from "@/lib/actions/GetManuList";
import { toast } from "sonner";

async function page({
  params,
}: {
  params: Promise<{ restaurantId: string; branchId: string }>;
}) {
  const { restaurantId, branchId } = await params;
  const res = await GetMenuList({
    branchId,
  });
  if (!res.success) {
    toast.error(res.message || "Failed to retrieve menu list.");
  }
  const menuList = res?.data?.menuList;
  return (
    <div>
      <RouteGuard allow={["owner", "manager"]}>
        <MenuDashboard menuList={menuList || []} branchId={branchId} />
      </RouteGuard>
    </div>
  );
}

export default page;
