"use client";

import type { ViewMode } from "../types";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-black/10 overflow-hidden bg-white flex-shrink-0">
      <button
        onClick={() => onChange("order")}
        className={`px-3.5 py-1.5 text-[12px] font-medium ${
          mode === "order" ? "bg-cream-dark text-text-primary" : "text-text-muted"
        }`}
      >
        By order
      </button>
      <button
        onClick={() => onChange("dish")}
        className={`px-3.5 py-1.5 text-[12px] font-medium ${
          mode === "dish" ? "bg-cream-dark text-text-primary" : "text-text-muted"
        }`}
      >
        By dish
      </button>
    </div>
  );
}
