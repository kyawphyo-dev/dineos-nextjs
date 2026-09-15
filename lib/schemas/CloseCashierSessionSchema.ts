import z from "zod";

const CloseCashierSessionSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export default CloseCashierSessionSchema;
