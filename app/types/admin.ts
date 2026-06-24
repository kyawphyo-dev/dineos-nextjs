// Admin types (catalog management, staff accounts, reports)

export type AdminViewRole = "owner" | "manager";

export type StaffRole = "owner" | "manager" | "front_staff" | "kitchen" | "cashier";

export type StaffStatus = "active" | "off_shift";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  assignedTo: string;
  status: StaffStatus;
};

export type MenuCategory = {
  id: string;
  name: string;
  itemCount: number;
};

export type AdminMenuItem = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  available: boolean;
};

export type AdminPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export type AdminTable = {
  id: string;
  seats: number;
  zone: string;
};

export type SalesDataPoint = {
  day: string;
  revenue: number;
};

export type ItemSalesRow = {
  name: string;
  qtySold: number;
  revenue: number;
};

export type StaffPerformanceRow = {
  name: string;
  role: StaffRole;
  ordersHandled: number;
  tablesServed: number;
};
