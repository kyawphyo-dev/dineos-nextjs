export type TableStatus = "available" | "occupied" | "attention" | "reserved";

export type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
};

export type TableSession = {
  packageId: string;
  packageName: string;
  guestCount: number;
  startedAt: string;
};

export type Reservation = {
  name: string;
  time: string;
};

export type RestaurantTable = {
  id: string;
  seats: number;
  status: TableStatus;
  meta: string;
  session?: TableSession;
  reservation?: Reservation;
};
