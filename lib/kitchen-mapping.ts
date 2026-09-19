import type { TicketStatus } from "@/app/types/kitchen";
import type { CustomerOrderStatus } from "@/app/types/customer";

export type DbOrderStatus =
  | "pending"
  | "preparing"
  | "served"
  | "completed"
  | "cancelled";

export function mapTicketStatusToOrderStatus(
  ticketStatus: TicketStatus,
): "pending" | "preparing" | "served" | "completed" {
  switch (ticketStatus) {
    case "new":
      return "pending";
    case "preparing":
      return "preparing";
    case "ready":
      return "served";
    case "served":
      return "completed";
  }
}

export function mapOrderStatusToTicketStatus(
  orderStatus: string,
): TicketStatus {
  switch (orderStatus) {
    case "pending":
      return "new";
    case "preparing":
      return "preparing";
    case "served":
      return "ready";
    case "completed":
      return "served";
    default:
      return "new";
  }
}

export const CUSTOMER_STATUS_STEP_LABELS: {
  key: CustomerOrderStatus;
  label: string;
}[] = [
  { key: "received", label: "Order received" },
  { key: "preparing", label: "Kitchen preparing" },
  { key: "ready", label: "Ready to serve" },
  { key: "served", label: "Served" },
];

export function toCustomerOrderStatus(dbStatus: string): CustomerOrderStatus {
  switch (dbStatus) {
    case "pending":
    case "confirm":
      return "received";
    case "preparing":
      return "preparing";
    case "served":
      return "ready";
    case "completed":
      return "served";
    case "cancelled":
      return "cancelled";
    default:
      return "received";
  }
}

export const CUSTOMER_STATUS_STEP_INDEX: Record<CustomerOrderStatus, number> = {
  received: 0,
  pending: 0,
  confirm: 0,
  preparing: 1,
  ready: 2,
  served: 3,
  completed: 3,
  cancelled: -1,
};

export const CUSTOMER_STATUS_BADGE_LABEL: Record<CustomerOrderStatus, string> =
  {
    received: "Received",
    pending: "Received",
    confirm: "Received",
    preparing: "Preparing",
    ready: "Ready to serve",
    served: "Served",
    completed: "Served",
    cancelled: "Cancelled",
  };

export const CUSTOMER_STATUS_BADGE_STYLE: Record<CustomerOrderStatus, string> =
  {
    received: "bg-clay-light text-clay-dark",
    pending: "bg-clay-light text-clay-dark",
    confirm: "bg-clay-light text-clay-dark",
    preparing: "bg-gold-light text-[#9A6C10]",
    ready: "bg-sage-light text-sage",
    served: "bg-sage text-white",
    completed: "bg-sage text-white",
    cancelled: "bg-red-100 text-red-700",
  };
