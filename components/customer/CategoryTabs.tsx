"use client";

type CategoryTabsProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, number>;
};

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide px-5 gap-1.5 pb-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`py-2 px-3.5 text-[13px] whitespace-nowrap rounded-xl flex items-center gap-1.5 transition-all ${
            activeCategory === cat
              ? "bg-clay text-white shadow-sm"
              : "bg-white border border-black/8 text-text-muted hover:bg-cream-dark"
          }`}
        >
          <span>{cat}</span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              activeCategory === cat
                ? "bg-white/20 text-white"
                : "bg-cream-dark text-text-hint"
            }`}
          >
            {categoryCounts[cat] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
