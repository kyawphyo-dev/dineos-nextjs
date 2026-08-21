import CashierSessionProvider from "@/context/CashierSessionContext";
import getCashierSession from "@/lib/actions/Cashier/GetCashierSession.action";
import getCashierReceipts from "@/lib/actions/Cashier/GetCashierReceipts.action";
import type { CashierSessionResult } from "@/lib/actions/Cashier/GetCashierSession.action";
import type { ReceiptRecord } from "@/app/types/cashier";

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionResult, receiptsResult] = await Promise.all([
    getCashierSession(),
    getCashierReceipts(),
  ]);

  const sessionFallback: CashierSessionResult = {
    restaurant: { id: "", name: "Restaurant" },
    branch: { id: "", name: "", location: null },
    sessions: [],
  };
  const receiptFallback: ReceiptRecord[] = [];

  const sessionsValue: CashierSessionResult =
    sessionResult.success && sessionResult.data
      ? sessionResult.data
      : sessionFallback;
  const receiptsValue: ReceiptRecord[] =
    receiptsResult.success && receiptsResult.data
      ? receiptsResult.data.receipts
      : receiptFallback;

  return (
    <CashierSessionProvider
      value={sessionsValue}
      initialReceipts={receiptsValue}
    >
      {children}
    </CashierSessionProvider>
  );
}
