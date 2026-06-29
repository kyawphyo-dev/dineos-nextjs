import StaffDashboard from "@/components/admin/StaffDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { GetAllUsers } from "@/lib/actions/GetAllUsers.action";
import type { StaffMember } from "@/app/types/admin";
import { toast } from "sonner";

export default async function StaffPage() {
  const result = await GetAllUsers({
    page: 1,
    pageSize: 15,
    search: "",
    filter: "",
  });
  if (!result || !result.success) {
    return toast.error(result.message || "Error loading staff");
  }
  const {
    totalUsers = 0,
    users = [],
    currentPage = 1,
    totalPages = 1,
  } = result.data || {};

  const mappedStaff: StaffMember[] = users.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    status: "active",
  }));

  return (
    <RouteGuard allow={["owner", "manager"]}>
      <StaffDashboard staff={mappedStaff} totalStaff={totalUsers} />
    </RouteGuard>
  );
}
