import type {
  StaffMember,
  MenuCategory,
  MenuItem,
  Package,
  RestaurantTable,
  SalesDataPoint,
  ItemSalesRow,
  StaffPerformanceRow,
} from "@/app/types";

export const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Khun Anan", role: "owner", assignedTo: "All access", status: "active" },
  { id: "s2", name: "Khun Mali", role: "manager", assignedTo: "All access", status: "active" },
  { id: "s3", name: "Niran S.", role: "front_staff", assignedTo: "Floor 1", status: "active" },
  { id: "s4", name: "Somchai P.", role: "kitchen", assignedTo: "Grill Station", status: "active" },
  { id: "s5", name: "Praew K.", role: "cashier", assignedTo: "Front counter", status: "off_shift" },
  { id: "s6", name: "Ploy T.", role: "kitchen", assignedTo: "Drinks Station", status: "active" },
  { id: "s7", name: "Korn W.", role: "front_staff", assignedTo: "Floor 1", status: "off_shift" },
  { id: "s8", name: "Aom R.", role: "cashier", assignedTo: "Front counter", status: "active" },
];

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: "c1", name: "Soups", itemCount: 4 },
  { id: "c2", name: "Mains", itemCount: 8 },
  { id: "c3", name: "Sides", itemCount: 5 },
  { id: "c4", name: "Desserts", itemCount: 3 },
  { id: "c5", name: "Drinks", itemCount: 6 },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: "m1", name: "Massaman Curry", categoryId: "c2", price: 180, available: true },
  { id: "m2", name: "Tom Yum Goong", categoryId: "c1", price: 160, available: true },
  { id: "m3", name: "Som Tum Salad", categoryId: "c3", price: 120, available: true },
  { id: "m4", name: "Pad Thai", categoryId: "c2", price: 150, available: true },
  { id: "m5", name: "Tom Kha Gai", categoryId: "c1", price: 140, available: false },
  { id: "m6", name: "Mango Sticky Rice", categoryId: "c4", price: 90, available: true },
  { id: "m7", name: "Thai Iced Tea", categoryId: "c5", price: 60, available: true },
];

export const INITIAL_PACKAGES: Package[] = [
  { id: "p1", name: "Buffet Premier", description: "Unlimited dishes · All-day", price: 449 },
  { id: "p2", name: "Dine-in Set Menu", description: "3-course · À la carte add-ons", price: 299 },
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: "A-01", seats: 4, zone: "Floor 1" },
  { id: "A-02", seats: 4, zone: "Floor 1" },
  { id: "A-03", seats: 2, zone: "Floor 1" },
  { id: "A-04", seats: 6, zone: "Floor 1" },
  { id: "A-05", seats: 4, zone: "Floor 1" },
  { id: "A-06", seats: 6, zone: "Floor 2" },
  { id: "A-07", seats: 2, zone: "Floor 2" },
  { id: "A-08", seats: 2, zone: "Floor 2" },
];

export const SALES_TREND: SalesDataPoint[] = [
  { day: "Mon", revenue: 18400 },
  { day: "Tue", revenue: 16200 },
  { day: "Wed", revenue: 21100 },
  { day: "Thu", revenue: 19800 },
  { day: "Fri", revenue: 27300 },
  { day: "Sat", revenue: 34600 },
  { day: "Sun", revenue: 29900 },
];

export const TOP_ITEMS: ItemSalesRow[] = [
  { name: "Buffet Premier", qtySold: 142, revenue: 63758 },
  { name: "Massaman Curry", qtySold: 98, revenue: 17640 },
  { name: "Pad Thai", qtySold: 87, revenue: 13050 },
  { name: "Tom Yum Goong", qtySold: 64, revenue: 10240 },
  { name: "Mango Sticky Rice", qtySold: 55, revenue: 4950 },
];

export const STAFF_PERFORMANCE: StaffPerformanceRow[] = [
  { name: "Niran S.", role: "front_staff", ordersHandled: 0, tablesServed: 34 },
  { name: "Korn W.", role: "front_staff", ordersHandled: 0, tablesServed: 28 },
  { name: "Somchai P.", role: "kitchen", ordersHandled: 156, tablesServed: 0 },
  { name: "Ploy T.", role: "kitchen", ordersHandled: 98, tablesServed: 0 },
  { name: "Praew K.", role: "cashier", ordersHandled: 0, tablesServed: 61 },
  { name: "Aom R.", role: "cashier", ordersHandled: 0, tablesServed: 49 },
];
