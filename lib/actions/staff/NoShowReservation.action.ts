"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import UpdateReservationStatusSchema from "@/lib/schemas/UpdateReservationStatusSchema";

interface NoShowReservationParams {
  reservationId: string;
  branchId: string;
}

async function NoShowReservation(params: NoShowReservationParams) {
  const validate = UpdateReservationStatusSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const { reservationId, branchId } = validate.data;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, branchId: true, tableId: true, status: true },
    });

    if (!reservation || reservation.branchId !== branchId) {
      throw new Error("Reservation not found");
    }

    if (reservation.status === "seated" || reservation.status === "completed") {
      throw new Error("Reservation can no longer be marked no-show");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: "noShow" },
      });

      let updatedTable: { id: string; status: string } | null = null;
      if (reservation.tableId) {
        const otherActiveCount = await tx.reservation.count({
          where: {
            tableId: reservation.tableId,
            status: { in: ["pending", "confirmed", "arrived"] },
            id: { not: reservationId },
          },
        });

        if (otherActiveCount === 0) {
          updatedTable = await tx.table.update({
            where: { id: reservation.tableId },
            data: { status: "available" },
            select: { id: true, status: true },
          });
        }
      }

      return { updatedReservation, updatedTable };
    });

    return {
      success: true,
      data: {
        reservation: JSON.parse(JSON.stringify(result.updatedReservation)),
        table: result.updatedTable
          ? JSON.parse(JSON.stringify(result.updatedTable))
          : null,
      },
      message: "Reservation marked as no-show.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default NoShowReservation;
