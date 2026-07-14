"use server";

import UpdatePackageSchema from "../schemas/UpdatePackageSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { errorAction } from "../response";
import { prisma } from "../prisma";
import cloudinary from "../cloudinary";
import { UploadApiResponse } from "cloudinary";
import { randomUUID } from "crypto";

interface UpdatePackageParams {
  id: string;
  name: string;
  description: string;
  price: string;
  menuItemIds?: string[];
  image?: File;
}

async function UpdatePackage(params: UpdatePackageParams) {
  const validate = UpdatePackageSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }
  const { id, name, description, price, menuItemIds } = validate.data;
  const { image } = params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return errorAction(new Error("Not authenticated"));
  }
  try {
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });
    if (!existingPackage) {
      throw new Error("Package not found");
    }

    const duplicatePackage = await prisma.package.findFirst({
      where: {
        name,
        branchId: existingPackage.branchId,
        NOT: { id },
      },
    });
    if (duplicatePackage) {
      throw new Error("Package name already exists");
    }

    let imageUrl: string | null | undefined = existingPackage.imageUrl;
    let imageId: string | null | undefined = existingPackage.imageId;

    if (image) {
      // Delete old image if it exists
      if (existingPackage.imageId) {
        await cloudinary.uploader.destroy(existingPackage.imageId);
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
                folder: "dineos/packages",
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
      imageId = uploadResult.public_id;
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        imageId,
      },
    });

    // Update menu items
    if (menuItemIds) {
      // Delete old items first
      await prisma.packageMenuItem.deleteMany({
        where: { packageId: id },
      });

      // Add new items
      await prisma.packageMenuItem.createMany({
        data: menuItemIds.map((menuItemId) => ({
          packageId: id,
          menuItemId,
        })),
        skipDuplicates: true,
      });
    }

    return {
      success: true,
      message: "Package updated successfully.",
      data: {
        package: JSON.parse(JSON.stringify(updatedPackage)),
      },
    };
  } catch (e) {
    return errorAction(e);
  }
}
export default UpdatePackage;
