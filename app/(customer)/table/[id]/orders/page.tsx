"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Plus, Receipt, Check, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useEffect } from "react";
import StatusBar from "@/components/shared/StatusBar";
import { useOrders } from "@/context/OrdersContext";
import { useCustomerTableSession } from "@/app/(customer)/table/[id]/CustomerTableSessionProvider";
import type { CustomerOrder, CustomerOrderStatus } from "@/app/types/customer";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const STATUS_STEPS: { key: CustomerOrderStatus; label: string }[] = [
  { key: "received", label: "Order received" },
  { key: "preparing", label: "Kitchen preparing" },
  { key: "ready", label: "Ready to serve" },
];

const STATUS_INDEX: Record<CustomerOrderStatus, number> = {
  received: 0,
  preparing: 1,
  ready: 2,
  pending: 0,
  confirm: 0,
  served: 2,
  completed: 2,
  cancelled: 2,
};

function toCustomerOrderStatus(dbStatus: string): CustomerOrderStatus {
  switch (dbStatus) {
    case "pending":
    case "confirm":
      return "received";
    case "preparing":
      return "preparing";
    case "served":
    case "completed":
      return "ready";
    default:
      return "received" as CustomerOrderStatus;
  }
}

function formatPlacedAt(value: string): string {
  if (!value) return "Just now";
  if (!value.includes("-") && !value.includes("T")) return value;
  try {
    const d = new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

function StatusBadge({ status }: { status: CustomerOrderStatus }) {
  const styles: Record<CustomerOrderStatus, string> = {
    received: "bg-clay-light text-clay-dark",
    preparing: "bg-gold-light text-[#9A6C10]",
    ready: "bg-sage-light text-sage",
    pending: "bg-clay-light text-clay-dark",
    confirm: "bg-clay-light text-clay-dark",
    served: "bg-sage-light text-sage",
    completed: "bg-sage-light text-sage",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<CustomerOrderStatus, string> = {
    received: "Received",
    preparing: "Preparing",
    ready: "Ready",
    pending: "Received",
    confirm: "Received",
    served: "Served",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const statusKey = (
    order.status in STATUS_INDEX ? order.status : "received"
  ) as CustomerOrderStatus;
  const currentStep = STATUS_INDEX[statusKey] ?? 0;
  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const estimatedMin = order.estimatedMin ?? 15;
  const placedLabel = formatPlacedAt(order.placedAt);

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-text-hint">Order #{order.id}</span>
        <StatusBadge status={statusKey} />
      </div>

      <div className="flex flex-col gap-0 mb-4">
        {STATUS_STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isLast = i === STATUS_STEPS.length - 1;

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={isActive ? { scale: 0.8 } : false}
                  animate={isActive ? { scale: [0.8, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isDone
                      ? "bg-clay text-white"
                      : isActive
                        ? "bg-gold text-white"
                        : "bg-cream-dark text-text-hint border-[1.5px] border-black/15"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : isActive ? (
                    <Flame className="w-2.5 h-2.5" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.div>
                {!isLast && (
                  <div
                    className={`w-px flex-1 my-0.5 min-h-5 ${isDone ? "bg-clay/40" : "bg-black/10"}`}
                  />
                )}
              </div>
              <div className="pb-4">
                <p className="text-[13px] font-medium text-text-primary">
                  {step.label}
                </p>
                <p className="text-[11px] text-text-hint mt-0.5">
                  {isDone
                    ? placedLabel
                    : isActive
                      ? `In progress · ~${estimatedMin} min`
                      : "Waiting…"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-black/8 pt-3 flex flex-col gap-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-text-primary">{item.name}</p>
              <p className="text-[12px] text-text-hint">× {item.qty}</p>
            </div>
            <p className="text-[13px] font-medium text-clay-dark">
              ฿{item.price * item.qty}
            </p>
          </div>
        ))}
        <div className="border-t border-black/8 pt-2.5 mt-1 flex justify-between items-center">
          <span className="text-[13px] font-medium text-text-muted">
            Order total
          </span>
          <span className="text-[16px] font-medium text-clay-dark">
            ฿{total}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const { orders: localOrders } = useOrders();
  const { orders: dbOrders, table } = useCustomerTableSession();
  const { tableId, setTableId } = useCart();
  const id = params.id as string;

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);

  const displayTableNumber = table?.tableNumber ?? tableId ?? "—";

  const normalizedDbOrders: CustomerOrder[] = useMemo(
    () =>
      dbOrders.map((o) => ({
        id: o.id,
        tableId: table?.id ?? id,
        status: toCustomerOrderStatus(o.status),
        placedAt: o.placedAt,
        estimatedMin: 15,
        items: o.items.map((it) => ({
          name: it.name,
          qty: it.qty,
          price: it.price,
        })),
      })),
    [dbOrders, table?.id, id],
  );

  const allOrders = useMemo(() => {
    const seen = new Set<string>();
    const merged: CustomerOrder[] = [];
    for (const o of normalizedDbOrders) {
      merged.push(o);
      seen.add(o.id);
    }
    for (const o of localOrders) {
      if (!seen.has(o.id)) merged.push(o);
    }
    return merged.sort((a, b) => {
      const ta = a.placedAt.includes("T") ? new Date(a.placedAt).getTime() : 0;
      const tb = b.placedAt.includes("T") ? new Date(b.placedAt).getTime() : 0;
      return tb - ta;
    });
  }, [normalizedDbOrders, localOrders]);

  const handleRequestBill = () => {
    toast.success("Bill requested");
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <StatusBar dark />

      <div className="bg-bark px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push(`/table/${tableId}/menu`)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 text-white/80" />
        </button>
        <span className="text-[16px] font-medium text-white">My Orders</span>
        <span className="ml-auto text-[12px] text-white/55">
          Table {displayTableNumber}
        </span>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {allOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {allOrders.length === 0 && (
          <div className="text-center py-16 text-text-hint text-[14px]">
            No orders yet. Place an order from the menu to see it here.
          </div>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-2.5 border-t border-black/8 bg-cream">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/table/${tableId}/menu`)}
          className="w-full border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Order more
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRequestBill}
          className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
        >
          <Receipt className="w-4 h-4" />
          Request bill
        </motion.button>
      </div>
    </div>
  );
}
