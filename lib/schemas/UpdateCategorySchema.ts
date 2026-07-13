import z from "zod";

const UpdateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Category name is required"),
  menuId: z.string().min(1, "Menu ID is required"),
  description: z.string().optional(),
});
export default UpdateCategorySchema;
