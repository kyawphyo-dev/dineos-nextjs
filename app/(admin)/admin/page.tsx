import AdminDashboard from "@/components/admin/AdminDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
export default function AdminHomePage() {
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <AdminDashboard />
    </RouteGuard>
  );
}
