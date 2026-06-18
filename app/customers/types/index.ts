export type Package = {
    id: string;
    name: string;
    description: string;
    price: number;
    emoji: string;
  };
  
  export type DietaryTag = 'Halal' | 'Vegan' | 'Vegetarian' | 'Gluten-free';
  export type SpiceLevel = 'Mild' | 'Medium spicy' | 'Hot';
  
  export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    emoji: string;
    category: string;
    dietary: DietaryTag[];
    spice?: SpiceLevel;
  };
  
  export type CartItem = MenuItem & { qty: number };
  
  export type OrderStatus = 'received' | 'preparing' | 'ready';
  
  export type OrderItem = {
    name: string;
    qty: number;
    price: number;
  };
  
  export type Order = {
    id: string;
    status: OrderStatus;
    placedAt: string;
    estimatedMin: number;
    items: OrderItem[];
  };
  
  export type Screen = 'landing' | 'menu' | 'orders';
  