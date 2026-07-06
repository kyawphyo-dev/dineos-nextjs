import z from "zod";

const GetRestaurantSchema = z.object({
  id: z.string(),
});
export default GetRestaurantSchema;
