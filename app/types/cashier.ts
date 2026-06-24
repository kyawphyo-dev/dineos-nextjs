// Cashier types (dining sessions, billing, discounts, receipts)

export type SessionStatus = "dining" | "finished" | "billed";

export type PaymentMethod = "cash" | "card" | "qr";

export type DiscountType = "percent" | "fixed";

export type Discount = {
  type: DiscountType;
  value: number; // percent (0-100) or fixed amount in baht
};

export type LineItem = {
  id: string;
  name: string;
  qty: number;
  price: number; // price per unit
  orderId: string;
};

export type DiningSession = {
  tableId: string;
  packageName: string;
  guestCount: number;
  seatedMinutesAgo: number;
  status: SessionStatus;
  orderIds: string[];
  items: LineItem[];
};

export type SplitMode = "even" | "byItem";

export type ReceiptRecord = {
  id: string;
  tableId: string;
  packageName: string;
  guestCount: number;
  orderIds: string[];
  items: LineItem[];
  subtotal: number;
  discount: Discount | null;
  discountAmount: number;
  total: number;
  method: PaymentMethod;
  paidAt: string; // formatted time, e.g. "2:14 PM"
  paidDate: string; // formatted date for display, e.g. "Jun 22, 2026"
  paidDateISO: string; // raw ISO date, e.g. "2026-06-22" — used for filtering
};
