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
  console.log("GetRestaurant params:", params);
  if (!params.id) {
    throw new Error("ownerId is required");
  }
  try {
    const validate = GetRestaurantSchema.safeParse(params);
    console.log("GetRestaurant validation success:", validate.success);
    if (!validate.success) {
      console.log("GetRestaurant validation error:", validate.error);
      throw new Error(validate.error.message);
    }
    const { id } = validate.data;
    console.log("GetRestaurant querying for ownerId:", id);
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: id },
      include: { branches: true },
    });
    console.log("GetRestaurant found restaurant:", restaurant);
    return {
      success: true,
      data: {
        restaurant: JSON.parse(JSON.stringify(restaurant)),
      },
      message: "Restaurant found",
      details: null,
    };
  } catch (e) {
    console.log("GetRestaurant error:", e);
    return errorAction(e);
  }
}
