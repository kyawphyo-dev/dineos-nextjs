import HistoryDashboard from "@/components/cashier/HistoryDashboard";
import RouteGuard from "@/components/shared/RouteGuard";

export default function HistoryPage() {
  return (
    <RouteGuard allow={["cashier", "owner", "manager"]}>
      <HistoryDashboard />
    </RouteGuard>
  );
}
