import { useCustomerTableSession } from "@/context/CustomerTableSessionProvider";
import { Clock, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

function formatPlacedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

export default function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  const { orders } = useCustomerTableSession();

  const recentOrderHint = useMemo(() => {
    if (orders.length === 0) return null;
    const latest = orders[0];
    return {
      items: latest.items.reduce((s, i) => s + i.qty, 0),
      time: formatPlacedAt(latest.placedAt),
    };
  }, [orders]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-clay-light flex items-center justify-center mb-4">
        <ShoppingBag className="w-7 h-7 text-clay-dark" />
      </div>
      <p className="text-[15px] font-medium text-text-primary mb-1">
        Your cart is empty
      </p>
      <p className="text-[13px] text-text-muted mb-5 max-w-xs mx-auto">
        Add some dishes from the menu to get started.
      </p>
      {recentOrderHint && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-black/8 text-[12px] text-text-muted mb-5">
          <Clock className="w-3.5 h-3.5 text-text-hint" />
          <span>
            Last order · {recentOrderHint.items} items · {recentOrderHint.time}
          </span>
        </div>
      )}
      <button
        onClick={onBrowse}
        className="bg-clay text-white rounded-xl px-5 py-2.5 text-[13px] font-medium"
      >
        Browse menu
      </button>
    </div>
  );
}
