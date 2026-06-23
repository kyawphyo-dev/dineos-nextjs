"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import PageHeader from "@/app/admin/components/PageHeader";
import AccessDenied from "@/app/admin/components/AccessDenied";
import { useRole } from "@/context/RoleContext";
import { SALES_TREND, TOP_ITEMS } from "@/app/admin/data/mock";

export default function SalesReportsPage() {
  const { canViewSalesReports } = useRole();

  if (!canViewSalesReports) {
    return (
      <div>
        <PageHeader title="Sales Reports" subtitle="Restricted" />
        <AccessDenied />
      </div>
    );
  }

  const weekTotal = SALES_TREND.reduce((sum, d) => sum + d.revenue, 0);
  const avgPerDay = Math.round(weekTotal / SALES_TREND.length);

  return (
    <div>
      <PageHeader title="Sales Reports" subtitle="This week's revenue and top-selling items" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Revenue this week" value={`฿${weekTotal.toLocaleString()}`} />
        <StatCard label="Average per day" value={`฿${avgPerDay.toLocaleString()}`} />
        <StatCard label="Best day" value="Saturday" />
      </div>

      <div className="bg-white rounded-2xl border border-black/8 p-5 mb-5">
        <p className="text-[13px] font-medium text-text-primary mb-4">Revenue trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={SALES_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7A6458" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#7A6458" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `฿${v / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [`฿${Number(value).toLocaleString()}`, "Revenue"]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }}
            />
            <Bar dataKey="revenue" fill="#C4714A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/6">
          <p className="text-[13px] font-medium text-text-primary">Top-selling items</p>
        </div>
        <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-4 py-2.5 bg-cream-dark text-[10px] font-medium text-text-hint uppercase tracking-wider">
          <span>Item</span>
          <span>Qty sold</span>
          <span>Revenue</span>
        </div>
        {TOP_ITEMS.map((item, i) => (
          <div
            key={item.name}
            className={`grid grid-cols-[1.5fr_1fr_1fr] gap-2 items-center px-4 py-3 ${
              i !== TOP_ITEMS.length - 1 ? "border-b border-black/6" : ""
            }`}
          >
            <span className="text-[13px] font-medium text-text-primary">{item.name}</span>
            <span className="text-[13px] text-text-muted">{item.qtySold}</span>
            <span className="text-[13px] text-clay-dark font-medium">฿{item.revenue.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 p-4">
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <p className="text-[18px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}
