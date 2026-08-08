"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CallStaffDemoButton() {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => toast.success("Staff has been notified (demo)")}
      className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium active:bg-clay-dark transition-colors"
      type="button"
    >
      Call staff
    </motion.button>
  );
}

