"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { INITIAL_STAFF } from "@/app/admin/data/mock";
import type { Role, StaffMember, StaffRole } from "@/app/admin/types";

interface StaffContextValue {
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, "id">, actingRole: Role) => { ok: boolean; reason?: string };
  updateStaffRole: (id: string, role: StaffRole, actingRole: Role) => { ok: boolean; reason?: string };
  removeStaff: (id: string, actingRole: Role) => { ok: boolean; reason?: string };
}

const StaffContext = createContext<StaffContextValue | undefined>(undefined);

let staffCounter = 100;

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  const addStaff = (member: Omit<StaffMember, "id">, actingRole: Role) => {
    if (member.role === "owner" && actingRole !== "owner") {
      return { ok: false, reason: "Only an Owner can create another Owner-level account." };
    }
    setStaff((prev) => [...prev, { ...member, id: `s${staffCounter++}` }]);
    return { ok: true };
  };

  const updateStaffRole = (id: string, role: StaffRole, actingRole: Role) => {
    const target = staff.find((s) => s.id === id);
    if (!target) return { ok: false, reason: "Staff member not found." };
    if ((target.role === "owner" || role === "owner") && actingRole !== "owner") {
      return { ok: false, reason: "Only an Owner can change Owner-level accounts." };
    }
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)));
    return { ok: true };
  };

  const removeStaff = (id: string, actingRole: Role) => {
    const target = staff.find((s) => s.id === id);
    if (!target) return { ok: false, reason: "Staff member not found." };
    if (target.role === "owner" && actingRole !== "owner") {
      return { ok: false, reason: "Only an Owner can remove an Owner-level account." };
    }
    setStaff((prev) => prev.filter((s) => s.id !== id));
    return { ok: true };
  };

  return (
    <StaffContext.Provider value={{ staff, addStaff, updateStaffRole, removeStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within a StaffProvider");
  return ctx;
}
