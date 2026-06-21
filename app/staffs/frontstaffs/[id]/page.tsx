import { TablesProvider } from "@/context/TablesContext";
import FrontStaffDashboard from "../components/FrontStaffDashboard";
import PageTransition from "@/components/PageTransition";

export default function Page() {
  return (
    <TablesProvider>
      <PageTransition><FrontStaffDashboard /></PageTransition>
      
    </TablesProvider>
  );
}