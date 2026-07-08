import ZoneDashboard from "@/components/admin/ZoneDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import GetZone from "@/lib/actions/GetZone.action";
import { toast } from "sonner";

async function page({
  params,
}: {
  params: Promise<{ restaurantId: string; branchId: string }>;
}) {
  const { restaurantId, branchId } = await params;
  const zone = await GetZone(branchId);
  if (!zone.success || !zone.data?.zoneList) {
    toast.error(zone.message || "Failed to retrieve zone list.");
  }
  return (
    <div>
      <RouteGuard allow={["owner", "manager"]}>
        <ZoneDashboard
          zoneList={zone.data?.zoneList || []}
          branchId={branchId}
        />
      </RouteGuard>
    </div>
  );
}

export default page;
