"use client";

import type { ViewMode } from "@/app/types/kitchen";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-bark/20 overflow-hidden bg-white shrink-0">
      <button
        onClick={() => onChange("order")}
        className={`px-3.5 py-1.5 text-[12px] font-medium ${
          mode === "order"
            ? "bg-bark text-white border-bark"
            : "bg-cream-dark text-text-primary"
        }`}
      >
        By order
      </button>
      <button
        onClick={() => onChange("dish")}
        className={`px-3.5 py-1.5 text-[12px] font-medium ${
          mode === "dish"
            ? "bg-bark text-white border-bark"
            : "bg-cream-dark text-text-primary"
        }`}
      >
        By dish
      </button>
    </div>
  );
}
