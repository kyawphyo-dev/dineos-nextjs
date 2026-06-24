"use client";

import type { Ticket } from "@/app/types/kitchen";

interface AggregatedDish {
  name: string;
  qty: number;
  tables: string[];
}

function aggregateByDish(tickets: Ticket[]): AggregatedDish[] {
  const map = new Map<string, AggregatedDish>();

  for (const ticket of tickets) {
    if (ticket.status === "served") continue;
    for (const item of ticket.items) {
      const existing = map.get(item.name);
      if (existing) {
        existing.qty += item.qty;
        if (!existing.tables.includes(ticket.tableId)) existing.tables.push(ticket.tableId);
      } else {
        map.set(item.name, { name: item.name, qty: item.qty, tables: [ticket.tableId] });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
}

interface Props {
  tickets: Ticket[];
}

export default function DishView({ tickets }: Props) {
  const dishes = aggregateByDish(tickets);

  if (dishes.length === 0) {
    return <div className="text-center text-[13px] text-text-hint py-12">No active dishes</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {dishes.map((dish) => (
        <div
          key={dish.name}
          className="bg-white rounded-2xl border border-black/8 p-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-cream-dark flex items-center justify-center text-[14px] font-semibold text-text-primary flex-shrink-0">
            {dish.qty}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-text-primary truncate">{dish.name}</p>
            <p className="text-[11px] text-text-hint mt-0.5">
              Table{dish.tables.length > 1 ? "s" : ""} {dish.tables.join(", ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
