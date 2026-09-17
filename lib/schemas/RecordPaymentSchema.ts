import z from "zod";

const PaymentSplitInput = z.object({
  method: z.enum(["cash", "card", "qr"]),
  amount: z.number().min(1, "Each payment split must be at least 1"),
  receivedAmount: z.number().optional(),
  referenceNo: z.string().optional(),
});

const DiscountSchema = z
  .object({
    type: z.enum(["percent", "fixed"]),
    value: z.number().min(0, "Discount value must be non-negative"),
  })
  .nullable()
  .optional();

const RecordPaymentSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  payments: z
    .array(PaymentSplitInput)
    .min(1, "At least one payment is required"),
  discount: DiscountSchema,
});

export default RecordPaymentSchema;
