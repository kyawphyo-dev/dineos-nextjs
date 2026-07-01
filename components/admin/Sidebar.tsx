"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
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

export default function Sidebar() {
  const pathname = usePathname();
  const { role, canViewSalesReports } = useRole();
  const { restaurantId, branchId } = useParams();

  const NAV_SECTIONS = [
    {
      label: "Catalog",
      items: [
        {
          href: `/admin/${restaurantId}/${branchId}/categories`,
          label: "Categories",
          icon: Tag,
          segment: "/categories",
        },
        {
          href: `/admin/${restaurantId}/${branchId}/menu`,
          label: "Menu items",
          icon: Soup,
          segment: "/menu",
        },
        {
          href: `/admin/${restaurantId}/${branchId}/packages`,
          label: "Packages",
          icon: PackageIcon,
          segment: "/packages",
        },
        {
          href: `/admin/${restaurantId}/${branchId}/tables`,
          label: "Tables",
          icon: UtensilsCrossed,
          segment: "/tables",
        },
      ],
    },
    {
      label: "Team",
      items: [
        {
          href: `/admin/${restaurantId}/${branchId}/staff`,
          label: "Staff accounts",
          icon: Users,
          segment: "/staff",
        },
      ],
    },
    {
      label: "Insights",
      items: [
        {
          href: `/admin/${restaurantId}/${branchId}/reports/staff`,
          label: "Staff performance",
          icon: BarChart3,
          segment: "/reports/staff",
        },
        {
          href: `/admin/${restaurantId}/${branchId}/reports/sales`,
          label: "Sales reports",
          icon: Wallet,
          ownerOnly: true,
          segment: "/reports/sales",
        },
      ],
    },
  ];

  return (
    <div className="w-56 bg-cream-dark border-r border-black/8 shrink-0 px-3 py-4 hidden md:flex md:flex-col">
      <Link
        href={`/admin/${restaurantId}/${branchId}`}
        className="flex items-center gap-2 px-2 pb-1"
      >
        <div className="w-7 h-7 rounded-lg bg-bark flex items-center justify-center shrink-0">
          <ChefHat className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[13px] font-semibold text-text-primary">
          DineOS Admin
        </span>
      </Link>
      <p className="text-[10px] text-text-hint px-2 pb-3 capitalize">
        Signed in as {role}
      </p>

      <nav className="flex-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <p className="text-[10px] font-medium text-text-hint uppercase tracking-wider px-2 pt-3 pb-1.5">
              {section.label}
            </p>
            {section.items.map((item) => {
              const locked = item.ownerOnly && !canViewSalesReports;
              const active = pathname.includes(item.segment);
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
