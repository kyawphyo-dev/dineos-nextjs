import type { ReactNode } from "react";
import GetCustomerTableSession from "@/lib/actions/customer/GetCustomerTableSession.action";
import NoDiningSessionView from "../../../../components/customer/NoDiningSessionView";
import CustomerTableSessionProvider from "../../../../context/CustomerTableSessionProvider";

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

  if (!result.success || !result.data) {
    return <NoDiningSessionView tableIdentifier={id} tableNumber={null} />;
  }

  if (!hasSession) {
    return (
      <NoDiningSessionView
        tableIdentifier={id}
        tableNumber={result.data.table.tableNumber}
      />
    );
  }

  const { restaurant, branch, table, session, categories, orders } =
    result.data;

  return (
    <CustomerTableSessionProvider
      value={{
        restaurant,
        branch,
        table,
        session: session!,
        categories,
        orders,
      }}
    >
      {children}
    </CustomerTableSessionProvider>
  );
}
