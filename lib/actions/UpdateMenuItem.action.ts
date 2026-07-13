"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import cloudinary from "../cloudinary";
import UpdateMenuItemSchema from "../schemas/UpdateMenuItemSchema";
import { errorAction } from "../response";
import { UploadApiResponse } from "cloudinary";
import { MenuItem } from "@/app/types/admin";
import { randomUUID } from "crypto";

type UpdateMenuItemProp = {
  id: string;
  name: string;
  price: string;
  categoryId: string;
  description: string;
  image?: File;
};

export async function UpdateMenuItem(params: UpdateMenuItemProp): Promise<{
  success: boolean;
  message: string;
  data?: {
    menuItem: MenuItem;
  };
  details?: object | null;
}> {
  const validate = UpdateMenuItemSchema.safeParse(params);

  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { id, name, price, categoryId, description, image } = validate.data;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Not authenticated");
    }

    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new Error("Menu item not found");
    }

    const duplicateItem = await prisma.menuItem.findFirst({
      where: {
        name,
        categoryId,
        NOT: { id },
      },
    });

    if (duplicateItem) {
      throw new Error("Item with this name already exists in the category");
    }

    let imageUrl: string | undefined = existingItem.imageUrl;
    let imagePublicId: string | undefined = existingItem.imageId;

    if (image) {
      // Delete old image if exists
      if (existingItem.imageId) {
        await cloudinary.uploader.destroy(existingItem.imageId);
      }

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

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

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        categoryId,
        imageUrl,
        imageId: imagePublicId,
      },
    });

    return {
      success: true,
      message: "Menu item updated successfully.",
      data: {
        menuItem,
      },
    };
  } catch (err) {
    return errorAction(err);
  }
}
