import z from "zod";

const GetByBranchIdSchema = z.object({
  branchId: z.string().min(1, "Branch is required."),
});

export default GetByBranchIdSchema;
