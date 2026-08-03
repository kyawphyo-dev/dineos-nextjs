import z from "zod";

const UpdateReservationStatusSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});

export default UpdateReservationStatusSchema;
