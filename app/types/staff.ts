// Front-staff types (table grid, sessions, reservations)

export type TableStatus = "available" | "occupied" | "attention" | "reserved";

export type StaffPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string | null;
  imageUrl?: string | null;
  imageId?: string | null;
};

export type TableSession = {
  id: string;
  packageId?: string;
  packageName?: string;
  guestCount: number;
  startedAt: string;
  startedBy?: string;
};

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "seated"
  | "completed"
  | "cancelled"
  | "noShow";

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  reservedTime: string;
  status: ReservationStatus;
  note?: string | null;
};

export type CreateReservationInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  reservedTime: string;
  note?: string | null;
};

export type FrontTable = {
  id: string;
  seats: number;
  status: TableStatus;
  meta: string;
  session?: TableSession;
  reservation?: Reservation;
};
