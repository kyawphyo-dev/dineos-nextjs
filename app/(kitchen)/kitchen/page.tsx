"use client";

import { useState, useMemo } from "react";
import {
  ChefHat,
  RefreshCw,
  Building2,
  MapPin,
  UtensilsCrossed,
  ClipboardList,
} from "lucide-react";
import RouteGuard from "@/components/shared/RouteGuard";
import UserMenu from "@/components/shared/UserMenu";
import StationTabs from "@/components/kitchen/StationTabs";
import ViewToggle from "@/components/kitchen/ViewToggle";
import KanbanColumn from "@/components/kitchen/KanbanColumn";
import DishView from "@/components/kitchen/DishView";
import { useKitchenSession } from "@/context/KitchenSessionContext";
import type { TicketStatus, ViewMode } from "@/app/types/kitchen";

const COLUMNS: TicketStatus[] = ["new", "preparing", "ready"];

function KitchenDisplay() {
  const { restaurant, branch, tickets, advanceStatus, refreshData } =
    useKitchenSession();
  const [station, setStation] = useState("All stations");
  const [viewMode, setViewMode] = useState<ViewMode>("order");

  const filteredTickets = useMemo(() => {
    if (station === "All stations") return tickets;
    return tickets
      .map((t) => ({
        ...t,
        items: t.items.filter((i) => i.station === station),
      }))
      .filter((t) => t.items.length > 0);
  }, [tickets, station]);

  const activeCount = filteredTickets.filter(
    (t) => t.status !== "served",
  ).length;

  const handleAdvance = (ticketId: string, next: string) => {
    advanceStatus(ticketId, next as TicketStatus);
  };

  return (
    <div className="min-h-screen bg-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-bark flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[18px] font-semibold text-text-primary leading-tight">
                Kitchen Display
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-text-hint shrink-0" />
                  <span className="text-[12px] font-medium text-text-secondary">
                    {restaurant.name || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-text-hint shrink-0" />
                  <span className="text-[12px] font-medium text-text-muted">
                    {branch.name || "—"}
                  </span>
                </div>
                {branch.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-hint shrink-0" />
                    <span className="text-[12px] text-text-muted">
                      {branch.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-sage/10 border border-sage/20 rounded-xl px-3.5 py-2">
              <ClipboardList className="w-4 h-4 text-sage shrink-0" />
              <span className="text-[13px] font-semibold text-sage">
                {activeCount}
              </span>
              <span className="text-[11px] font-medium text-sage/80">
                Active
              </span>
            </div>
            <button
              onClick={() => refreshData()}
              className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted bg-white border border-black/8 rounded-xl px-3.5 py-2 hover:bg-cream transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <UserMenu />
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <StationTabs active={station} onChange={setStation} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "order" ? (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:overflow-x-visible sm:flex-wrap lg:flex-nowrap">
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={filteredTickets.filter((t) => t.status === status)}
                onAdvance={handleAdvance}
              />
            ))}
          </div>
        ) : (
          <DishView tickets={filteredTickets} />
        )}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <RouteGuard allow={["kitchen", "owner", "manager"]}>
      <KitchenDisplay />
    </RouteGuard>
  );
}
