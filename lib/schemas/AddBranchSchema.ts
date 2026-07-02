import z from "zod";

const AddBranchSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
  branchAddress: z.string().min(1, "Branch address is required"),
});
export default AddBranchSchema;
