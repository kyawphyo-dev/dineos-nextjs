"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import SeatReservationSchema from "@/lib/schemas/SeatReservationSchema";
import { authenticatedUser } from "@/app/types/admin";

interface SeatReservationParams {
  reservationId: string;
  tableNumber: string;
  branchId: string;
  packageId?: string | null;
  guestCount: number;
}

const ACTIVE_DINING_STATUSES = [
  "seated",
  "ordering",
  "dining",
  "finishedEating",
  "paying",
] as const;

async function SeatReservation(params: SeatReservationParams) {
  const validate = SeatReservationSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { reservationId, tableNumber, branchId, packageId, guestCount } =
    validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const { id: staffId } = session.user as authenticatedUser;

    const table = await prisma.table.findUnique({
      where: {
        branchId_tableNumber: {
          branchId,
          tableNumber,
        },
      },
      select: { id: true, status: true },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, branchId: true, tableId: true, status: true },
    });

    if (!reservation || reservation.branchId !== branchId) {
      throw new Error("Reservation not found");
    }

    if (!["pending", "confirmed", "arrived"].includes(reservation.status)) {
      throw new Error("Reservation cannot be seated");
    }

    if (reservation.tableId && reservation.tableId !== table.id) {
      throw new Error("Reservation belongs to another table");
    }

    if (table.status !== "reserved") {
      throw new Error("Table is not reserved");
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingActiveSession = await tx.diningSession.findFirst({
        where: {
          tableId: table.id,
          status: { in: [...ACTIVE_DINING_STATUSES] },
        },
        orderBy: { startedAt: "desc" },
        select: { id: true, status: true },
      });

      if (existingActiveSession) {
        throw new Error(
          `Table ${tableNumber} already has an active dining session`,
        );
      }

      const updatedTable = await tx.table.update({
        where: { id: table.id },
        data: { status: "occupied" },
      });

      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "arrived",
          seatedAt: new Date(),
          tableId: reservation.tableId ?? table.id,
        },
      });

      const diningSession = await tx.diningSession.create({
        data: {
          tableId: table.id,
          packageId,
          guestCount,
          startedById: staffId,
          status: "seated",
          reservationId,
        },
      });

      return { updatedTable, updatedReservation, diningSession };
    });

    return {
      success: true,
      data: {
        table: JSON.parse(JSON.stringify(result.updatedTable)),
        reservation: JSON.parse(JSON.stringify(result.updatedReservation)),
        diningSession: JSON.parse(JSON.stringify(result.diningSession)),
      },
      message: "Guest seated and session started.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default SeatReservation;
