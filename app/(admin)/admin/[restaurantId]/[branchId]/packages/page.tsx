import RouteGuard from "@/components/shared/RouteGuard";
import PackagesDashboard from "@/components/admin/PackagesDashboard";
import { AdminInterface } from "@/app/types/admin";
import GetPackages from "@/lib/actions/GetPackages.action";
import GetMenuWithCategoriesAndItems from "@/lib/actions/GetMenuWithCategoriesAndItems.action";

export default async function PackagesPage({
  params,
}: {
  params: Promise<AdminInterface>;
}) {
  const { branchId } = await params;
  const packages = await GetPackages({
    branchId,
  });
  const menusRes = await GetMenuWithCategoriesAndItems({
    params: {
      branchId,
    },
  });
  const menus = menusRes?.data?.data ?? [];

  return (
    <RouteGuard allow={["owner", "manager"]}>
      <PackagesDashboard
        packages={packages.data?.packages || []}
        menus={menus}
        branchId={branchId}
      />
    </RouteGuard>
  );
}
