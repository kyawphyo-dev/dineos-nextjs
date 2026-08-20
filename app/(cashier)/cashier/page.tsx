import CashierDashboard from "@/components/cashier/CashierDashboard";
import RouteGuard from "@/components/shared/RouteGuard";

export default function CashierPage() {
  return (
    <RouteGuard allow={["cashier", "owner", "manager"]}>
      <CashierDashboard />
    </RouteGuard>
  );
}
