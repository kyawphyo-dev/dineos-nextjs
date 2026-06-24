"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { StaffRole } from "@/app/types/admin";

interface Props {
  allow: StaffRole[];
  children: React.ReactNode;
}

/**
 * Wraps a role-restricted route group. Redirects to /login if no one is
 * signed in, or back to /login if the signed-in user's role isn't in the
 * allowed list for this section.
 */
export default function RouteGuard({ allow, children }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace("/login");
    }
  }, [user, allow, router]);

  if (!user || !allow.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-dark">
        <p className="text-[13px] text-text-hint">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
