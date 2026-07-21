import z from "zod";

const StartDiningSessionSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  packageId: z.string().optional().nullable(),
  guestCount: z.number().int().min(1, "Guest count is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export default StartDiningSessionSchema;
