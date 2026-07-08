import z from "zod";

const UpdateStaffZoneSchema = z.object({
  id: z.string(),
  zoneId: z.string().min(1, "Zone is required."),
});
export default UpdateStaffZoneSchema;
