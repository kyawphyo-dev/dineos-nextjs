import z from "zod";

const CreateTableSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  capacity: z.number().int().min(1, "Capacity is required"),
  zoneId: z.string().min(1, "Zone ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  qr: z.string().optional().nullable(),
});

export default CreateTableSchema;
