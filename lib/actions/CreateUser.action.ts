"use server";

import { getServerSession } from "next-auth";
import { StaffRole } from "../auth";
import CreateUserSchema from "../schemas/CreateUserSchema";
import { authOptions } from "../auth-options";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { errorAction } from "../response";

interface CreateStaffParams {
  name: string;
  email: string;
  username: string;
  password: string;
  pin: string;
  role: StaffRole;
  restaurantId: string;
  branchId: string;
  zoneId: string;
}

export default async function CreateStaff(params: CreateStaffParams) {
  try {
    // Validate all required fields
    const validate = CreateUserSchema.safeParse(params);
    if (!validate.success) {
      return {
        success: false,
        message: validate.error?.issues.map((e) => e.message).join(", "),
      };
    }

    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    // Hash password and PIN
    const hashedPassword = await bcrypt.hash(params.password, 10);
    const hashedPin = await bcrypt.hash(params.pin, 10);

    // Create staff in database
    const staff = await prisma.staff.create({
      data: {
        name: params.name,
        email: params.email,
        username: params.username,
        hashedPassword,
        hashedPin,
        role: params.role,
        restaurantId: params.restaurantId,
        branchId: params.branchId,
        zoneId: params.zoneId,
      },
    });

    return {
      success: true,
      data: { staff },
      message: "Staff created successfully",
    };
  } catch (error) {
    return errorAction(error);
  }
}
