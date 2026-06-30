import z from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  pin: z.string().min(4, "PIN must be at least 4 characters."),
  role: z.enum(["owner", "manager", "front_staff", "kitchen", "cashier"]),
  restaurantId: z.string().min(1, "Restaurant is required."),
  branchId: z.string().min(1, "Branch is required."),
  zoneId: z.string().min(1, "Zone is required."),
});
export default CreateUserSchema;
