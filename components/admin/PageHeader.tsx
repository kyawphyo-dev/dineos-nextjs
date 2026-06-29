"use client";

import UserMenu from "@/components/shared/UserMenu";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-[18px] font-medium text-text-primary">{title}</h1>
        <p className="text-[12px] text-text-muted mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {action}
        <UserMenu />
      </div>
    </div>
  );
}
