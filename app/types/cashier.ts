// Cashier types (dining sessions, billing, discounts, receipts)

export type SessionStatus = "dining" | "paying" | "finished" | "billed";

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
  sessionId: string;
  tableId: string;
  packageName: string;
  guestCount: number;
  seatedMinutesAgo: number;
  status: SessionStatus;
  orderIds: string[];
  items: LineItem[];
  billId: string | null;
  billReceiptNumber: string | null;
  billStatus: string | null;
  billGrandTotal: number | null;
  billSubtotal: number | null;
  billDiscount: number | null;
};

export type SplitMode = "even" | "byItem";

export type PaymentSplit = {
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
};

export type ReceiptPayment = {
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
};

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
  serviceChargeRate: number;
  serviceCharge: number;
  taxRate: number;
  tax: number;
  grandTotal: number;
  /** @deprecated use grandTotal — kept for backward compat */
  total: number;
  /** @deprecated first payment alias — use payments[] — kept for backward compat */
  method: PaymentMethod;
  payments: ReceiptPayment[];
  paidAt: string; // formatted time, e.g. "2:14 PM"
  paidDate: string; // formatted date for display, e.g. "Jun 22, 2026"
  paidDateISO: string; // raw ISO date, e.g. "2026-06-22" — used for filtering
  cashierName?: string;
};
