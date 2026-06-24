"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, QrCode, Users } from "lucide-react";
import { motion } from "framer-motion";
import StatusBar from "@/components/shared/StatusBar";
import { CUSTOMER_PACKAGES } from "@/app/data/customer-mock";
import type { CustomerPackage } from "@/app/types/customer";

export default function LandingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(CUSTOMER_PACKAGES[0].id);

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <StatusBar dark />

      <div className="bg-bark px-5 pt-6 pb-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-clay opacity-10 translate-x-8 -translate-y-8" />
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] text-white/60 font-medium">QR scanned</span>
        </div>
        <h1 className="text-[22px] font-medium text-white leading-snug">
          Baan Rim Naam<br />Thai Kitchen
        </h1>
        <p className="text-[13px] text-clay-mid mt-1">Sukhumvit, Bangkok · Open until 10 PM</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-clay rounded-xl px-3.5 py-2">
          <span className="text-[11px] text-white/75">Table</span>
          <span className="w-px h-4 bg-white/25" />
          <span className="text-[15px] font-medium text-white">A-07</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        <p className="text-[13px] text-text-muted mb-3">Choose your package</p>
        <div className="flex flex-col gap-3 mb-5">
          {CUSTOMER_PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={selected === pkg.id}
              onSelect={() => setSelected(pkg.id)}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/menu")}
          className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          Start your session
        </motion.button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-text-hint">
          <Users className="w-3.5 h-3.5" />
          <span>2 guests at this table</span>
        </div>
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: CustomerPackage;
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
