"use client";

import { useState, useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import type { CreateReservationInput } from "@/app/types/staff";

interface Props {
  tableId: string;
  onReserve: (reservation: CreateReservationInput) => void;
}

interface ValidationErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  guestCount?: string;
  reservedDate?: string;
  reservedTime?: string;
}

const WORKING_HOUR_START = 11;
const WORKING_HOUR_END = 21;
const MIN_MINUTES_AHEAD = 30;

function formatDateForInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMinTimeForDate(selectedDate: string): string {
  const today = formatDateForInput(new Date());
  if (selectedDate !== today) {
    return `${String(WORKING_HOUR_START).padStart(2, "0")}:00`;
  }

  const now = new Date();
  const minTime = new Date(now.getTime() + MIN_MINUTES_AHEAD * 60 * 1000);

  const startMinutes = WORKING_HOUR_START * 60;
  const minMinutes = minTime.getHours() * 60 + minTime.getMinutes();
  const effectiveStart = Math.max(startMinutes, minMinutes);

  const h = Math.floor(effectiveStart / 60);
  const m = effectiveStart % 60;

  if (h >= WORKING_HOUR_END) {
    return `${String(WORKING_HOUR_END).padStart(2, "0")}:00`;
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function ReservePanel({ tableId, onReserve }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [reservedDate, setReservedDate] = useState(() => formatDateForInput(new Date()));
  const [reservedTime, setReservedTime] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const minDate = useMemo(() => formatDateForInput(new Date()), []);
  const minTime = useMemo(() => getMinTimeForDate(reservedDate), [reservedDate]);
  const maxTime = `${String(WORKING_HOUR_END).padStart(2, "0")}:00`;

  const errors = useMemo<ValidationErrors>(() => {
    const result: ValidationErrors = {};

    if (!customerName.trim()) {
      result.customerName = "Customer name is required";
    } else if (customerName.trim().length < 2) {
      result.customerName = "Customer name must be at least 2 characters";
    }

    if (!customerPhone.trim()) {
      result.customerPhone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{7,}$/.test(customerPhone.trim())) {
      result.customerPhone = "Please enter a valid phone number";
    }

    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        result.customerEmail = "Please enter a valid email address";
      }
    }

    if (!Number.isFinite(guestCount) || guestCount < 1) {
      result.guestCount = "Guest count must be at least 1";
    } else if (!Number.isInteger(guestCount)) {
      result.guestCount = "Guest count must be a whole number";
    } else if (guestCount > 100) {
      result.guestCount = "Guest count cannot exceed 100";
    }

    if (!reservedDate) {
      result.reservedDate = "Reservation date is required";
    } else {
      const selectedDateOnly = new Date(reservedDate);
      const todayOnly = new Date(formatDateForInput(new Date()));
      if (selectedDateOnly < todayOnly) {
        result.reservedDate = "Reservation date cannot be in the past";
      }
    }

    if (!reservedTime) {
      result.reservedTime = "Reservation time is required";
    } else if (reservedDate) {
      const [hStr, mStr] = reservedTime.split(":");
      const hour = parseInt(hStr, 10);
      const minute = parseInt(mStr, 10);
      const totalMinutes = hour * 60 + minute;
      const startMinutes = WORKING_HOUR_START * 60;
      const endMinutes = WORKING_HOUR_END * 60;

      if (totalMinutes < startMinutes || totalMinutes > endMinutes) {
        result.reservedTime = `Time must be between ${WORKING_HOUR_START}:00 and ${String(WORKING_HOUR_END).padStart(2, "0")}:00`;
      } else {
        const combined = new Date(`${reservedDate}T${reservedTime}`);
        const now = new Date();
        const diffMinutes = (combined.getTime() - now.getTime()) / (1000 * 60);
        if (diffMinutes < 0) {
          result.reservedTime = "Reservation time cannot be in the past";
        } else if (diffMinutes < MIN_MINUTES_AHEAD) {
          result.reservedTime = `Reservation must be at least ${MIN_MINUTES_AHEAD} minutes from now`;
        }
      }
    }

    return result;
  }, [customerName, customerPhone, customerEmail, guestCount, reservedDate, reservedTime]);

  const canSubmit = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleDateChange = (value: string) => {
    setReservedDate(value);
    if (reservedTime) {
      const minT = getMinTimeForDate(value);
      const [minH, minM] = minT.split(":").map(Number);
      const [selH, selM] = reservedTime.split(":").map(Number);
      if (selH * 60 + selM < minH * 60 + minM) {
        setReservedTime(minT);
      }
      const [maxH, maxM] = maxTime.split(":").map(Number);
      if (selH * 60 + selM > maxH * 60 + maxM) {
        setReservedTime(maxTime);
      }
    }
    setTouched((prev) => ({ ...prev, reservedDate: true, reservedTime: true }));
  };

  const handleSubmit = () => {
    setTouched({
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      guestCount: true,
      reservedDate: true,
      reservedTime: true,
    });
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

  const showError = (field: keyof ValidationErrors) =>
    touched[field] && errors[field];

  const inputErrorClass = "border-red-400 focus:border-red-500";
  const errorTextClass = "text-[12px] text-red-500 mt-1 mb-3 -mt-2";

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
        onBlur={() => handleBlur("customerName")}
        placeholder="e.g. Khun Anan"
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none transition-colors mb-4 focus:border-clay ${
          showError("customerName") ? inputErrorClass : "border-black/12"
        }`}
      />
      {showError("customerName") && (
        <p className={errorTextClass}>{errors.customerName}</p>
      )}

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Phone number
      </label>
      <input
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        onBlur={() => handleBlur("customerPhone")}
        placeholder="e.g. 0812345678"
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none transition-colors mb-4 focus:border-clay ${
          showError("customerPhone") ? inputErrorClass : "border-black/12"
        }`}
      />
      {showError("customerPhone") && (
        <p className={errorTextClass}>{errors.customerPhone}</p>
      )}

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Email (optional)
      </label>
      <input
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        onBlur={() => handleBlur("customerEmail")}
        placeholder="e.g. guest@email.com"
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-text-primary placeholder-text-hint outline-none transition-colors mb-4 focus:border-clay ${
          showError("customerEmail") ? inputErrorClass : "border-black/12"
        }`}
      />
      {showError("customerEmail") && (
        <p className={errorTextClass}>{errors.customerEmail}</p>
      )}

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Guest count
      </label>
      <input
        type="number"
        min={1}
        max={100}
        value={guestCount}
        onChange={(e) => setGuestCount(Number(e.target.value))}
        onBlur={() => handleBlur("guestCount")}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-colors mb-4 focus:border-clay ${
          showError("guestCount") ? inputErrorClass : "border-black/12"
        }`}
      />
      {showError("guestCount") && (
        <p className={errorTextClass}>{errors.guestCount}</p>
      )}

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Reservation date
      </label>
      <input
        type="date"
        min={minDate}
        value={reservedDate}
        onChange={(e) => handleDateChange(e.target.value)}
        onBlur={() => handleBlur("reservedDate")}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-colors mb-4 focus:border-clay ${
          showError("reservedDate") ? inputErrorClass : "border-black/12"
        }`}
      />
      {showError("reservedDate") && (
        <p className={errorTextClass}>{errors.reservedDate}</p>
      )}

      <label className="text-[12px] text-text-muted mb-1.5 block">
        Reservation time
        <span className="text-text-hint ml-1">
          ({String(WORKING_HOUR_START).padStart(2, "0")}:00 - {String(WORKING_HOUR_END).padStart(2, "0")}:00)
        </span>
      </label>
      <input
        type="time"
        min={minTime}
        max={maxTime}
        step={300}
        value={reservedTime}
        onChange={(e) => setReservedTime(e.target.value)}
        onBlur={() => handleBlur("reservedTime")}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-colors mb-5 focus:border-clay ${
          showError("reservedTime") ? inputErrorClass : "border-black/12"
        }`}
      />
      {showError("reservedTime") && (
        <p className={errorTextClass}>{errors.reservedTime}</p>
      )}

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
