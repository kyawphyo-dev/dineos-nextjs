import z from "zod";

const CreateReservationSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().optional().nullable(),
  guestCount: z.number().int().min(1, "Guest count is required"),
  reservedTime: z.string().min(1, "Reserved time is required"),
  note: z.string().optional().nullable(),
});

export default CreateReservationSchema;
