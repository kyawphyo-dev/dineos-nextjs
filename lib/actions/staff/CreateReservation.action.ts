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
    return errorAction("Invalid reservation date and time");
  }

  const now = new Date();
  const WORKING_HOUR_START = 11;
  const WORKING_HOUR_END = 21;
  const MIN_MINUTES_AHEAD = 30;

  if (reservedTimeDate < now) {
    return errorAction("Reservation date and time cannot be in the past");
  }

  const minutesDiff = (reservedTimeDate.getTime() - now.getTime()) / (1000 * 60);
  if (minutesDiff < MIN_MINUTES_AHEAD) {
    return errorAction(
      `Reservation must be at least ${MIN_MINUTES_AHEAD} minutes from now`
    );
  }

  const hour = reservedTimeDate.getHours();
  const minute = reservedTimeDate.getMinutes();
  const totalMinutes = hour * 60 + minute;
  const startMinutes = WORKING_HOUR_START * 60;
  const endMinutes = WORKING_HOUR_END * 60;

  if (totalMinutes < startMinutes || totalMinutes > endMinutes) {
    const formatHour = (h: number) => {
      const suffix = h >= 12 ? "pm" : "am";
      const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${display}${suffix}`;
    };
    return errorAction(
      `Reservation time must be during working hours (${formatHour(WORKING_HOUR_START)} - ${formatHour(WORKING_HOUR_END)})`
    );
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
          status: "confirmed",
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
