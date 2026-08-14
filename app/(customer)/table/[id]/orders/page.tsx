"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Receipt,
  Check,
  Flame,
  Utensils,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useEffect } from "react";
import { useCustomerTableSession } from "@/context/CustomerTableSessionProvider";
import type { CustomerOrder, CustomerOrderStatus } from "@/app/types/customer";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const STATUS_STEPS: { key: CustomerOrderStatus; label: string }[] = [
  { key: "received", label: "Order received" },
  { key: "preparing", label: "Kitchen preparing" },
  { key: "ready", label: "Ready to serve" },
  { key: "served", label: "Served" },
];

const STATUS_INDEX: Record<CustomerOrderStatus, number> = {
  pending: 0,
  confirm: 0,
  received: 0,
  preparing: 1,
  ready: 2,
  served: 3,
  completed: 3,
  cancelled: 3,
};

function toCustomerOrderStatus(dbStatus: string): CustomerOrderStatus {
  switch (dbStatus) {
    case "pending":
    case "confirm":
      return "received";
    case "preparing":
      return "preparing";
    case "ready":
      return "ready";
    case "served":
      return "served";
    case "completed":
      return "served";
    case "cancelled":
      return "cancelled";
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
    served: "bg-sage text-white",
    completed: "bg-sage text-white",
    pending: "bg-clay-light text-clay-dark",
    confirm: "bg-clay-light text-clay-dark",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<CustomerOrderStatus, string> = {
    received: "Received",
    preparing: "Preparing",
    ready: "Ready to serve",
    served: "Served",
    completed: "Served",
    pending: "Received",
    confirm: "Received",
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

function StepDotIcon({
  isDone,
  isActive,
  stepIndex,
}: {
  isDone: boolean;
  isActive: boolean;
  stepIndex: number;
}) {
  if (isDone) {
    if (stepIndex === 3) {
      return <Utensils className="w-2.5 h-2.5" />;
    }
    return <Check className="w-2.5 h-2.5" />;
  }
  if (isActive) {
    if (stepIndex === 2) {
      return <Utensils className="w-2.5 h-2.5" />;
    }
    return <Flame className="w-2.5 h-2.5" />;
  }
  return <span>{stepIndex + 1}</span>;
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const statusKey = (
    order.status in STATUS_INDEX ? order.status : "received"
  ) as CustomerOrderStatus;
  const currentStep = STATUS_INDEX[statusKey] ?? 0;
  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const estimatedMin = order.estimatedMin ?? 15;
  const placedLabel = formatPlacedAt(order.placedAt);

  const dotClassFor = (i: number) => {
    const isDone = i < currentStep;
    const isActive = i === currentStep;
    if (isDone) {
      if (i === 3) return "bg-sage text-white";
      if (i === 2) return "bg-sage text-white";
      return "bg-clay text-white";
    }
    if (isActive) {
      if (i === 2) return "bg-sage text-white";
      if (i === 3) return "bg-sage text-white";
      return "bg-gold text-white";
    }
    return "bg-cream-dark text-text-hint border-[1.5px] border-black/15";
  };

  const lineClassFor = (i: number) => {
    if (i < currentStep) {
      if (i >= 2) return "bg-sage/50";
      return "bg-clay/40";
    }
    return "bg-black/10";
  };

  const subtitleFor = (
    stepKey: CustomerOrderStatus,
    isDone: boolean,
    isActive: boolean,
  ) => {
    if (isDone) return placedLabel;
    if (isActive) {
      if (stepKey === "ready") return "Waiting for server";
      if (stepKey === "served") return "Enjoy your meal";
      return `In progress · ~${estimatedMin} min`;
    }
    return "Waiting…";
  };

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
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${dotClassFor(i)}`}
                >
                  <StepDotIcon
                    isDone={isDone}
                    isActive={isActive}
                    stepIndex={i}
                  />
                </motion.div>
                {!isLast && (
                  <div
                    className={`w-px flex-1 my-0.5 min-h-5 ${lineClassFor(i)}`}
                  />
                )}
              </div>
              <div className="pb-4">
                <p className="text-[13px] font-medium text-text-primary">
                  {step.label}
                </p>
                <p className="text-[11px] text-text-hint mt-0.5">
                  {subtitleFor(step.key, isDone, isActive)}
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
  const { orders: dbOrders, table } = useCustomerTableSession();
  const { tableId, setTableId } = useCart();
  const id = params.id as string;

  useEffect(() => {
    if (id) setTableId(id);
  }, [id, setTableId]);

  const displayTableNumber = table?.tableNumber ?? tableId ?? "—";

  const allOrders: CustomerOrder[] = useMemo(
    () =>
      dbOrders
        .map((o) => ({
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
        }))
        .sort((a, b) => {
          const ta = a.placedAt.includes("T")
            ? new Date(a.placedAt).getTime()
            : 0;
          const tb = b.placedAt.includes("T")
            ? new Date(b.placedAt).getTime()
            : 0;
          return tb - ta;
        }),
    [dbOrders, table?.id, id],
  );

  const handleRequestBill = () => {
    toast.success("Bill requested");
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
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
