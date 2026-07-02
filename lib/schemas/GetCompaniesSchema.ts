import z from "zod";

const GetCompaniesSchema = z.object({
  companyId: z.string(),
});

export default GetCompaniesSchema;
