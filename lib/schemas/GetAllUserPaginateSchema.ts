import z from "zod";

const GetAllUserPaginateSchema = z.object({
  restaurantId: z.string(),
  branchId: z.string(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).default(10),
  search: z.string().optional(),
  filter: z.string().optional(),
});
export default GetAllUserPaginateSchema;
