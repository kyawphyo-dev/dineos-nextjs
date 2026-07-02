import z from "zod";

const AddRestaurantSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  branchAddress: z.string().min(1, "Branch address is required"),
});
export default AddRestaurantSchema;
