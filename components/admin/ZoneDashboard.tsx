"use client";
import { Zone } from "@/app/types/admin";
import PageHeader from "@/components/admin/PageHeader";
import CreateZone from "@/lib/actions/CreateZone.action";
import { prisma } from "@/lib/prisma";
import { motion } from "framer-motion";
import { Building2, Plus, Trash2, LayoutTemplate } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

function ZoneDashboard({
  zoneList,
  branchId,
}: {
  zoneList: Zone[];
  branchId: string;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const handleZoneAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const zone = await CreateZone({
      name,
      branchId,
    });
    if (zone.success) {
      toast.success(zone.message || "Zone added successfully.");
      setName("");
    } else {
      toast.error(zone.message || "Failed to add zone.");
    }
    window.location.reload();
    setLoading(false);
    setName("");
  };
  return (
    <div>
      <form onSubmit={handleZoneAdd}>
        <PageHeader
          title="Zone"
          subtitle={`${zoneList.length} zone${zoneList.length === 1 ? "" : "s"}`}
        />

        <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 w-3/4">
          <div className="flex gap-3 mb-3">
            <input
              value={name}
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="zone name"
              className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-1/4 bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {loading ? "Adding..." : "Add zone"}
            </button>
          </div>
        </div>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {zoneList.map((z) => (
          <motion.div
            key={z.id}
            whileTap={{ scale: 0.98 }}
            className="text-left bg-white rounded-2xl border border-black/8 p-4 hover:border-clay/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center">
                <LayoutTemplate className="w-4 h-4 text-clay-dark" />
              </div>
              <button
                className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center hover:bg-clay/10 transition-colors"
                type="button"
              >
                <Trash2 className="w-4 h-4 text-clay-dark" />
              </button>
            </div>
            <p className="text-[14px] font-semibold text-text-primary mb-0.5">
              {z.name}
            </p>
            <p className="text-[11px] text-text-hint">
              {z.tables.length || 0} tables | {z.staff.length || 0} staffs
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ZoneDashboard;
