import z from "zod";

const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  menuId: z.string().min(1, "Menu ID is required"),
  description: z.string().optional(),
});
export default CreateCategorySchema;
