import z from "zod";

const CreateBillSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  subtotal: z.number().min(0, "Subtotal must be non-negative"),
  discount: z.number().min(0, "Discount must be non-negative").default(0),
});

export default CreateBillSchema;
