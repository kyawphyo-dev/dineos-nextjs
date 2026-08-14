"use client";

import { motion } from "framer-motion";
import { X, QrCode } from "lucide-react";
import { toast } from "sonner";
import type { CustomerTableInfo } from "@/context/CustomerTableSessionProvider";

type ScanQrModalProps = {
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  table: CustomerTableInfo;
};

function ScanQrModal({
  showScanModal: _showScanModal,
  setShowScanModal,
  table,
}: ScanQrModalProps) {
  return (
    <>
      <motion.div
        key="scan-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowScanModal(false)}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5"
      />
      <motion.div
        key="scan-panel"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none"
      >
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto overflow-hidden">
          <div className="bg-bark px-5 py-4 flex items-center justify-between">
            <h3 className="text-[16px] font-medium text-white">
              Scan Table Number
            </h3>
            <button
              onClick={() => setShowScanModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-5">
            <div className="bg-cream-dark rounded-2xl h-64 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
              <div className="absolute inset-8 border-2 border-clay border-dashed rounded-2xl animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-clay-light flex items-center justify-center">
                <QrCode className="w-8 h-8 text-clay-dark" />
              </div>
              <div className="text-center z-10">
                <p className="text-[14px] font-medium text-text-primary">
                  Align QR code within frame
                </p>
                <p className="text-[12px] text-text-hint mt-1">
                  Camera access required · (Placeholder)
                </p>
              </div>
            </div>
            <p className="text-[12px] text-text-muted text-center mt-4 leading-relaxed">
              Point your camera at the QR code on your table to switch to
              another table. Current: Table {table.tableNumber}
            </p>
            <button
              onClick={() => {
                toast.success("Placeholder: QR scanner");
                setShowScanModal(false);
              }}
              className="w-full mt-5 bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium active:bg-clay-dark transition-colors"
            >
              Open camera
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default ScanQrModal;
