import { CustomerOrder, CustomerOrderStatus } from "@/app/types/customer";
import { motion } from "framer-motion";
import { Ban, Check, Flame, Utensils } from "lucide-react";
import {
  CUSTOMER_STATUS_BADGE_LABEL,
  CUSTOMER_STATUS_BADGE_STYLE,
  CUSTOMER_STATUS_STEP_INDEX,
  CUSTOMER_STATUS_STEP_LABELS,
  toCustomerOrderStatus,
} from "@/lib/kitchen-mapping";

export { toCustomerOrderStatus };

const STATUS_STEPS = CUSTOMER_STATUS_STEP_LABELS;
const STATUS_INDEX = CUSTOMER_STATUS_STEP_INDEX;

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
  const style =
    CUSTOMER_STATUS_BADGE_STYLE[status] ??
    CUSTOMER_STATUS_BADGE_STYLE.received;
  const label =
    CUSTOMER_STATUS_BADGE_LABEL[status] ??
    CUSTOMER_STATUS_BADGE_LABEL.received;
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${style}`}
    >
      {label}
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
  const mappedStatus: CustomerOrderStatus =
    order.status in STATUS_INDEX || order.status === "cancelled"
      ? order.status
      : "received";
  const isCancelled = mappedStatus === "cancelled";
  const currentStep = isCancelled ? -1 : STATUS_INDEX[mappedStatus] ?? 0;
  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const estimatedMin = order.estimatedMin ?? 15;
  const placedLabel = formatPlacedAt(order.placedAt);

  const dotClassFor = (i: number) => {
    if (isCancelled) return "bg-red-100 text-red-500 border border-red-200";
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
    if (isCancelled) return "bg-red-100";
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
    if (isCancelled) return "Order cancelled";
    if (isDone) return placedLabel;
    if (isActive) {
      if (stepKey === "ready") return "Waiting for server";
      if (stepKey === "served") return "Enjoy your meal";
      return `In progress · ~${estimatedMin} min`;
    }
    return "Waiting…";
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-black/8 p-4 ${
        isCancelled ? "opacity-90" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-text-hint">Order #{order.id}</span>
        <StatusBadge status={mappedStatus} />
      </div>

      {isCancelled ? (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Ban className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-red-700">
              This order has been cancelled
            </p>
            <p className="text-[12px] text-red-600/80 mt-0.5">
              Placed at {placedLabel}. Contact staff for details.
            </p>
          </div>
        </div>
      ) : (
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
      )}

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
