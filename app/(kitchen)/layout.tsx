import { TicketsProvider } from "@/context/TicketsContext";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return <TicketsProvider>{children}</TicketsProvider>;
}
