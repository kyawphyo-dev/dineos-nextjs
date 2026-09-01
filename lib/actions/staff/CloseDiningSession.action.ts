"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import { authenticatedUser } from "@/app/types/admin";

interface CloseDiningSessionParams {
  sessionId: string;
  tableNumber: string;
  branchId: string;
}

async function CloseDiningSession(params: CloseDiningSessionParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    // const { id: staffId } = session.user as authenticatedUser;

    const table = await prisma.table.findUnique({
      where: {
        branchId_tableNumber: {
          branchId: params.branchId,
          tableNumber: params.tableNumber,
        },
      },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.diningSession.update({
        where: { id: params.sessionId },
        data: {
          status: "finishedEating",
        },
      });

      const updatedTable = await tx.table.update({
        where: { id: table.id },
        data: { status: "cleaning" },
      });

      const updatedReservation = updatedSession.reservationId
        ? await tx.reservation.update({
            where: { id: updatedSession.reservationId },
            data: { status: "completed" },
          })
        : null;

      return { updatedSession, updatedTable, updatedReservation };
    });

    return {
      success: true,
      data: {
        session: JSON.parse(JSON.stringify(result.updatedSession)),
        table: JSON.parse(JSON.stringify(result.updatedTable)),
        reservation: result.updatedReservation
          ? JSON.parse(JSON.stringify(result.updatedReservation))
          : null,
      },
      message: "Session closed successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CloseDiningSession;
