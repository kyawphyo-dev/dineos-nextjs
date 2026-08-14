import { z } from "zod";

const PlaceOrderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item id is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  note: z.string().optional(),
});

const PlaceOrderSchema = z.object({
  tableId: z.string().min(1, "Table id is required"),
  items: z
    .array(PlaceOrderItemSchema)
    .min(1, "At least one item is required to place an order"),
});

export type PlaceOrderItemInput = z.infer<typeof PlaceOrderItemSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

export default PlaceOrderSchema;
