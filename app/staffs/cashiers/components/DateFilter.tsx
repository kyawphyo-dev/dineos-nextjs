"use client";

import { Calendar } from "lucide-react";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  todayISO: string;
  yesterdayISO: string;
}

export default function DateFilter({ value, onChange, todayISO, yesterdayISO }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-2">
        <Calendar className="w-3.5 h-3.5 text-text-hint flex-shrink-0" />
        <input
          type="date"
          value={value}
          max={todayISO}
          onChange={(e) => onChange(e.target.value)}
          className="text-[13px] text-text-primary outline-none bg-transparent"
        />
      </div>

      <button
        onClick={() => onChange(todayISO)}
        className={`text-[12px] font-medium px-3 py-2 rounded-xl border transition-colors ${
          value === todayISO
            ? "bg-bark text-white border-bark"
            : "bg-white text-text-muted border-black/10"
        }`}
      >
        Today
      </button>
      <button
        onClick={() => onChange(yesterdayISO)}
        className={`text-[12px] font-medium px-3 py-2 rounded-xl border transition-colors ${
          value === yesterdayISO
            ? "bg-bark text-white border-bark"
            : "bg-white text-text-muted border-black/10"
        }`}
      >
        Yesterday
      </button>
    </div>
  );
}
