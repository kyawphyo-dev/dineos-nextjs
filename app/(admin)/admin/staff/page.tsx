import StaffDashboard from "@/components/admin/StaffDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { GetAllUsers } from "@/lib/actions/GetAllUsers.action";
import type { StaffMember } from "@/app/types/admin";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

export default async function StaffPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const result = await GetAllUsers({
    page: 1,
    pageSize: 15,
    search: "",
    filter: "",
  });

  if (!result || !result.success) {
    return <div>Error loading staff</div>;
  }

  const { totalUsers = 0, users = [] } = result.data || {};

  const mappedStaff: StaffMember[] = users.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    restaurantId: user.restaurantId,
    branchId: user.branchId,
    zoneId: user.zoneId,
    status: user.status,
  }));

  return (
    <RouteGuard allow={["owner", "manager"]}>
      <StaffDashboard
        staff={mappedStaff}
        totalStaff={totalUsers}
        currentUser={session.user}
      />
    </RouteGuard>
  );
}
