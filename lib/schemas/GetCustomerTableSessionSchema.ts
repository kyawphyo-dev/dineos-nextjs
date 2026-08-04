import { z } from "zod";

const GetCustomerTableSessionSchema = z.object({
  tableIdentifier: z.string().min(1, "Table id is required"),
});

export default GetCustomerTableSessionSchema;
