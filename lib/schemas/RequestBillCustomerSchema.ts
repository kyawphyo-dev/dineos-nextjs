import z from "zod";

const RequestBillCustomerSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
});

export default RequestBillCustomerSchema;

export type RequestBillCustomerInput = z.infer<
  typeof RequestBillCustomerSchema
>;
