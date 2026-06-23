"use client";

import { useRole } from "@/context/RoleContext";
import type { Role } from "@/app/admin/types";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-1.5">
      <span className="text-[11px] text-text-hint">Viewing as</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="text-[12px] font-medium text-text-primary bg-transparent outline-none capitalize cursor-pointer"
      >
        <option value="owner">Owner</option>
        <option value="manager">Manager</option>
      </select>
    </div>
  );
}
