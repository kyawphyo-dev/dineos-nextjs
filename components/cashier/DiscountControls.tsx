"use client";

import { useState } from "react";
import type { Discount, DiscountType } from "@/app/types/cashier";

const PERCENT_PRESETS = [10, 20];

interface Props {
  discount: Discount | null;
  onChange: (discount: Discount | null) => void;
}

export default function DiscountControls({ discount, onChange }: Props) {
  const [mode, setMode] = useState<DiscountType>(discount?.type ?? "percent");
  const [inputValue, setInputValue] = useState<string>(
    discount ? String(discount.value) : "",
  );
  const [discountPropSnapshot, setDiscountPropSnapshot] =
    useState<Discount | null>(discount);

  if (discount !== discountPropSnapshot) {
    if (discount) {
      setMode(discount.type);
      setInputValue(String(discount.value));
    } else {
      setInputValue("");
    }
    setDiscountPropSnapshot(discount);
  }

  const applyDiscount = (nextMode: DiscountType, nextInput: string) => {
    const num = parseFloat(nextInput);
    if (nextMode === "percent") {
      if (isNaN(num) || num <= 0 || num > 100) {
        onChange(null);
        return;
      }
      onChange({ type: "percent", value: num });
    } else {
      if (isNaN(num) || num <= 0) {
        onChange(null);
        return;
      }
      onChange({ type: "fixed", value: num });
    }
  };

  const handleModeChange = (nextMode: DiscountType) => {
    setMode(nextMode);
    applyDiscount(nextMode, inputValue);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    applyDiscount(mode, value);
  };

  const selectPreset = (percent: number) => {
    setMode("percent");
    setInputValue(String(percent));
    onChange({ type: "percent", value: percent });
  };

  const clear = () => {
    setMode("percent");
    setInputValue("");
    onChange(null);
  };

  const unitSymbol = mode === "percent" ? "%" : "฿";
  const placeholder = mode === "percent" ? "0 – 100" : "0.00";
  const inputMode = mode === "percent" ? "numeric" : "decimal";
  const isPresetActive = (p: number) =>
    mode === "percent" && discount?.value === p;

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-medium text-text-primary">
          Apply discount
        </p>
        {discount && (
          <button onClick={clear} className="text-[12px] text-text-hint">
            Clear
          </button>
        )}
      </div>

      <div className="flex rounded-lg border border-black/10 p-0.5 mb-4">
        {(["percent", "fixed"] as DiscountType[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
              mode === m
                ? "bg-info text-white shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {m === "percent" ? "Percent" : "Fixed"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={`text-[14px] font-semibold shrink-0 w-6 text-center ${
            discount ? "text-info" : "text-text-muted"
          }`}
        >
          {unitSymbol}
        </span>
        <input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`flex-1 rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors ${
            discount ? "border-info border-2" : "border-black/10"
          }`}
        />
      </div>

      <div className="flex gap-2">
        {PERCENT_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => selectPreset(p)}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium border transition-colors ${
              isPresetActive(p)
                ? "border-info border-2 text-info bg-info-light"
                : "border-black/10 text-text-muted hover:border-black/20"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
}
