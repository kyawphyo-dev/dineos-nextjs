import { CustomerOrder, CustomerOrderStatus } from "@/app/types/customer";
import { motion } from "framer-motion";
import { Check, Flame, Utensils } from "lucide-react";

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

export function toCustomerOrderStatus(dbStatus: string): CustomerOrderStatus {
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

export function OrderCard({ order }: { order: CustomerOrder }) {
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
