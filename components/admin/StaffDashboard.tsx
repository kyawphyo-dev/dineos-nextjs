"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Lock } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useRole } from "@/context/RoleContext";
import type { StaffMember, StaffRole, Zone } from "@/app/types/admin";
import CreateStaff from "@/lib/actions/CreateUser.action";
import { toast } from "sonner";
import UpdateUserRole from "@/lib/actions/UpdateUserRole.action";

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
  restaurantList,
  branchList,
  currentUser,
}: {
  staff: StaffMember[];
  totalStaff: number;
  zoneList: Zone[];
  restaurantList: any[];
  branchList: any[];
  currentUser: any;
}) {
  const { role } = useRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("front_staff");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pre-select restaurant/branch/zone if currentUser has them
  useEffect(() => {
    if (currentUser.restaurantId) {
      setSelectedRestaurantId(currentUser.restaurantId);
    } else if (restaurantList.length > 0) {
      setSelectedRestaurantId(restaurantList[0].id);
    }

    if (currentUser.branchId) {
      setSelectedBranchId(currentUser.branchId);
    } else if (filteredBranches.length > 0) {
      setSelectedBranchId(filteredBranches[0].id);
    }
  }, [currentUser, restaurantList, filteredBranches]);

  // Filter branches based on selected restaurant
  useEffect(() => {
    if (selectedRestaurantId) {
      const branches = branchList.filter(
        (b) => b.restaurantId === selectedRestaurantId,
      );
      setFilteredBranches(branches);
      if (
        branches.length > 0 &&
        !filteredBranches.find((b) => b.id === selectedBranchId)
      ) {
        setSelectedBranchId(branches[0].id);
      }
    } else {
      setFilteredBranches([]);
    }
  }, [selectedRestaurantId, branchList]);

  // Filter zones based on selected branch
  useEffect(() => {
    if (selectedBranchId) {
      const zones = zoneList.filter((z) => z.branchId === selectedBranchId);
      setFilteredZones(zones);
      if (
        zones.length > 0 &&
        !filteredZones.find((z) => z.id === selectedZoneId)
      ) {
        setSelectedZoneId(zones[0].id);
      }
    } else {
      setFilteredZones([]);
    }
  }, [selectedBranchId, zoneList]);

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
        restaurantId: selectedRestaurantId,
        branchId: selectedBranchId,
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

  const handleRemove = (id: string) => {
    // TODO: Implement remove staff
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
          {restaurantList.length > 0 && !currentUser.restaurantId && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => {
                setSelectedRestaurantId(e.target.value);
              }}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-clay"
              required
            >
              <option value="">Select restaurant</option>
              {restaurantList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
          {filteredBranches.length > 0 && !currentUser.branchId && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-clay"
              required
            >
              <option value="">Select branch</option>
              {filteredBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
            required
          >
            <option value="">Select zone</option>
            {filteredZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {loading ? "Adding..." : "Add staff"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_140px_40px] gap-2 px-4 py-2.5 bg-cream-dark text-[10px] font-medium text-text-hint uppercase tracking-wider">
          <span>Name</span>
          <span>Email</span>
          <span>Username</span>
          <span>Role</span>
          <span></span>
        </div>
        {staff.map((member, i) => {
          const isProtected = member.role === "owner" && role !== "owner";
          return (
            <div
              key={member.id}
              className={`grid grid-cols-[1.2fr_1fr_1fr_140px_40px] gap-2 items-center px-4 py-3 ${
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

              <button
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
