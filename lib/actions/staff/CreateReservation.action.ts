"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { errorAction } from "@/lib/response";
import CreateReservationSchema from "@/lib/schemas/CreateReservationSchema";
import { authenticatedUser } from "@/app/types/admin";

interface CreateReservationParams {
  tableNumber: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  reservedTime: string;
  note?: string | null;
}

async function CreateReservation(params: CreateReservationParams) {
  const validate = CreateReservationSchema.safeParse(params);
  if (!validate.success) {
    throw new Error(validate.error.issues[0].message);
  }

  const {
    tableNumber,
    branchId,
    customerName,
    customerPhone,
    customerEmail,
    guestCount,
    reservedTime,
    note,
  } = validate.data;

  const reservedTimeDate = new Date(reservedTime);
  if (Number.isNaN(reservedTimeDate.getTime())) {
    return errorAction("Invalid reserved time");
  }

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
    });

    if (!table) {
      throw new Error("Table not found");
    }

    if (table.status !== "available") {
      throw new Error("Table is not available");
    }

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          branchId,
          tableId: table.id,
          customerName,
          customerPhone,
          customerEmail,
          guestCount,
          reservedAt: reservedTimeDate,
          reservedTime: reservedTimeDate,
          note,
          createdById: staffId,
          status: "pending",
        },
      });

      const updatedTable = await tx.table.update({
        where: { id: table.id },
        data: { status: "reserved" },
      });

      return { reservation, updatedTable };
    });

    return {
      success: true,
      data: {
        reservation: JSON.parse(JSON.stringify(result.reservation)),
        table: JSON.parse(JSON.stringify(result.updatedTable)),
      },
      message: "Reservation created successfully.",
    };
  } catch (e) {
    return errorAction(e);
  }
}

export default CreateReservation;
