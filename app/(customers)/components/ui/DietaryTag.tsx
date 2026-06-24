import type { DietaryTag as DietaryTagType, SpiceLevel } from "../../types/index";

const DIETARY_STYLES: Record<DietaryTagType, string> = {
  Halal: "bg-sage-light text-sage",
  Vegan: "bg-sage-light text-sage",
  Vegetarian: "bg-sage-light text-sage",
  "Gluten-free": "bg-sage-light text-sage",
};

const SPICE_STYLES: Record<SpiceLevel, string> = {
  Mild: "bg-[#FEF0E8] text-[#C4622A]",
  "Medium spicy": "bg-[#FEF0E8] text-[#C4622A]",
  Hot: "bg-[#FEF0E8] text-[#C4622A]",
};

export function DietaryBadge({ tag }: { tag: DietaryTagType }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIETARY_STYLES[tag]}`}>
      {tag}
    </span>
  );
}

export function SpiceBadge({ level }: { level: SpiceLevel }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SPICE_STYLES[level]}`}>
      {level}
    </span>
  );
}
