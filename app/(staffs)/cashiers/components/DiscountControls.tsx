"use client";

import { useState } from "react";
import type { Discount, DiscountType } from "../types";

const PERCENT_PRESETS = [10, 20];

interface Props {
  discount: Discount | null;
  onChange: (discount: Discount | null) => void;
}

export default function DiscountControls({ discount, onChange }: Props) {
  const [fixedInput, setFixedInput] = useState("");
  const [mode, setMode] = useState<DiscountType | null>(discount?.type ?? null);

  const selectPercent = (value: number) => {
    setMode("percent");
    onChange({ type: "percent", value });
  };

  const selectFixed = () => {
    setMode("fixed");
    const value = parseFloat(fixedInput);
    onChange(isNaN(value) || value <= 0 ? null : { type: "fixed", value });
  };

  const handleFixedInputChange = (value: string) => {
    setFixedInput(value);
    if (mode === "fixed") {
      const num = parseFloat(value);
      onChange(isNaN(num) || num <= 0 ? null : { type: "fixed", value: num });
    }
  };

  const clear = () => {
    setMode(null);
    setFixedInput("");
    onChange(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-medium text-text-primary">Apply discount</p>
        {discount && (
          <button onClick={clear} className="text-[12px] text-text-hint">
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        {PERCENT_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => selectPercent(p)}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium border transition-colors ${
              mode === "percent" && discount?.value === p
                ? "border-info border-2 text-info bg-info-light"
                : "border-black/10 text-text-muted"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[13px] text-text-muted flex-shrink-0">฿</span>
        <input
          value={fixedInput}
          onChange={(e) => handleFixedInputChange(e.target.value)}
          onFocus={selectFixed}
          placeholder="Fixed amount off"
          inputMode="decimal"
          className={`flex-1 rounded-lg border px-3 py-2 text-[13px] outline-none transition-colors ${
            mode === "fixed" ? "border-info border-2" : "border-black/10"
          }`}
        />
      </div>
    </div>
  );
}
