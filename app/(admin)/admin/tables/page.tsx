"use client";

import RouteGuard from "@/components/shared/RouteGuard";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useCatalog } from "@/context/CatalogContext";

function TablesDashboard() {
  const { tables, addTable, removeTable } = useCatalog();
  const [id, setId] = useState("");
  const [seats, setSeats] = useState("");
  const [zone, setZone] = useState("");

  const handleAdd = () => {
    const seatsNum = parseInt(seats, 10);
    if (!id.trim() || isNaN(seatsNum) || !zone.trim()) return;
    if (tables.some((t) => t.id === id.trim())) return;
    addTable({ id: id.trim(), seats: seatsNum, zone: zone.trim() });
    setId("");
    setSeats("");
    setZone("");
  };

  const grouped = tables.reduce<Record<string, typeof tables>>((acc, t) => {
    acc[t.zone] = acc[t.zone] ? [...acc[t.zone], t] : [t];
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Tables" subtitle={`${tables.length} tables`} />

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-5 flex flex-wrap gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Table ID (e.g. A-09)"
          className="flex-1 min-w-[140px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <input
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          placeholder="Seats"
          inputMode="numeric"
          className="w-24 rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <input
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          placeholder="Zone (e.g. Floor 1)"
          className="flex-1 min-w-[120px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <button
          onClick={handleAdd}
          className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {Object.entries(grouped).map(([zoneName, zoneTables]) => (
        <div key={zoneName} className="mb-5">
          <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-2">
            {zoneName}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {zoneTables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-xl border border-black/8 p-3 relative group"
              >
                <p className="text-[14px] font-medium text-text-primary">{table.id}</p>
                <p className="text-[11px] text-text-hint mt-0.5">{table.seats} seats</p>
                <button
                  onClick={() => removeTable(table.id)}
                  className="absolute top-2 right-2 text-text-hint hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {tables.length === 0 && (
        <p className="text-center text-text-hint text-[13px] py-10">No tables yet.</p>
      )}
    </div>
  );
}

export default function TablesPage() {
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <TablesDashboard />
    </RouteGuard>
  );
}
