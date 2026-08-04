import type { ReactNode } from "react";
import GetCustomerTableSession from "@/lib/actions/customer/GetCustomerTableSession.action";
import NoDiningSessionView from "./NoDiningSessionView";

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
    return <NoDiningSessionView tableIdentifier={id} />;
  }

  return children;
}

