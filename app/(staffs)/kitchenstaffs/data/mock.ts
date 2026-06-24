import type { Station, Ticket } from "@/app/types";

export const STATIONS: Station[] = ["Grill", "Drinks", "Dessert", "Salad & Cold"];

const now = Date.now();

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "1034",
    tableId: "A-07",
    status: "new",
    placedAt: now - 0.5 * 60 * 1000,
    items: [
      { id: "i1", name: "Massaman Curry", qty: 2, station: "Grill" },
      { id: "i2", name: "Tom Yum Goong", qty: 1, station: "Grill" },
    ],
  },
  {
    id: "1035",
    tableId: "A-12",
    status: "new",
    placedAt: now - 1 * 60 * 1000,
    items: [
      { id: "i3", name: "Pad Thai", qty: 3, station: "Grill", note: "No peanuts — allergy" },
    ],
  },
  {
    id: "1031",
    tableId: "A-02",
    status: "preparing",
    placedAt: now - 6 * 60 * 1000,
    items: [
      { id: "i4", name: "Tom Kha Gai", qty: 2, station: "Grill" },
      { id: "i5", name: "Som Tum Salad", qty: 1, station: "Salad & Cold" },
    ],
  },
  {
    id: "1029",
    tableId: "A-04",
    status: "preparing",
    placedAt: now - 9 * 60 * 1000,
    items: [{ id: "i6", name: "Massaman Curry", qty: 4, station: "Grill" }],
  },
  {
    id: "1033",
    tableId: "A-08",
    status: "preparing",
    placedAt: now - 3 * 60 * 1000,
    items: [{ id: "i7", name: "Pad Thai", qty: 2, station: "Grill" }],
  },
  {
    id: "1027",
    tableId: "A-05",
    status: "ready",
    placedAt: now - 15 * 60 * 1000,
    items: [{ id: "i8", name: "Mango Sticky Rice", qty: 1, station: "Dessert" }],
  },
  {
    id: "1030",
    tableId: "A-02",
    status: "preparing",
    placedAt: now - 4 * 60 * 1000,
    items: [
      { id: "i9", name: "Thai Iced Tea", qty: 2, station: "Drinks" },
      { id: "i10", name: "Fresh Coconut", qty: 1, station: "Drinks" },
    ],
  },
];
