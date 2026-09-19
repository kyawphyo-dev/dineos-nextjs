"use client";

import { useKitchenSession } from "@/context/KitchenSessionContext";

interface Props {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  const { categories } = useKitchenSession();

  const options = ["All categories", ...categories.map((c) => c.name)];

  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
            active === category
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-text-muted border-black/10"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
