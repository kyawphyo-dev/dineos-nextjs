import { OrderStatus } from "../../types";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    received: "bg-clay-light text-clay-dark",
    preparing: "bg-gold-light text-[#9A6C10]",
    ready: "bg-sage-light text-sage",
    served: "bg-green-light text-green",
  };
  const labels: Record<OrderStatus, string> = {
    received: "Received",
    preparing: "Preparing",
    ready: "Ready",
    served: "Served"
  };
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}