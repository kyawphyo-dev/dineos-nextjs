"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  Tag,
  Soup,
  Package as PackageIcon,
  UtensilsCrossed,
  Users,
  BarChart3,
  Lock,
  Wallet,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

const NAV_SECTIONS = [
  {
    label: "Catalog",
    items: [
      { href: "/categories", label: "Categories", icon: Tag },
      { href: "/menu", label: "Menu items", icon: Soup },
      { href: "/packages", label: "Packages", icon: PackageIcon },
      { href: "/tables", label: "Tables", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Team",
    items: [{ href: "/staff", label: "Staff accounts", icon: Users }],
  },
  {
    label: "Insights",
    items: [
      { href: "/reports/staff", label: "Staff performance", icon: BarChart3 },
      { href: "/reports/sales", label: "Sales reports", icon: Wallet, ownerOnly: true },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role, canViewSalesReports } = useRole();

  return (
    <div className="w-[220px] bg-cream-dark border-r border-black/8 flex-shrink-0 px-3 py-4 hidden md:flex md:flex-col">
      <div className="flex items-center gap-2 px-2 pb-1">
        <div className="w-7 h-7 rounded-lg bg-bark flex items-center justify-center flex-shrink-0">
          <ChefHat className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[13px] font-semibold text-text-primary">DineOS Admin</span>
      </div>
      <p className="text-[10px] text-text-hint px-2 pb-3 capitalize">Signed in as {role}</p>

      <nav className="flex-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <p className="text-[10px] font-medium text-text-hint uppercase tracking-wider px-2 pt-3 pb-1.5">
              {section.label}
            </p>
            {section.items.map((item) => {
              const locked = item.ownerOnly && !canViewSalesReports;
              const active = pathname === item.href;
              const Icon = item.icon;

              if (locked) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-text-hint opacity-50 cursor-not-allowed"
                    title="Owner access only"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                    <Lock className="w-3 h-3 ml-auto" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] transition-colors ${
                    active
                      ? "bg-white text-text-primary font-medium shadow-sm"
                      : "text-text-muted hover:bg-white/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
