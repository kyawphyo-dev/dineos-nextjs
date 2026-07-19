import StaffDashboard from "@/components/staff/StaffDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { getStaffTables } from "@/lib/actions/staff/getStaffTable";
import { GetRestaurant } from "@/lib/actions/staff/GetRestaurant";

export default async function StaffPage() {
  const res = await getStaffTables();
  if (!res.success) return null;
  const { tables } = res.data || {};

  const resBranch = await GetRestaurant();
  if (!resBranch.success) return null;
  const { branch } = resBranch.data || {};

  return (
    <RouteGuard allow={["front_staff", "owner", "manager"]}>
      <StaffDashboard tables={tables || []} branch={branch} />
    </RouteGuard>
  );
}
