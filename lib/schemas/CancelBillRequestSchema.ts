import z from "zod";

export const CancelBillRequestCustomerSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
});

export const CancelBillRequestStaffSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export type CancelBillRequestCustomerInput = z.infer<
  typeof CancelBillRequestCustomerSchema
>;

export type CancelBillRequestStaffInput = z.infer<
  typeof CancelBillRequestStaffSchema
>;
