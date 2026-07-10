// Admin types (catalog management, staff accounts, reports)

export type AdminViewRole = "owner" | "manager";

export type StaffRole =
  | "owner"
  | "manager"
  | "front_staff"
  | "kitchen"
  | "cashier";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: StaffRole;
  restaurantId: string;
  branchId: string;
  zoneId: string;
  status: boolean;
  hashedPassword?: string;
  hashedPin?: string;
  zone?: Zone;
};

export type Zone = {
  id: string;
  name: string;
  branchId: string | null;
  tables?: AdminTable[];
  staff?: StaffMember[];
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
  branchId?: string | null;
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

export type authenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string;
  role?: StaffRole;
  companyId?: string | null;
  restaurantId?: string | null;
  branchId?: string | null;
};

export interface AdminInterface {
  restaurantId: string;
  branchId: string;
}

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  status: "available" | "soldOut";
  imageUrl?: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export type Menu = {
  id: string;
  name: string;
  branchId: string;
  categories?: Category[];
  items?: AdminMenuItem[];
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  menuId: string;
  items?: MenuItem[];
};
