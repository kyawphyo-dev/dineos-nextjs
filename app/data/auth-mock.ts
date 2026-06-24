import type { AuthUser } from "@/app/types/auth";

// Demo accounts. In production this would live server-side with hashed
// credentials — this mock exists purely so the login UI has something to
// authenticate against before the real backend is wired in.
export const DEMO_ACCOUNTS: (AuthUser & { password?: string; pin?: string })[] = [
  { id: "s1", name: "Khun Anan", role: "owner", email: "anan@dineos.app", password: "owner123", username: "anan", pin: "1111" },
  { id: "s2", name: "Khun Mali", role: "manager", email: "mali@dineos.app", password: "manager123", username: "mali", pin: "2222" },
  { id: "s3", name: "Niran S.", role: "front_staff", email: "niran@dineos.app", password: "staff123", username: "niran", pin: "3333" },
  { id: "s4", name: "Somchai P.", role: "kitchen", email: "somchai@dineos.app", password: "kitchen123", username: "somchai", pin: "4444" },
  { id: "s5", name: "Praew K.", role: "cashier", email: "praew@dineos.app", password: "cashier123", username: "praew", pin: "5555" },
];
