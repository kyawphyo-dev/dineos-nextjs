"use client";

import UserMenu from "@/components/shared/UserMenu";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  action?: ReactNode;
  center?: ReactNode;
}

export default function PageHeader({ title, subtitle, action, center }: Props) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="min-w-0">
        <h1 className="text-[18px] font-medium text-text-primary">{title}</h1>
        <p className="text-[12px] text-text-muted mt-0.5">{subtitle}</p>
      </div>
      {center && <div className="flex-1 max-w-md mx-4 min-w-0">{center}</div>}
      <div className="flex items-center gap-2 ml-auto">
        {action}
        <UserMenu />
      </div>
    </div>
  );
}
