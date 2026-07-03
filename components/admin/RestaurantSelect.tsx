"use client";

import { useRouter } from "next/navigation";
import { ChefHat, Building2, Plus, Minus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { CompanyGroup } from "@/app/types/restaurant";
import { useState } from "react";
import { FormState } from "@/components/admin/AddRestaurantModel";
import AddRestaurantModal from "@/components/admin/AddRestaurantModel";
import CreateRestaurant from "@/lib/actions/CreateRestaurant.action";

type RestaurantSelectProps = {
  userName: string;
  groups: CompanyGroup[];
};

export default function RestaurantSelect({
  userName,
  groups,
}: RestaurantSelectProps) {
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const router = useRouter();

  const handleSelect = (restaurantId: string) => {
    router.push(`/admin/${restaurantId}`);
  };

  const handleAddRestaurantSubmit = async (form: FormState) => {
    try {
      const result = await CreateRestaurant(form);
      if (!result.success) {
        alert(result.message);
      } else {
        router.refresh(); // Refresh to show new restaurant
        setShowAddRestaurant(false);
      }
    } catch (error) {
      return alert("Add restaurant failed");
    }
  };

  const handleRestaurantDelete = async (
    restaurantId: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    alert("deleteRestaurant");
  };

  const initials = userName
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream-dark px-6 py-8 sm:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
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
          Select a restaurant
        </h1>
        <p className="text-[13px] text-text-muted mb-7">
          Choose which restaurant you would like to manage
        </p>

        {groups.map((group) => (
          <div key={group.company.id} className="mb-8">
            <div className="flex items-center gap-2 text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" />
              {group.company.name}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {group.restaurants.map((restaurant) => {
                const mainBranch = restaurant.branches[0];
                return (
                  <motion.div
                    key={restaurant.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(restaurant.id)}
                    className="text-left bg-white rounded-2xl border border-black/8 p-4 hover:border-clay/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[10px] font-medium text-text-muted bg-cream-dark rounded-full px-2.5 py-1">
                        {restaurant.branches.length} branch
                        {restaurant.branches.length !== 1 ? "es" : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center hover:bg-clay/10 transition-colors"
                          type="button"
                          onClick={(e) =>
                            handleRestaurantDelete(restaurant.id, e)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-clay-dark" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[14px] font-semibold text-text-primary mb-0.5">
                      {restaurant.name}
                    </p>
                    <p className="text-[11px] text-text-hint mb-3">
                      {mainBranch?.location ?? "—"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {restaurant.branches.map((branch) => (
                        <span
                          key={branch.id}
                          className="text-[10px] px-2 py-1 rounded-lg bg-cream-dark text-text-muted"
                        >
                          {branch.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              <button
                className="border-2 border-dashed border-black/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-32.5 text-text-hint hover:border-clay/30 hover:text-clay transition-colors"
                onClick={() => setShowAddRestaurant(true)}
              >
                {showAddRestaurant ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </div>
                    <span className="text-[12px] font-medium">Cancel</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[12px] font-medium">
                      Add restaurant
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
        {showAddRestaurant && (
          <AddRestaurantModal
            onClose={() => setShowAddRestaurant(false)}
            handleSubmit={handleAddRestaurantSubmit}
          />
        )}
      </div>
    </div>
  );
}
