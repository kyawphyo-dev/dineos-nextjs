import type { Package, MenuItem, Order } from "../types/index";

export const PACKAGES: Package[] = [
  {
    id: "buffet-premier",
    name: "Buffet Premier",
    description: "Unlimited dishes · All-day",
    price: 449,
    emoji: "🍜",
  },
  {
    id: "dine-in-set",
    name: "Dine-in Set Menu",
    description: "3-course · À la carte add-ons",
    price: 299,
    emoji: "🍱",
  },
];

export const CATEGORIES = ["All", "Soups", "Mains", "Sides", "Desserts"];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Massaman Curry",
    description: "Slow-braised beef, potato, peanuts",
    price: 180,
    emoji: "🍛",
    category: "Mains",
    dietary: ["Halal"],
    spice: "Medium spicy",
  },
  {
    id: "2",
    name: "Tom Yum Goong",
    description: "Lemongrass broth, prawns, mushrooms",
    price: 160,
    emoji: "🦐",
    category: "Soups",
    dietary: [],
    spice: "Hot",
  },
  {
    id: "3",
    name: "Som Tum Salad",
    description: "Green papaya, lime, dried shrimp",
    price: 120,
    emoji: "🥗",
    category: "Sides",
    dietary: ["Vegan"],
    spice: "Mild",
  },
  {
    id: "4",
    name: "Pad Thai",
    description: "Rice noodles, egg, bean sprouts, peanuts",
    price: 150,
    emoji: "🍝",
    category: "Mains",
    dietary: ["Halal"],
    spice: "Mild",
  },
  {
    id: "5",
    name: "Tom Kha Gai",
    description: "Coconut milk soup, galangal, chicken",
    price: 140,
    emoji: "🍲",
    category: "Soups",
    dietary: ["Halal"],
    spice: "Medium spicy",
  },
  {
    id: "6",
    name: "Mango Sticky Rice",
    description: "Sweet sticky rice, fresh mango, coconut cream",
    price: 90,
    emoji: "🥭",
    category: "Desserts",
    dietary: ["Vegan", "Gluten-free"],
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "1032",
    status: "preparing",
    placedAt: "9:44 AM",
    estimatedMin: 8,
    items: [
      { name: "Massaman Curry", qty: 2, price: 180 },
      { name: "Tom Yum Goong", qty: 1, price: 160 },
    ],
  },
];
