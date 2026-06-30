import z from "zod";

const PaginateSearchParams = z.object({
  page: z.coerce.number().int().positive().default(1),

  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  filter: z.string().optional(),
});

export default PaginateSearchParams;
