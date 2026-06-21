export type Station = "Grill" | "Drinks" | "Dessert" | "Salad & Cold";

export type OrderStatus = "new" | "preparing" | "ready" | "served";

export type ViewMode = "order" | "dish";

export type TicketItem = {
  id: string;
  name: string;
  qty: number;
  station: Station;
  note?: string;
};

export type Ticket = {
  id: string;
  tableId: string;
  status: OrderStatus;
  placedAt: number; // epoch ms, used to compute elapsed time
  items: TicketItem[];
};
