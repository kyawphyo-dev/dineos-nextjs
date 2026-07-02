"use server";
import { FormState } from "@/components/admin/AddRestaurantModel";
import { errorAction } from "../response";
import AddRestaurantSchema from "../schemas/AddRestaurantSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import { Branch, Restaurant } from "@/app/types/restaurant";

export default async function CreateRestaurant(params: FormState): Promise<{
  success: boolean;
  data?: {
    restaurant: Restaurant;
    branch: Branch;
  };
  message?: string;
  details?: object | null;
}> {
  try {
    const validated = AddRestaurantSchema.safeParse(params);
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }
    const { restaurantName, branchName, branchAddress } = validated.data;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        name: restaurantName,
        companyId: session.user.companyId || "",
      },
    });
    if (existingRestaurant) {
      throw new Error("Restaurant name already exists");
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        companyId: session.user.companyId || "",
        ownerId: session.user.id,
      },
    });

    const branch = await prisma.branch.create({
      data: {
        name: branchName,
        location: branchAddress,
        restaurantId: restaurant.id,
        ownerId: session.user.id,
      },
    });

    return {
      success: true,
      data: {
        restaurant: JSON.parse(JSON.stringify(restaurant)),
        branch: JSON.parse(JSON.stringify(branch)),
      },
      message: "Restaurant created successfully",
    };
  } catch (error) {
    return errorAction(error);
  }
}
