import type {
  StaffMember,
  MenuCategory,
  AdminMenuItem,
  AdminPackage,
  AdminTable,
  SalesDataPoint,
  ItemSalesRow,
  StaffPerformanceRow,
} from "@/app/types/admin";

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: "c1", name: "Soups", itemCount: 4 },
  { id: "c2", name: "Mains", itemCount: 8 },
  { id: "c3", name: "Sides", itemCount: 5 },
  { id: "c4", name: "Desserts", itemCount: 3 },
  { id: "c5", name: "Drinks", itemCount: 6 },
];

export const INITIAL_ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: "m1",
    name: "Massaman Curry",
    categoryId: "c2",
    price: 180,
    available: true,
    description: "Rich and creamy Thai curry with potatoes and peanuts",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
  },
  {
    id: "m2",
    name: "Tom Yum Goong",
    categoryId: "c1",
    price: 160,
    available: true,
    description: "Spicy and sour shrimp soup with lemongrass and kaffir lime",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  },
  {
    id: "m3",
    name: "Som Tum Salad",
    categoryId: "c3",
    price: 120,
    available: true,
    description: "Spicy green papaya salad with peanuts and lime",
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
  },
  { 
    id: "m4", 
    name: "Pad Thai", 
    categoryId: "c2", 
    price: 150, 
    available: true,
    description: "Stir-fried rice noodles with shrimp, tofu, and peanuts",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
  },
  {
    id: "m5",
    name: "Tom Kha Gai",
    categoryId: "c1",
    price: 140,
    available: false,
    description: "Creamy coconut soup with chicken and galangal",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  },
  {
    id: "m6",
    name: "Mango Sticky Rice",
    categoryId: "c4",
    price: 90,
    available: true,
    description: "Sweet sticky rice with ripe mango and coconut cream",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
  },
  {
    id: "m7",
    name: "Thai Iced Tea",
    categoryId: "c5",
    price: 60,
    available: true,
    description: "Sweet and creamy Thai tea with condensed milk",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
  },
];

export const INITIAL_ADMIN_PACKAGES: AdminPackage[] = [
  {
    id: "p1",
    name: "Buffet Premier",
    description: "Unlimited dishes · All-day",
    price: 449,
  },
  {
    id: "p2",
    name: "Dine-in Set Menu",
    description: "3-course · À la carte add-ons",
    price: 299,
  },
];

export const INITIAL_ADMIN_TABLES: AdminTable[] = [
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
