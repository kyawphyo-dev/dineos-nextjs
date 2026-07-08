import z from "zod";

const CreateZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required."),
  branchId: z.string().min(1, "Branch ID is required."),
});
export default CreateZoneSchema;
