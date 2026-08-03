"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import type { CreateReservationInput } from "@/app/types/staff";

interface Props {
  tableId: string;
  onReserve: (reservation: CreateReservationInput) => void;
}

export default function ReservePanel({ tableId, onReserve }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [reservedDate, setReservedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [reservedTime, setReservedTime] = useState("");
  const [note, setNote] = useState("");

  const canSubmit =
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    reservedDate.trim().length > 0 &&
    reservedTime.trim().length > 0 &&
    Number.isFinite(guestCount) &&
    guestCount > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dateTime = new Date(`${reservedDate}T${reservedTime}`);
    onReserve({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim().length > 0 ? customerEmail.trim() : null,
      guestCount,
      reservedTime: dateTime.toISOString(),
      note: note.trim().length > 0 ? note.trim() : null,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <p className="text-[14px] font-medium text-text-primary mb-4">
        Reserve table {tableId}
      </p>

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Customer name
      </label>
      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="e.g. Khun Anan"
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none focus:border-clay mb-4"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Phone number
      </label>
      <input
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        placeholder="e.g. 0812345678"
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none focus:border-clay mb-4"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Email (optional)
      </label>
      <input
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        placeholder="e.g. guest@email.com"
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none focus:border-clay mb-4"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Guest count
      </label>
      <input
        type="number"
        min={1}
        value={guestCount}
        onChange={(e) => setGuestCount(Number(e.target.value))}
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-clay mb-4"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Reservation date
      </label>
      <input
        type="date"
        value={reservedDate}
        onChange={(e) => setReservedDate(e.target.value)}
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-clay mb-4"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Reservation time
      </label>
      <input
        type="time"
        value={reservedTime}
        onChange={(e) => setReservedTime(e.target.value)}
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary outline-none focus:border-clay mb-5"
      />

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Note (optional)
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Allergies, special requests..."
        rows={2}
        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none focus:border-clay mb-5 resize-none"
      />

      <motion.button
        whileTap={canSubmit ? { scale: 0.98 } : undefined}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full rounded-xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 transition-colors ${
          canSubmit
            ? "bg-clay text-white active:bg-clay-dark"
            : "bg-cream-dark text-text-hint cursor-not-allowed"
        }`}
      >
        <CalendarClock className="w-4 h-4" />
        Confirm reservation
      </motion.button>
    </div>
  );
}
