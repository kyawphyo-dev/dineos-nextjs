"use client";

import RouteGuard from "@/components/shared/RouteGuard";
import Link from "next/link";
import { Tag, Soup, Package as PackageIcon, UtensilsCrossed, Users, BarChart3, Wallet, Lock } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useRole } from "@/context/RoleContext";
import { useCatalog } from "@/context/CatalogContext";
import { useStaff } from "@/context/AdminStaffContext";

function AdminDashboard() {
  const { canViewSalesReports } = useRole();
  const { categories, menuItems, packages, tables } = useCatalog();
  const { staff } = useStaff();

  const cards = [
    { href: "/admin/categories", label: "Categories", icon: Tag, value: categories.length },
    { href: "/admin/menu", label: "Menu items", icon: Soup, value: menuItems.length },
    { href: "/admin/packages", label: "Packages", icon: PackageIcon, value: packages.length },
    { href: "/admin/tables", label: "Tables", icon: UtensilsCrossed, value: tables.length },
    { href: "/admin/staff", label: "Staff accounts", icon: Users, value: staff.length },
    { href: "/admin/reports/staff", label: "Staff performance", icon: BarChart3, value: "View" },
    {
      href: "/admin/reports/sales",
      label: "Sales reports",
      icon: Wallet,
      value: canViewSalesReports ? "View" : "Locked",
      locked: !canViewSalesReports,
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Baan Rim Naam · Thai Kitchen" />

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
              <p className="text-[18px] font-semibold text-text-primary mt-1">{card.value}</p>
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

export default function AdminHomePage() {
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <AdminDashboard />
    </RouteGuard>
  );
}
