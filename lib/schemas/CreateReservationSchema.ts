import z from "zod";

const CreateReservationSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Customer name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(1, "Customer phone is required")
    .regex(/^[0-9+\-\s()]{7,}$/, "Please enter a valid phone number"),
  customerEmail: z
    .union([
      z.string().email("Please enter a valid email address"),
      z.literal(""),
      z.null(),
    ])
    .optional()
    .transform((val) => (val === "" ? null : val)),
  guestCount: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(100, "Guest count cannot exceed 100"),
  reservedTime: z
    .string()
    .min(1, "Reserved time is required")
    .refine((val) => !Number.isNaN(new Date(val).getTime()), {
      message: "Invalid reservation date and time",
    }),
  note: z.string().optional().nullable(),
});

export default CreateReservationSchema;
