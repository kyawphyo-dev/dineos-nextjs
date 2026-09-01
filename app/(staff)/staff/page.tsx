import StaffDashboard from "@/components/staff/StaffDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { getStaffTables } from "@/lib/actions/staff/getStaffTable.action";
import { GetRestaurant } from "@/lib/actions/staff/GetRestaurant.action";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import GetPackages from "@/lib/actions/GetPackages.action";

export default async function StaffPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const { branchId } = session.user || "";
  if (!branchId) return null;

  const res = await getStaffTables();
  if (!res.success) return null;
  const { tables } = res.data || {};

  const resBranch = await GetRestaurant();
  if (!resBranch.success) return null;
  const { branch } = resBranch.data || {};

  const packageData = await GetPackages({ branchId });
  if (!packageData.success) return null;
  const { packages } = packageData.data || {};

  return (
    <RouteGuard allow={["front_staff", "owner", "manager"]}>
      <StaffDashboard
        tables={tables || []}
        branch={branch}
        packages={packages || []}
      />
    </RouteGuard>
  );
}
