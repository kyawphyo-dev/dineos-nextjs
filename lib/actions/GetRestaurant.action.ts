import { Restaurant } from "@/app/types/restaurant";
import { prisma } from "../prisma";
import { errorAction } from "../response";
import GetRestaurantSchema from "../schemas/GetRestaurantSchema";

export default async function GetRestaurant(params: { id: string }): Promise<{
  success: boolean;
  data?: {
    restaurant: Restaurant | null;
  };
  message?: string;
  details?: object | null;
}> {
  if (!params.id) {
    throw new Error("ownerId is required");
  }
  try {
    const validate = GetRestaurantSchema.safeParse(params);
    if (!validate.success) {
      throw new Error(validate.error.message);
    }
    const id = validate.data;
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: id },
      include: { branches: true },
    });
    return {
      success: true,
      data: {
        restaurant: JSON.parse(JSON.stringify(restaurant)),
      },
      message: "Restaurant found",
      details: null,
    };
  } catch (e) {
    return errorAction(e);
  }
}
