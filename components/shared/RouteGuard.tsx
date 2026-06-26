"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { StaffRole } from "@/lib/auth";

interface Props {
  allow: StaffRole[];
  children: React.ReactNode;
}

export default function RouteGuard({ allow, children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // wait for session to resolve

    if (!session) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(session.user.role)) {
      router.replace("/login");
    }
  }, [session, status, allow, router]);

  if (status === "loading" || !session || !allow.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-dark">
        <p className="text-[13px] text-text-hint">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
