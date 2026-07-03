import AdminDashboard from "@/components/admin/AdminDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import GetDashboardData from "@/lib/actions/GetDashboardData.action";
import { toast } from "sonner";
type Params = {
  restaurantId: string;
  branchId: string;
};

export default async function AdminHomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { restaurantId, branchId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    toast.error("Please login first");
    return null;
  }
  if (session.user.role !== "owner" && session.user.role !== "manager") {
    toast.error("You are not authorized to access this page");
    return null;
  }

  const result = await GetDashboardData({ restaurantId, branchId });
  console.log("dashboard data", result);

  if (!result.success || !result.data) {
    return (
      <RouteGuard allow={["owner", "manager"]}>
        <div className="min-h-screen flex items-center justify-center text-text-primary">
          {result.message || "Failed to load dashboard data"}
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allow={["owner", "manager"]}>
      <AdminDashboard data={result.data} />
    </RouteGuard>
  );
}
