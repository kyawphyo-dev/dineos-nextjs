"use client";

import { useEffect, useState } from "react";

/**
 * Returns a human-readable elapsed time string (e.g. "Just now", "6 min", "1h 12m")
 * that re-computes every 30s without needing per-second re-renders.
 */
export function useElapsed(placedAt: number): string {
  const [, tick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const diffMs = Date.now() - placedAt;
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
}
