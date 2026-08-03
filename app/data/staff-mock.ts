import type { StaffPackage, FrontTable } from "@/app/types/staff";

export const STAFF_PACKAGES: StaffPackage[] = [
  {
    id: "buffet-premier",
    name: "Buffet Premier",
    description: "Unlimited dishes · All-day",
    price: 449,
    icon: "soup",
  },
  {
    id: "dine-in-set",
    name: "Dine-in Set Menu",
    description: "3-course · À la carte add-ons",
    price: 299,
    icon: "utensils",
  },
];

export const INITIAL_TABLES: FrontTable[] = [
  { id: "A-01", seats: 4, status: "available", meta: "4 seats" },
  {
    id: "A-02",
    seats: 4,
    status: "occupied",
    meta: "Seated 12m",
    session: {
      id: "session-a-02",
      packageId: "buffet-premier",
      packageName: "Buffet Premier",
      guestCount: 3,
      startedAt: "12 min ago",
    },
  },
  { id: "A-03", seats: 2, status: "available", meta: "2 seats" },
  {
    id: "A-04",
    seats: 6,
    status: "occupied",
    meta: "Seated 38m",
    session: {
      id: "session-a-04",
      packageId: "dine-in-set",
      packageName: "Dine-in Set Menu",
      guestCount: 5,
      startedAt: "38 min ago",
    },
  },
  {
    id: "A-05",
    seats: 4,
    status: "attention",
    meta: "Bill requested",
    session: {
      id: "session-a-05",
      packageId: "buffet-premier",
      packageName: "Buffet Premier",
      guestCount: 4,
      startedAt: "52 min ago",
    },
  },
  { id: "A-06", seats: 6, status: "available", meta: "6 seats" },
  { id: "A-07", seats: 2, status: "available", meta: "2 seats" },
  {
    id: "A-08",
    seats: 2,
    status: "occupied",
    meta: "Seated 5m",
    session: {
      id: "session-a-08",
      packageId: "dine-in-set",
      packageName: "Dine-in Set Menu",
      guestCount: 2,
      startedAt: "5 min ago",
    },
  },
  {
    id: "A-09",
    seats: 4,
    status: "reserved",
    meta: "Reserved 7:00 PM",
    reservation: {
      id: "reservation-a-09",
      customerName: "Khun Anan",
      customerPhone: "0812345678",
      customerEmail: null,
      guestCount: 4,
      reservedTime: new Date().toISOString(),
      status: "pending",
      note: null,
    },
  },
  { id: "A-10", seats: 4, status: "available", meta: "4 seats" },
  { id: "A-11", seats: 2, status: "available", meta: "2 seats" },
  {
    id: "A-12",
    seats: 4,
    status: "occupied",
    meta: "Seated 22m",
    session: {
      id: "session-a-12",
      packageId: "buffet-premier",
      packageName: "Buffet Premier",
      guestCount: 4,
      startedAt: "22 min ago",
    },
  },
];
