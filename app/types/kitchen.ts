// Kitchen display types (tickets, stations, board view)

export type Station = "Grill" | "Drinks" | "Dessert" | "Salad & Cold";

export type TicketStatus = "new" | "preparing" | "ready" | "served";

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
  status: TicketStatus;
  placedAt: number; // epoch ms, used to compute elapsed time
  items: TicketItem[];
};
