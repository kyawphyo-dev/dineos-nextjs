"use client";

import { STATIONS } from "@/app/data/kitchen-mock";

interface Props {
  active: string;
  onChange: (station: string) => void;
}

export default function StationTabs({ active, onChange }: Props) {
  const options = ["All stations", ...STATIONS];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((station) => (
        <button
          key={station}
          onClick={() => onChange(station)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
            active === station
              ? "bg-bark text-white border-bark"
              : "bg-white text-text-muted border-black/10"
          }`}
        >
          {station}
        </button>
      ))}
    </div>
  );
}
