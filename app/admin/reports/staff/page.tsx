"use client";

import PageHeader from "@/app/admin/components/PageHeader";
import { STAFF_PERFORMANCE } from "@/app/admin/data/mock";

const ROLE_LABEL: Record<string, string> = {
  front_staff: "Front Staff",
  kitchen: "Kitchen",
  cashier: "Cashier",
};

export default function StaffPerformancePage() {
  return (
    <div>
      <PageHeader title="Staff Performance" subtitle="This week · orders handled and tables served" />

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 bg-cream-dark text-[10px] font-medium text-text-hint uppercase tracking-wider">
          <span>Name</span>
          <span>Role</span>
          <span>Orders handled</span>
          <span>Tables served</span>
        </div>
        {STAFF_PERFORMANCE.map((row, i) => (
          <div
            key={row.name}
            className={`grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 items-center px-4 py-3 ${
              i !== STAFF_PERFORMANCE.length - 1 ? "border-b border-black/6" : ""
            }`}
          >
            <span className="text-[13px] font-medium text-text-primary">{row.name}</span>
            <span className="text-[12px] text-text-muted">{ROLE_LABEL[row.role] ?? row.role}</span>
            <span className="text-[13px] text-text-primary">{row.ordersHandled || "—"}</span>
            <span className="text-[13px] text-text-primary">{row.tablesServed || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
