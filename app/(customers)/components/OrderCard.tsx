import { motion } from "framer-motion";
import { Order, OrderStatus } from "../types";
import StatusBadge from "./ui/OrderStatusBadge";
import { Check, Flame } from "lucide-react";

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
    { key: "received", label: "Order received" },
    { key: "preparing", label: "Kitchen preparing" },
    { key: "served", label: "Served" },
  ];

const STATUS_INDEX: Record<OrderStatus, number> = {
    received: 0,
    preparing: 1,
    ready: 2,
    served: 3,
  };

export default function OrderCard({ order }: { order: Order }) {
    const currentStep = STATUS_INDEX[order.status];
    const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  
    return (
      <div className="bg-white rounded-2xl border border-black/8 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] text-text-hint">Order #{order.id}</span>
          <StatusBadge status={order.status} />
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
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
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
                    <div className={`w-px flex-1 my-0.5 min-h-[20px] ${isDone ? "bg-clay/40" : "bg-black/10"}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-[13px] font-medium text-text-primary">{step.label}</p>
                  <p className="text-[11px] text-text-hint mt-0.5">
                    {isDone
                      ? order.placedAt
                      : isActive
                      ? `In progress · ~${order.estimatedMin} min`
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
              <p className="text-[13px] font-medium text-clay-dark">฿{item.price * item.qty}</p>
            </div>
          ))}
          <div className="border-t border-black/8 pt-2.5 mt-1 flex justify-between items-center">
            <span className="text-[13px] font-medium text-text-muted">Order total</span>
            <span className="text-[16px] font-medium text-clay-dark">฿{total}</span>
          </div>
        </div>
      </div>
    );
  }