"use client";

import RouteGuard from "@/components/shared/RouteGuard";
import { useState } from "react";
import { Plus, Trash2, Lock } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useStaff } from "@/context/AdminStaffContext";
import { useRole } from "@/context/RoleContext";
import type { StaffRole } from "@/app/types/admin";

const ROLE_LABEL: Record<StaffRole, string> = {
  owner: "Owner",
  manager: "Manager",
  front_staff: "Front Staff",
  kitchen: "Kitchen",
  cashier: "Cashier",
};

const ROLE_BADGE: Record<StaffRole, string> = {
  owner: "bg-gold-light text-[#9A6C10]",
  manager: "bg-info-light text-info",
  front_staff: "bg-cream-dark text-text-muted",
  kitchen: "bg-cream-dark text-text-muted",
  cashier: "bg-cream-dark text-text-muted",
};

function StaffDashboard() {
  const { role } = useRole();
  const { staff, addStaff, updateStaffRole, removeStaff } = useStaff();
  const [name, setName] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("front_staff");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    const result = addStaff({ name: name.trim(), role: newRole, assignedTo: assignedTo.trim() || "Unassigned", status: "active" }, role);
    if (!result.ok) {
      setError(result.reason ?? "Unable to add staff member.");
      return;
    }
    setError(null);
    setName("");
    setAssignedTo("");
    setNewRole("front_staff");
  };

  const handleRoleChange = (id: string, nextRole: StaffRole) => {
    const result = updateStaffRole(id, nextRole, role);
    setError(result.ok ? null : result.reason ?? "Unable to update role.");
  };

  const handleRemove = (id: string) => {
    const result = removeStaff(id, role);
    setError(result.ok ? null : result.reason ?? "Unable to remove staff member.");
  };

  return (
    <div>
      <PageHeader title="Staff Accounts" subtitle={`${staff.length} staff members`} />

      {error && (
        <div className="bg-rose-light border border-rose/20 text-rose text-[12px] rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Staff name"
          className="flex-1 min-w-[140px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as StaffRole)}
          className="rounded-xl border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-clay"
        >
          <option value="front_staff">Front Staff</option>
          <option value="kitchen">Kitchen</option>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
          <option value="owner">Owner</option>
        </select>
        <input
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assigned to (e.g. Floor 1)"
          className="flex-1 min-w-[140px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <button
          onClick={handleAdd}
          className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add staff
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_140px_1fr_90px_40px] gap-2 px-4 py-2.5 bg-cream-dark text-[10px] font-medium text-text-hint uppercase tracking-wider">
          <span>Name</span>
          <span>Role</span>
          <span>Assigned to</span>
          <span>Status</span>
          <span></span>
        </div>
        {staff.map((member, i) => {
          const isProtected = member.role === "owner" && role !== "owner";
          return (
            <div
              key={member.id}
              className={`grid grid-cols-[1.2fr_140px_1fr_90px_40px] gap-2 items-center px-4 py-3 ${
                i !== staff.length - 1 ? "border-b border-black/6" : ""
              }`}
            >
              <span className="text-[13px] font-medium text-text-primary truncate">{member.name}</span>

              {isProtected ? (
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full w-fit flex items-center gap-1 ${ROLE_BADGE[member.role]}`}>
                  <Lock className="w-2.5 h-2.5" />
                  {ROLE_LABEL[member.role]}
                </span>
              ) : (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as StaffRole)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-full border-none outline-none cursor-pointer ${ROLE_BADGE[member.role]}`}
                >
                  <option value="front_staff">Front Staff</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              )}

              <span className="text-[12px] text-text-muted truncate">{member.assignedTo}</span>
              <span
                className={`text-[11px] font-medium ${
                  member.status === "active" ? "text-sage" : "text-text-hint"
                }`}
              >
                {member.status === "active" ? "Active" : "Off shift"}
              </span>
              <button
                onClick={() => handleRemove(member.id)}
                disabled={isProtected}
                className={`p-1 justify-self-end ${
                  isProtected ? "text-text-hint/40 cursor-not-allowed" : "text-text-hint hover:text-rose"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StaffPage() {
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <StaffDashboard />
    </RouteGuard>
  );
}
