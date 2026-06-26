const ROUTES = {
  ADMIN_DASHBOARD: "http://localhost:3000/admin",
  ADMIN_CATEGORY: "http://localhost:3000/admin/category",
  ADMIN_MENU: "http://localhost:3000/admin/menu",
  ADMIN_PACKAGES: "http://localhost:3000/admin/packages",
  ADMIN_TABLES: "http://localhost:3000/admin/tables",
  ADMIN_STAFF: "http://localhost:3000/admin/staff",
  ADMIN_SALES_REPORT: "http://localhost:3000/admin/reports/sales",
  ADMIN_STAFF_REPORT: "http://localhost:3000/admin/reports/staff",

  CASHIER_DASHBOARD: "http://localhost:3000/cashier",
  CASHIER_HISTORY: "http://localhost:3000/cashier/history",

  KITCHEN_DASHBOARD: "http://localhost:3000/kitchen",

  FRONT_STAFF_DASHBOARD: "http://localhost:3000/staff",

  CUSTOMER_LANDING: (id: string) => `http://localhost:3000/table/${id}`,
  CUSTOMER_MENUS: "http://localhost:3000/menu",
  CUSTOMER_CART: "http://localhost:3000/cart",
  CUSTOMER_ORDERS: "http://localhost:3000/orders",
};

export default ROUTES;
