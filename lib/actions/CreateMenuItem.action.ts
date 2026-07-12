"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import cloudinary from "../cloudinary";
import CreateMenuItemSchema from "../schemas/CreateMenuItemSchema";
import { errorAction } from "../response";
import { UploadApiResponse } from "cloudinary";
import { MenuItem } from "@/app/types/admin";
import { randomUUID } from "crypto";

type CreateMenuItemProp = {
  name: string;
  price: string;
  categoryId: string;
  description: string;
  image?: File;
};

export async function CreateMenuItem(params: CreateMenuItemProp): Promise<{
  success: boolean;
  message: string;
  data?: {
    menuItem: MenuItem;
  };
  details?: object | null;
}> {
  const validate = CreateMenuItemSchema.safeParse(params);

  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { name, price, categoryId, description, image } = validate.data;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Not authenticated");
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name,
        categoryId,
      },
    });

    if (existingItem) {
      throw new Error("Item already exists");
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create a readable slug from the menu name
      const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Generate a unique image name
      const publicId = `${slug}-${randomUUID()}`;

      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "dineos/menu-items",
                public_id: publicId,
                overwrite: false,
                resource_type: "image",
              },
              (error, result) => {
                if (error) {
                  return reject(error);
                }

                if (!result) {
                  return reject(
                    new Error("Upload failed: No result from Cloudinary"),
                  );
                }

                resolve(result);
              },
            )
            .end(buffer);
        },
      );

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        categoryId,
        imageUrl,
        imageId: imagePublicId || undefined,
      },
    });

    return {
      success: true,
      message: "Menu item created successfully.",
      data: {
        menuItem,
      },
    };
  } catch (err) {
    return errorAction(err);
  }
}
