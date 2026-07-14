import z from "zod";

const AddPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().min(1, "Package description is required"),
  price: z.number().min(0, "Package price must be greater than 0"),
  branchId: z.string().min(1, "Branch ID is required"),
  menuItemIds: z.array(z.string()).optional(),
});
export default AddPackageSchema;
