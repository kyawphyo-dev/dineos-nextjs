import z from "zod";

const GetRestaurantSchema = z.string({
  ownerId: z.string(),
});
export default GetRestaurantSchema;
