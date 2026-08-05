import type { ReactNode } from "react";
import GetCustomerTableSession from "@/lib/actions/customer/GetCustomerTableSession.action";
import NoDiningSessionView from "./NoDiningSessionView";
import CustomerTableSessionProvider from "./CustomerTableSessionProvider";

export type Params = {
  id: string;
};

export default async function TableLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { id } = await params;

  const result = await GetCustomerTableSession({ tableIdentifier: id });
  const hasSession = Boolean(result.success && result.data?.session);

  if (!hasSession) {
    return (
      <NoDiningSessionView
        tableIdentifier={id}
        tableNumber={result.success ? result.data?.table.tableNumber : null}
      />
    );
  }

  return (
    <CustomerTableSessionProvider
      value={{
        table: result.data!.table,
        session: result.data!.session!,
      }}
    >
      {children}
    </CustomerTableSessionProvider>
  );
}
