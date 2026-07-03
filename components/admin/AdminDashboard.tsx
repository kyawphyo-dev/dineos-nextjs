"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Tag,
  Soup,
  Package as PackageIcon,
  UtensilsCrossed,
  Users,
  BarChart3,
  Wallet,
  Lock,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useRole } from "@/context/RoleContext";

import type { Branch } from "@prisma/client";

type DashboardCounts = {
  menus: number;
  staff: number;
  orders: number;
  tables: number;
  packages: number;
};

type DashboardData = {
  branch: Branch;
  counts: DashboardCounts;
  restaurantName: string | null;
};

type AdminDashboardProps = {
  data: DashboardData;
};

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const { canViewSalesReports } = useRole();
  const { restaurantId, branchId } = useParams();

  const cards = [
    {
      href: `/admin/${restaurantId}/${branchId}/menu`,
      label: "Menus",
      icon: Soup,
      value: data.counts.menus,
    },
    {
      href: `/admin/${restaurantId}/${branchId}/staff`,
      label: "Staff accounts",
      icon: Users,
      value: data.counts.staff,
    },
    {
      href: "#",
      label: "Orders",
      icon: UtensilsCrossed,
      value: data.counts.orders,
    },
    {
      href: `/admin/${restaurantId}/${branchId}/tables`,
      label: "Tables",
      icon: UtensilsCrossed,
      value: data.counts.tables,
    },
    {
      href: `/admin/${restaurantId}/${branchId}/packages`,
      label: "Packages",
      icon: PackageIcon,
      value: data.counts.packages,
    },
    {
      href: `/admin/${restaurantId}/${branchId}/reports/staff`,
      label: "Staff performance",
      icon: BarChart3,
      value: "View",
    },
    {
      href: `/admin/${restaurantId}/${branchId}/reports/sales`,
      label: "Sales reports",
      icon: Wallet,
      value: canViewSalesReports ? "View" : "Locked",
      locked: !canViewSalesReports,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${data.restaurantName} - ${data.branch.name}`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div
              className={`bg-white rounded-2xl border border-black/8 p-4 h-full transition-colors ${
                card.locked ? "opacity-50" : "hover:border-clay/40"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-clay-light flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-clay-dark" />
              </div>
              <p className="text-[13px] font-medium text-text-primary flex items-center gap-1">
                {card.label}
                {card.locked && <Lock className="w-3 h-3 text-text-hint" />}
              </p>
              <p className="text-[18px] font-semibold text-text-primary mt-1">
                {card.value}
              </p>
            </div>
          );

          if (card.locked) {
            return <div key={card.href}>{content}</div>;
          }

          return (
            <Link key={card.href} href={card.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
