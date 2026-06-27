// Customer-facing ordering types (menu browse, cart, order tracking)

export type CustomerPackage = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
};

export type DietaryTag = "Halal" | "Vegan" | "Vegetarian" | "Gluten-free";
export type SpiceLevel = "Mild" | "Medium spicy" | "Hot";

export type CustomerMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: string;
  dietary: DietaryTag[];
  spice?: SpiceLevel;
};

export type CartItem = CustomerMenuItem & { qty: number };

export type CustomerOrderStatus = "received" | "preparing" | "ready";

export type CustomerOrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type CustomerOrder = {
  id: string;
  tableId: string;
  status: CustomerOrderStatus;
  placedAt: string;
  estimatedMin: number;
  items: CustomerOrderItem[];
};
