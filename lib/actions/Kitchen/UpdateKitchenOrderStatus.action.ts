"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import UpdateKitchenOrderStatusSchema from "@/lib/schemas/UpdateKitchenOrderStatusSchema";
import { mapTicketStatusToOrderStatus } from "@/lib/kitchen-mapping";
import type { authenticatedUser } from "@/app/types/admin";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["preparing"],
  preparing: ["served"],
  served: ["completed"],
  completed: [],
  cancelled: [],
};

interface UpdateKitchenOrderStatusParams {
  orderId: string;
  status: "pending" | "preparing" | "served" | "completed";
}

async function UpdateKitchenOrderStatus(
  params: UpdateKitchenOrderStatusParams,
) {
  const validate = UpdateKitchenOrderStatusSchema.safeParse({
    orderId: params.orderId,
    status: params.status,
  });
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { orderId, status } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const { branchId: userBranchId } = session.user as authenticatedUser;
    if (!userBranchId) {
      throw new Error("Branch ID not found");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, branchId: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.branchId !== userBranchId) {
      throw new Error("Order does not belong to this branch");
    }

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      select: { id: true, status: true },
    });

    return {
      success: true as const,
      data: {
        order: JSON.parse(JSON.stringify(updatedOrder)),
      },
      message: `Order status updated to ${status}.`,
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default UpdateKitchenOrderStatus;
export { mapTicketStatusToOrderStatus };
