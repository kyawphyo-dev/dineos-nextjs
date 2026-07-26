"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  resultCount?: number;
  totalCount?: number;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  resultCount,
  totalCount,
}: SearchBarProps) {
  const showCount =
    typeof resultCount === "number" && typeof totalCount === "number";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="bg-white rounded-xl border border-black/10 flex items-center gap-2 px-3.5 py-2.5 focus-within:border-clay transition-colors">
        <Search className="w-4 h-4 text-text-hint flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent text-[13px] text-text-primary placeholder:text-text-hint outline-none flex-1 min-w-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-text-hint hover:text-text-primary transition-colors p-0.5 -m-0.5"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {showCount && value && (
        <p className="text-[11px] text-text-hint px-1">
          {resultCount} of {totalCount} results
        </p>
      )}
    </div>
  );
}
