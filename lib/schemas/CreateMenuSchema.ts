import z from "zod";

const CreateMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  branchId: z.string().min(1, "Branch ID is required"),
});
export default CreateMenuSchema;
