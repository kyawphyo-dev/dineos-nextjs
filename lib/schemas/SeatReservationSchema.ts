import z from "zod";

const SeatReservationSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
  tableNumber: z.string().min(1, "Table number is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  packageId: z.string().optional().nullable(),
  guestCount: z.number().int().min(1, "Guest count is required"),
});

export default SeatReservationSchema;
