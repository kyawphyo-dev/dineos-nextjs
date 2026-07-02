// app/components/restaurant/AddRestaurantModal.tsx
"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
  handleSubmit: (form: FormState) => void;
}

export type FormState = {
  restaurantName: string;
  branchName: string;
  branchAddress: string;
};

export default function AddRestaurantModal({ onClose, handleSubmit }: Props) {
  const [form, setForm] = useState<FormState>({
    restaurantName: "",
    branchName: "",
    branchAddress: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleAddRestaurant = async () => {
    if (!form.restaurantName.trim())
      return setError("Restaurant name is required.");
    if (!form.branchName.trim()) return setError("Branch name is required.");
    if (!form.branchAddress.trim())
      return setError("Branch address is required.");

    setError(null);
    handleSubmit(form);
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
            Add restaurant
          </h2>
          <button
            onClick={onClose}
            className="text-text-hint hover:text-text-primary p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {error && (
            <div className="bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          {/* Section 1 — Restaurant */}
          <div>
            <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
              1 · Restaurant information
            </p>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-[12px] text-text-muted mb-1.5 block">
                  Restaurant name
                </label>
                <input
                  value={form.restaurantName}
                  onChange={set("restaurantName")}
                  placeholder="e.g. Baan Rim Naam Thai Kitchen"
                  className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                />
              </div>

              {/* <div>
                <label className="text-[12px] text-text-muted mb-1.5 block">
                  Company
                </label>
                <select
                  value={form.companyId}
                  onChange={set("companyId")}
                  className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay bg-white"
                >
                  {groups.map((g) => (
                    <option key={g.company.id} value={g.company.id}>
                      {g.company.name}
                    </option>
                  ))}
                  <option value="__new__">+ Create new company…</option>
                </select>
                <p className="text-[11px] text-text-hint mt-1.5">
                  Restaurants under the same company share an owner account.
                </p>
              </div> */}

              {/* {isNewCompany && (
                <div>
                  <label className="text-[12px] text-text-muted mb-1.5 block">
                    New company name
                  </label>
                  <input
                    value={form.newCompanyName}
                    onChange={set("newCompanyName")}
                    placeholder="e.g. Riverside Group"
                    className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                  />
                </div>
              )} */}
            </div>
          </div>

          <div className="border-t border-black/8" />

          <div>
            <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
              2 · Main branch
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9A6C10] bg-gold-light rounded-lg px-2.5 py-1.5 w-fit mb-3.5">
              <Star className="w-3 h-3" />
              Main branch
            </div>
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
            onClick={handleAddRestaurant}
            className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium"
          >
            Create restaurant
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
