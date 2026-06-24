"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { PACKAGES } from "../../data/mock";
import ROUTES from "@/route";
import Hero from "../../components/Hero";
import PackageCard from "../../components/PackageCard";

export default function LandingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(PACKAGES[0].id);

  return (
    <div className="flex flex-col min-h-screen bg-cream">

    <Hero/>
    
      <div className="flex-1 px-5 py-5">
        <p className="text-[13px] text-text-muted mb-3">Choose your package</p>
        <div className="flex flex-col gap-3 mb-5">
          {PACKAGES.map((pkg) => (
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
          onClick={() => router.push(ROUTES.CUSTOMER_MENU("A-07"))}
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


