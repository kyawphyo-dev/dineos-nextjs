const ROUTES = {
  CUSTOMER_LANDING:(id: string) => `http://localhost:3000/table/${id}`,
  CUSTOMER_MENU: (id: string)=> `http://localhost:3000/table/${id}/menus`,
  CUSTOMER_CART: (id: string) => `http://localhost:3000/table/${id}/cart`,
  CUSTOMER_ORDERS: (id: string) => `http://localhost:3000/table/${id}/orders`,

}

export default ROUTES;