import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const UpdatePackageSchema = z.object({
  id: z.string().min(1, "Package ID is required"),
  name: z.string().min(1, "Package name is required"),
  description: z.string().min(1, "Package description is required"),
  price: z.string().min(1, "Price is required"),
  menuItemIds: z.array(z.string()).optional(),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Image must be less than 5 MB.",
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPG, JPEG, PNG, and WEBP images are allowed.",
    ),
});
export default UpdatePackageSchema;
