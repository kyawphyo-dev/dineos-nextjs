import z from "zod";

const UpdateKitchenOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["pending", "preparing", "served", "completed"]),
});

export default UpdateKitchenOrderStatusSchema;
