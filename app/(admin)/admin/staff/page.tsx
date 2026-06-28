import StaffDashboard from "@/components/admin/StaffDasshboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { GetAllUsers } from "@/lib/actions/GetAllUsers.action";
import { errorAction } from "@/lib/response";

export default async function StaffPage() {
  const result = await GetAllUsers({
    page: 1,
    pageSize: 15,
    search: "",
    filter: "",
  });
  if (!result) {
    return errorAction("user not found");
  }
  const {
    totalUsers = 0,
    users = [],
    currentPage = 1,
    totalPages = 1,
  } = result.data || {};

  console.log("totalUser:", totalUsers, "user:", users);
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <StaffDashboard staff={users} totalStaff={totalUsers} />
    </RouteGuard>
  );
}
