import type { Station, Ticket } from "@/app/types/kitchen";

export const STATIONS: Station[] = ["Grill", "Drinks", "Dessert", "Salad & Cold"];

const now = Date.now();

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "1034",
    tableId: "A-07",
    status: "new",
    placedAt: now - 0.5 * 60 * 1000,
    items: [
      { id: "i1", name: "Massaman Curry", qty: 2, station: "Grill", categoryId: "c1", categoryName: "Main Curries" },
      { id: "i2", name: "Tom Yum Goong", qty: 1, station: "Grill", categoryId: "c2", categoryName: "Soups" },
    ],
  },
  {
    id: "1035",
    tableId: "A-12",
    status: "new",
    placedAt: now - 1 * 60 * 1000,
    items: [
      { id: "i3", name: "Pad Thai", qty: 3, station: "Grill", categoryId: "c3", categoryName: "Noodles", note: "No peanuts — allergy" },
    ],
  },
  {
    id: "1031",
    tableId: "A-02",
    status: "preparing",
    placedAt: now - 6 * 60 * 1000,
    items: [
      { id: "i4", name: "Tom Kha Gai", qty: 2, station: "Grill", categoryId: "c2", categoryName: "Soups" },
      { id: "i5", name: "Som Tum Salad", qty: 1, station: "Salad & Cold", categoryId: "c4", categoryName: "Salads" },
    ],
  },
  {
    id: "1029",
    tableId: "A-04",
    status: "preparing",
    placedAt: now - 9 * 60 * 1000,
    items: [{ id: "i6", name: "Massaman Curry", qty: 4, station: "Grill", categoryId: "c1", categoryName: "Main Curries" }],
  },
  {
    id: "1033",
    tableId: "A-08",
    status: "preparing",
    placedAt: now - 3 * 60 * 1000,
    items: [{ id: "i7", name: "Pad Thai", qty: 2, station: "Grill", categoryId: "c3", categoryName: "Noodles" }],
  },
  {
    id: "1027",
    tableId: "A-05",
    status: "ready",
    placedAt: now - 15 * 60 * 1000,
    items: [{ id: "i8", name: "Mango Sticky Rice", qty: 1, station: "Dessert", categoryId: "c5", categoryName: "Desserts" }],
  },
  {
    id: "1030",
    tableId: "A-02",
    status: "preparing",
    placedAt: now - 4 * 60 * 1000,
    items: [
      { id: "i9", name: "Thai Iced Tea", qty: 2, station: "Drinks", categoryId: "c6", categoryName: "Beverages" },
      { id: "i10", name: "Fresh Coconut", qty: 1, station: "Drinks", categoryId: "c6", categoryName: "Beverages" },
    ],
  },
];
