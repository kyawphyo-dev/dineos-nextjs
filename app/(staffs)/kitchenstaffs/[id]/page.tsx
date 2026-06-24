"use client";

import { useState, useMemo } from "react";
import { ChefHat } from "lucide-react";
import StationTabs from "../components/StationTabs";
import ViewToggle from "../components/ViewToggle";
import KanbanColumn from "../components/KanbanColumn";
import DishView from "../components/DishView";
import { useTickets } from "@/context/TicketsContext";
import type { OrderStatus, ViewMode } from "../types";

const COLUMNS: OrderStatus[] = ["new", "preparing", "ready"];

export default function KitchenDisplay() {
  const { tickets, advanceStatus } = useTickets();
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

  const activeCount = filteredTickets.filter((t) => t.status !== "served").length;

  const handleAdvance = (ticketId: string, next: string) => {
    advanceStatus(ticketId, next as OrderStatus);
  };

  return (
    <div className="min-h-screen bg-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bark flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-medium text-text-primary">Kitchen Display</h1>
              <p className="text-[12px] text-text-muted mt-0.5">
                {station} · {activeCount} active ticket{activeCount !== 1 ? "s" : ""}
              </p>
            </div>
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
