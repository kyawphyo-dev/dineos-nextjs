const ROUTES = {
  ADMIN_DASHBOARD: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/dashboard`,
  ADMIN_CATEGORY: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/categories`,
  ADMIN_MENU: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/menu`,
  ADMIN_PACKAGES: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/packages`,
  ADMIN_TABLES: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/tables`,
  ADMIN_STAFF: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/staff`,
  ADMIN_SALES_REPORT: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/reports/sales`,
  ADMIN_STAFF_REPORT: (restaurantId: string, branchId: string) =>
    `http://localhost:3000/admin/${restaurantId}/${branchId}/reports/staff`,

  CASHIER_DASHBOARD: "http://localhost:3000/cashier",
  CASHIER_HISTORY: "http://localhost:3000/cashier/history",

  KITCHEN_DASHBOARD: "http://localhost:3000/kitchen",

  FRONT_STAFF_DASHBOARD: "http://localhost:3000/staff",

  CUSTOMER_LANDING: (id: string) => `http://localhost:3000/table/${id}`,
  CUSTOMER_MENUS: (id: string) => `http://localhost:3000/table/${id}/menu`,
  CUSTOMER_CART: (id: string) => `http://localhost:3000/table/${id}/cart`,
  CUSTOMER_ORDERS: (id: string) => `http://localhost:3000/table/${id}/orders`,
};

export default ROUTES;
