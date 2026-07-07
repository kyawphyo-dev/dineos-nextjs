import RouteGuard from "@/components/shared/RouteGuard";
import PackagesDashboard from "@/components/admin/PackagesDashboard";
import { AdminInterface } from "@/app/types/admin";
import GetPackages from "@/lib/actions/GetPackages.action";

export default async function PackagesPage({
  params,
}: {
  params: Promise<AdminInterface>;
}) {
  const { restaurantId, branchId } = await params;
  const packages = await GetPackages({
    branchId,
  });
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <PackagesDashboard
        packages={packages.data?.packages || []}
        branchId={branchId}
      />
    </RouteGuard>
  );
}
