import { TablesProvider } from "@/context/TablesContext";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <TablesProvider>{children}</TablesProvider>;
}
