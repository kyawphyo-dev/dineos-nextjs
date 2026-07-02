"use client";

import { useRouter } from "next/navigation";
import { ChefHat, Building2, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Restaurant } from "@/app/types/restaurant";
import { useState } from "react";
import AddBranchModal, { FormState } from "@/components/admin/AddBranchModel";
import { toast } from "sonner";
import CreateBranch from "@/lib/actions/CreateBranch.action";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";

type BranchSelectProps = {
  userName: string;
  restaurant: Restaurant;
};

export default function BranchSelect({
  userName,
  restaurant,
}: BranchSelectProps) {
  const router = useRouter();
  const [showAddBranch, setShowAddBranch] = useState(false);

  const handleSelectBranch = (branchId: string) => {
    router.push(`/admin/${restaurant.id}/${branchId}`);
  };
  const handleDeleteBranch = (
    branchId: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    alert("deleteBranch");
  };

  const initials = userName
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAddBranchSubmit = async (
    form: FormState,
    restaurantId: string,
  ) => {
    try {
      const result = await CreateBranch(form, restaurantId);
      if (!result.success) {
        toast.error(result.message);
      } else {
        router.refresh(); // Refresh to show new branch
        setShowAddBranch(false);
      }
    } catch (error) {
      return toast.error("Add branch failed");
    }
  };

  return (
    <div className="min-h-screen bg-cream-dark px-6 py-8 sm:px-10 mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin`)}
              className="w-8 h-8 flex items-center hover:bg-primary/10 justify-center border border-primary/80 rounded-xl bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 text-primary/80" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-bark flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-[14px] font-semibold text-text-primary">
              DineOS
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-black/10 rounded-full pl-1.5 pr-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-clay-mid flex items-center justify-center text-[10px] font-semibold text-clay-dark">
              {initials ?? "?"}
            </div>
            <span className="text-[12px] font-medium text-text-primary">
              {userName}
            </span>
          </div>
        </div>
        <h1 className="text-[19px] font-semibold text-text-primary mb-1">
          Select a branch
        </h1>
        <p className="text-[13px] text-text-muted mb-7">
          Choose which branch you would like to manage for {restaurant.name}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {restaurant.branches.map((branch) => (
            <motion.div
              key={branch.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectBranch(branch.id)}
              className="text-left bg-white rounded-2xl border border-black/8 p-4 hover:border-clay/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-clay-dark" />
                </div>
                <button
                  className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center hover:bg-clay/10 transition-colors"
                  type="button"
                  onClick={(e) => handleDeleteBranch(branch.id, e)}
                >
                  <Trash2 className="w-4 h-4 text-clay-dark" />
                </button>
              </div>
              <p className="text-[14px] font-semibold text-text-primary mb-0.5">
                {branch.name}
              </p>
              <p className="text-[11px] text-text-hint">
                {branch.location ?? "—"}
              </p>
            </motion.div>
          ))}

          <button
            className="border-2 border-dashed border-black/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-32.5 text-text-hint hover:border-clay/30 hover:text-clay transition-colors"
            onClick={() => setShowAddBranch(true)}
          >
            <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-medium">Add Branch</span>
          </button>
        </div>
        {showAddBranch && (
          <AddBranchModal
            onClose={() => setShowAddBranch(false)}
            handleSubmit={handleAddBranchSubmit}
            restaurantId={restaurant.id}
          />
        )}
      </div>
    </div>
  );
}
