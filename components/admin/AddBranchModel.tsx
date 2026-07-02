// app/components/restaurant/AddRestaurantModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
  handleSubmit: (form: FormState, restaurantId: string) => void;
  restaurantId: string;
}

export type FormState = {
  branchName: string;
  branchAddress: string;
};

export default function AddBranchModal({
  onClose,
  handleSubmit,
  restaurantId,
}: Props) {
  const [form, setForm] = useState<FormState>({
    branchName: "",
    branchAddress: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleAddBranch = async () => {
    if (!form.branchName.trim()) return setError("Branch name is required.");
    if (!form.branchAddress.trim())
      return setError("Branch address is required.");

    setError(null);
    handleSubmit(form, restaurantId);
  };

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        className="bg-white rounded-2xl border border-black/8 w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="text-[15px] font-semibold text-text-primary">
            Add Branch
          </h2>
          <button
            onClick={onClose}
            className="text-text-hint hover:text-text-primary p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 flex pb-5 flex-col gap-5">
          {error && (
            <div className="bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="" />
          <div>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12px] text-text-muted mb-1.5 block">
                  Branch name
                </label>
                <input
                  value={form.branchName}
                  onChange={set("branchName")}
                  placeholder="e.g. Sukhumvit"
                  className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                />
              </div>
              <div>
                <label className="text-[12px] text-text-muted mb-1.5 block">
                  Address
                </label>
                <input
                  value={form.branchAddress}
                  onChange={set("branchAddress")}
                  placeholder="e.g. 123 Sukhumvit Rd, Bangkok"
                  className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end px-6 py-4 border-t border-black/8">
          <button
            onClick={onClose}
            className="border border-black/12 text-text-muted rounded-xl px-4 py-2.5 text-[13px] font-medium"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddBranch}
            className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
          >
            Create Branch
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
