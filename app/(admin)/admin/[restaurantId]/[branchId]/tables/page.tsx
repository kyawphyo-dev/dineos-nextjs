import TablesDashboard from "@/components/admin/TablesDashboard";
import RouteGuard from "@/components/shared/RouteGuard";
import GetTables from "@/lib/actions/GetTables.action";

export default async function TablesPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  const res = await GetTables({ params: { branchId } });
  if (!res.success) return null;
  const { tables, zones } = res.data || {};

  return (
    <RouteGuard allow={["owner", "manager"]}>
      <TablesDashboard
        tables={tables || []}
        zones={zones || []}
        branchId={branchId}
      />
    </RouteGuard>
  );
}
