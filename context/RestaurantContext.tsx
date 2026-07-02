// app/context/RestaurantContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MOCK_COMPANY_GROUPS } from "@/app/data/restaurant-mock-data";
import type { Restaurant, Branch } from "@/app/types/restaurant";

interface RestaurantContextValue {
  groups: typeof MOCK_COMPANY_GROUPS;
  activeRestaurant: Restaurant | null;
  activeBranch: Branch | null;
  selectRestaurant: (restaurantId: string) => void;
  selectBranch: (branchId: string) => void;
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(
  undefined,
);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);

  const allRestaurants = MOCK_COMPANY_GROUPS.flatMap((g) => g.restaurants);

  const selectRestaurant = (restaurantId: string) => {
    const restaurant =
      allRestaurants.find((r) => r.id === restaurantId) ?? null;
    setActiveRestaurant(restaurant);
    // Default to the main branch when a restaurant is first selected.
    setActiveBranch(
      restaurant?.branches.find((b) => b.isMain) ??
        restaurant?.branches[0] ??
        null,
    );
  };

  const selectBranch = (branchId: string) => {
    const branch =
      activeRestaurant?.branches.find((b) => b.id === branchId) ?? null;
    setActiveBranch(branch);
  };

  return (
    <RestaurantContext.Provider
      value={{
        groups: MOCK_COMPANY_GROUPS,
        activeRestaurant,
        activeBranch,
        selectRestaurant,
        selectBranch,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx)
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  return ctx;
}
