import KitchenSessionProvider from "@/context/KitchenSessionContext";
import getKitchenSession from "@/lib/actions/Kitchen/GetKitchenSession.action";
import type { KitchenSessionResult } from "@/lib/actions/Kitchen/GetKitchenSession.action";

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const kitchenResult = await getKitchenSession();

  const kitchenFallback: KitchenSessionResult = {
    restaurant: { id: "", name: "Restaurant" },
    branch: { id: "", name: "", location: null },
    menus: [],
    categories: [],
    tickets: [],
  };

  const kitchenValue: KitchenSessionResult =
    kitchenResult.success && kitchenResult.data
      ? kitchenResult.data
      : kitchenFallback;

  return (
    <KitchenSessionProvider value={kitchenValue}>
      {children}
    </KitchenSessionProvider>
  );
}
