import z from "zod";

const DiscountSchema = z
  .object({
    type: z.enum(["percent", "fixed"]),
    value: z.number().min(0, "Discount value must be non-negative"),
  })
  .nullable()
  .optional();

const CreateBillSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  subtotal: z.number().min(0, "Subtotal must be non-negative"),
  discount: z.number().min(0, "Discount must be non-negative").default(0),
  discountInfo: DiscountSchema,
});

export default CreateBillSchema;
