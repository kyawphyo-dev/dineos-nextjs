import z from "zod";

const UpdateTableStatusSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
  status: z.enum(["need_attention", "request_bill", "occupied"]),
});

export default UpdateTableStatusSchema;
