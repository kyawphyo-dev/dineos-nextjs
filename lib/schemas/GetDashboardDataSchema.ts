import z from "zod";

const GetDashboardDataSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant is required."),
  branchId: z.string().min(1, "Branch is required."),
});
export default GetDashboardDataSchema;
