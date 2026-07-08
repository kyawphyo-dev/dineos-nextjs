"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import { Table } from "@/app/types/restaurant";
import { Zone } from "@/app/types/admin";
import CreateTable from "@/lib/actions/CreateTable.action";
import { toast } from "sonner";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  available: {
    bg: "bg-sage-light",
    text: "text-sage",
    border: "border-transparent",
  },
  occupied: {
    bg: "bg-gold-light",
    text: "text-[#9A6C10]",
    border: "border-transparent",
  },
  attention: {
    bg: "bg-rose-light",
    text: "text-rose",
    border: "border-transparent",
  },
  reserved: {
    bg: "bg-white",
    text: "text-text-hint",
    border: "border-dashed border-black/15",
  },
};

type Props = {
  tables: Table[];
  zones: Zone[];
  branchId: string;
};

export default function TablesDashboard({ tables, zones, branchId }: Props) {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("");

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);
    try {
      const capacityNum = parseInt(capacity);

      if (!tableNumber.trim() || isNaN(capacityNum) || !selectedZoneId) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }
      setError(null);

      const exists = tables.some(
        (table) =>
          table.tableNumber.toLowerCase() === tableNumber.trim().toLowerCase(),
      );

      if (exists) {
        alert("Table already exists.");
        return;
      }
      const table = await CreateTable({
        tableNumber: tableNumber.trim(),
        capacity: capacityNum,
        zoneId: selectedZoneId,
        branchId: branchId,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
      setTableNumber("");
      setCapacity("");
      setSelectedZoneId("");
      window.location.reload();
    }

    setTableNumber("");
    setCapacity("");
    setSelectedZoneId("");
  };

  const removeTable = (id: string) => {
    alert(`Are you sure you want to delete table with ID ${id}?`);
  };

  const grouped = tables.reduce<Record<string, Table[]>>((acc, table) => {
    const zoneName = table.zone?.name || "Unknown Zone";

    if (!acc[zoneName]) {
      acc[zoneName] = [];
    }

    acc[zoneName].push(table);

    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Tables" subtitle={`${tables.length} tables`} />
      <div className="flex items-center text-center justify-center mb-5">
        {error && (
          <div className="w-1/2 bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/10 p-4 mb-6 flex flex-wrap gap-3">
        <input
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Table Number (e.g. A-1)"
          className="flex-1 min-w-[180px] rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-clay"
        />

        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Capacity"
          className="w-28 rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-clay"
        />

        {zones.length > 0 ? (
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="min-w-[180px] rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-clay"
          >
            <option value="">Select Zone</option>

            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="min-w-[180px] rounded-xl border border-black/10 px-4 py-2.5 text-sm text-gray-500">
            No zones available
          </div>
        )}

        <button
          onClick={(e) => handleAdd(e)}
          disabled={loading}
          className="bg-clay text-white rounded-xl px-5 py-2.5 flex items-center gap-2"
        >
          {loading ? (
            "Adding..."
          ) : (
            <>
              <Plus size={16} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>

      {Object.entries(grouped).map(([zoneName, zoneTables]) => (
        <div key={zoneName} className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            {zoneName}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {zoneTables.map((table) => {
              const style =
                STATUS_STYLES[table.status] || STATUS_STYLES.available;
              return (
                <motion.div
                  key={table.id}
                  whileTap={{ scale: 0.96 }}
                  className={`relative rounded-2xl p-3 text-left border transition-colors ${style.bg} ${style.border}`}
                >
                  <div className="flex items-center">
                    <p className={`text-[15px] font-medium ${style.text}`}>
                      {table.tableNumber}
                    </p>
                    <button
                      onClick={() => removeTable(table.id)}
                      className="absolute top-2 right-2 opacity-30 hover:opacity-100 transition"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                  <p className={`text-[11px] mt-1 opacity-80 ${style.text}`}>
                    Capacity: {table.capacity}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {tables.length === 0 && (
        <div className="text-center text-gray-500 py-12">No tables found.</div>
      )}
    </div>
  );
}
