"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  front_staff: "Front Staff",
  kitchen: "Kitchen",
  cashier: "Cashier",
};

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (!session) return null;
  const user = session.user;

  return (
    <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-1.5">
      <div className="text-right">
        <p className="text-[12px] font-medium text-text-primary leading-tight">
          {user.name}
        </p>
        <p className="text-[10px] text-text-hint leading-tight">
          {ROLE_LABEL[user.role] ?? user.role}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="ml-1 text-text-hint hover:text-rose p-1"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
