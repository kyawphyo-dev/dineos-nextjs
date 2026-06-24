import { SessionsProvider } from "@/context/SessionsContext";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return <SessionsProvider>{children}</SessionsProvider>;
}
