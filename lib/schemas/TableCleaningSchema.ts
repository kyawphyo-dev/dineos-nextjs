import z from "zod";

export const MarkTableCleaningStaffSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export const FinishCleaningStaffSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export type MarkTableCleaningStaffInput = z.infer<
  typeof MarkTableCleaningStaffSchema
>;

export type FinishCleaningStaffInput = z.infer<
  typeof FinishCleaningStaffSchema
>;
