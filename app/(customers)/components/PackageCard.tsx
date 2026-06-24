import { motion } from "framer-motion";
import { Package } from "../types";

 export default function PackageCard({
    pkg,
    selected,
    onSelect,
  }: {
    pkg: Package;
    selected: boolean;
    onSelect: () => void;
  }) {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${
          selected ? "border-clay shadow-[0_0_0_2px_rgba(196,113,74,0.2)]" : "border-black/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center text-[20px] flex-shrink-0">
            {pkg.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-text-primary">{pkg.name}</p>
            <p className="text-[12px] text-text-muted mt-0.5">{pkg.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[18px] font-medium text-clay-dark">฿{pkg.price}</p>
            <p className="text-[11px] text-text-hint">/ person</p>
          </div>
        </div>
      </motion.button>
    );
  }