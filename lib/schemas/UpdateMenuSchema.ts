import z from "zod";

const UpdateMenuSchema = z.object({
  id: z.string().min(1, "Menu ID is required"),
  name: z.string().min(1, "Menu name is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});
export default UpdateMenuSchema;
