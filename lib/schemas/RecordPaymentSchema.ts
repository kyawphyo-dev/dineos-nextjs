import z from "zod";

const PaymentSplitInput = z.object({
  method: z.enum(["cash", "card", "qr"]),
  amount: z.number().min(1, "Each payment split must be at least 1"),
  referenceNo: z.string().optional(),
});

const RecordPaymentSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  payments: z
    .array(PaymentSplitInput)
    .min(1, "At least one payment is required"),
});

export default RecordPaymentSchema;
