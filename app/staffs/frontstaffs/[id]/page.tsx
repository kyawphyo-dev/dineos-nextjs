import { TablesProvider } from "@/context/TablesContext";
import FrontStaffDashboard from "../components/FrontStaffDashboard";

export default function Page() {
  return (
    <TablesProvider>
      <FrontStaffDashboard />
    </TablesProvider>
  );
}