"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES, type LanguageCode } from "./customerMenu.utils";

type LanguageModalProps = {
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

function LanguageModal({
  showLanguageModal: _showLanguageModal,
  setShowLanguageModal,
  language,
  setLanguage,
}: LanguageModalProps) {
  return (
    <>
      <motion.div
        key="lang-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowLanguageModal(false)}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5"
      />
      <motion.div
        key="lang-panel"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-5 pointer-events-none"
      >
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto overflow-hidden">
          <div className="bg-bark px-5 py-4 flex items-center justify-between">
            <h3 className="text-[16px] font-medium text-white">
              Change Language
            </h3>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-3">
            <div className="flex flex-col gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    toast.success(`Language: ${lang.label} (Placeholder)`);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors ${
                    language === lang.code
                      ? "bg-clay text-white shadow-sm"
                      : "bg-white text-text-primary hover:bg-cream-dark"
                  }`}
                >
                  <span className="text-[14px] font-medium">{lang.label}</span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      language === lang.code
                        ? "bg-white/20 text-white"
                        : "bg-cream-dark text-text-hint"
                    }`}
                  >
                    {lang.code}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-hint text-center mt-4 mb-2 px-2">
              Placeholder · Language switching is not functional yet.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default LanguageModal;
