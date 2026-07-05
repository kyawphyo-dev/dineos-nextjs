"use client";
import { useState } from "react";
import { Plus, Trash2, Lock } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useRole } from "@/context/RoleContext";
import type {
  authenticatedUser,
  StaffMember,
  StaffRole,
  Zone,
} from "@/app/types/admin";
import CreateStaff from "@/lib/actions/CreateUser.action";
import { toast } from "sonner";
import UpdateUserRole from "@/lib/actions/UpdateUserRole.action";
import UpdateStaffZone from "@/lib/actions/UpdateStaffZone.action";
import StaffDelete from "@/lib/actions/StaffDelete.action";

type restaurant = {
  id: string;
  name: string;
};
type branch = {
  id: string;
  name: string;
};

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

export default function StaffDashboard({
  staff,
  totalStaff,
  zoneList,
  restaurant,
  branch,
  currentUser,
}: {
  staff: StaffMember[];
  totalStaff: number;
  zoneList: Zone[];
  restaurant: restaurant;
  branch: branch;
  currentUser: authenticatedUser;
}) {
  const { role } = useRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("front_staff");
  const [selectedZoneId, setSelectedZoneId] = useState(
    zoneList.length > 0 ? zoneList[0].id : "",
  );
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await CreateStaff({
        name,
        email,
        username,
        password,
        pin,
        role: newRole,
        restaurantId: restaurant.id,
        branchId: branch.id,
        zoneId: selectedZoneId,
      });

      if (!result?.success) {
        toast.error(result.message || "Failed to create staff member.");
        return;
      }

      toast.success("Staff created successfully.");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setPin("");
      setNewRole("front_staff");
    }
  };

  const handleRoleChange = async (id: string, nextRole: StaffRole) => {
    const result = await UpdateUserRole({
      id,
      role: nextRole,
    });
    if (!result?.success) {
      toast.error(result.message || "Failed to update role.");
      return;
    }
    toast.success("Role updated successfully.");
    window.location.reload();
  };

  const handleZoneChange = async (id: string, nextZoneId: string) => {
    const result = await UpdateStaffZone({
      id,
      zoneId: nextZoneId,
    });
    if (!result?.success) {
      toast.error(result.message || "Failed to update zone.");
      return;
    }
    toast.success("Zone updated successfully.");
    window.location.reload();
  };

  const handleRemove = async (id: string) => {
    const result = await StaffDelete(id);
    if (!result?.success) {
      toast.error(result.message || "Failed to delete staff member.");
      console.log(result);
      return;
    }
    toast.success("Staff member deleted successfully.");
    window.location.reload();
  };

  return (
    <form onSubmit={handleAdd}>
      <PageHeader
        title="Staff accounts"
        subtitle={`${totalStaff} staff members`}
      />

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <input
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name"
            className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
            required
          />
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
            required
          />
          <input
            value={username}
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
            required
            minLength={6}
          />
          <input
            value={pin}
            type="password"
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN (min 4 chars)"
            className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
            required
            minLength={4}
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as StaffRole)}
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-clay"
          >
            <option value="front_staff">Front staff</option>
            <option value="kitchen">Kitchen</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {zoneList.length > 0 ? (
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="flex-1 min-w-[200px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
              required
            >
              {zoneList.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex-1 min-w-[200px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] text-text-hint">
              No zones available
            </div>
          )}
          <button
            type="submit"
            disabled={loading || zoneList.length === 0}
            className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {loading ? "Adding..." : "Add staff"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_120px_120px_40px] gap-2 px-4 py-2.5 bg-cream-dark text-[10px] font-medium text-text-hint uppercase tracking-wider">
          <span>Name</span>
          <span>Email</span>
          <span>Username</span>
          <span>Role</span>
          <span>Zone</span>
          <span></span>
        </div>
        {staff.map((member, i) => {
          const isProtected = member.role === "owner" && role !== "owner";
          return (
            <div
              key={member.id}
              className={`grid grid-cols-[1.2fr_1fr_1fr_120px_120px_40px] gap-2 items-center px-4 py-3 ${
                i !== staff.length - 1 ? "border-b border-black/6" : ""
              }`}
            >
              <span className="text-[13px] font-medium text-text-primary truncate">
                {member.name}
              </span>
              <span className="text-[12px] text-text-muted truncate">
                {member.email}
              </span>
              <span className="text-[12px] text-text-muted truncate">
                {member.username}
              </span>

              {isProtected ? (
                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full w-fit flex items-center gap-1 ${ROLE_BADGE[member.role]}`}
                >
                  <Lock className="w-2.5 h-2.5" />
                  {ROLE_LABEL[member.role]}
                </span>
              ) : (
                <select
                  value={member.role}
                  onChange={(e) =>
                    handleRoleChange(member.id, e.target.value as StaffRole)
                  }
                  className={`text-[11px] font-medium px-2 py-1 rounded-full border-none outline-none cursor-pointer ${ROLE_BADGE[member.role]}`}
                >
                  <option value="front_staff">Front staff</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              )}
              {isProtected ? (
                <span className="text-[12px] text-text-muted truncate">
                  {member.zone?.name || "—"}
                </span>
              ) : (
                <select
                  value={member.zoneId || ""}
                  onChange={(e) => handleZoneChange(member.id, e.target.value)}
                  className="text-[11px] font-medium px-2 py-1 rounded-full border-none outline-none cursor-pointer bg-cream-dark text-text-hint"
                >
                  {zoneList.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                disabled={isProtected}
                className={`p-1 justify-self-end ${
                  isProtected
                    ? "text-text-hint/40 cursor-not-allowed"
                    : "text-text-hint hover:text-rose"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </form>
  );
}
