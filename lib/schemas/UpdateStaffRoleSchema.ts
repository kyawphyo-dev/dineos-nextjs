import z from "zod";

const UpdateStaffRoleSchema = z.object({
  id: z.string(),
  role: z.string(),
});
export default UpdateStaffRoleSchema;
