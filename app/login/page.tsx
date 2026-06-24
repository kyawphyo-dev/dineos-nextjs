"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ROLE_HOME, type LoginMethod } from "@/app/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword, loginWithPin } = useAuth();

  const [mode, setMode] = useState<LoginMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result =
      mode === "password" ? loginWithPassword(email, password) : loginWithPin(username, pin);

    if (!result.ok || !result.user) {
      setError(result.reason ?? "Login failed.");
      return;
    }
    setError(null);
    router.push(ROLE_HOME[result.user.role]);
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    setPin((prev) => prev + digit);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-95 bg-white rounded-2xl border border-black/8 p-8"
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-bark flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-[18px] font-semibold text-text-primary text-center">DineOS</h1>
        <p className="text-[12px] text-text-muted text-center mt-1 mb-6">
          Sign in to access your dashboard
        </p>

        <div className="flex rounded-xl border border-black/10 overflow-hidden mb-5">
          <button
            onClick={() => {
              setMode("password");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-[12px] font-medium ${
              mode === "password" ? "bg-cream-dark text-text-primary" : "text-text-muted"
            }`}
          >
            Email &amp; Password
          </button>
          <button
            onClick={() => {
              setMode("pin");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-[12px] font-medium ${
              mode === "pin" ? "bg-cream-dark text-text-primary" : "text-text-muted"
            }`}
          >
            Username &amp; PIN
          </button>
        </div>

        {error && (
          <div className="bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}

        {mode === "password" ? (
          <div>
            <label className="text-[12px] text-text-muted mb-1.5 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@dineos.app"
              className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay mb-4"
            />
            <label className="text-[12px] text-text-muted mb-1.5 block">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay mb-5"
            />
          </div>
        ) : (
          <div>
            <label className="text-[12px] text-text-muted mb-1.5 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. niran"
              className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay mb-4"
            />
            <label className="text-[12px] text-text-muted mb-1.5 block">4-digit PIN</label>
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-11 rounded-xl border flex items-center justify-center text-[18px] font-semibold ${
                    pin[i] ? "border-clay border-2 text-text-primary" : "border-black/12 text-text-hint"
                  }`}
                >
                  {pin[i] ? "•" : ""}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5 mt-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  onClick={() => handlePinDigit(d)}
                  className="rounded-xl border border-black/10 py-2.5 text-[15px] font-medium text-text-primary bg-cream-dark"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => setPin("")}
                className="rounded-xl border border-black/10 py-2.5 text-[12px] font-medium text-text-muted bg-cream-dark"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinDigit("0")}
                className="rounded-xl border border-black/10 py-2.5 text-[15px] font-medium text-text-primary bg-cream-dark"
              >
                0
              </button>
              <button
                onClick={() => setPin((prev) => prev.slice(0, -1))}
                className="rounded-xl border border-black/10 py-2.5 text-[12px] font-medium text-text-muted bg-cream-dark"
              >
                ⌫
              </button>
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full bg-clay text-white rounded-xl py-3 text-[14px] font-medium active:bg-clay-dark transition-colors"
        >
          Sign in
        </motion.button>

        <p className="text-[10px] text-text-hint text-center mt-5 leading-relaxed">
          Demo — Owner: anan@dineos.app / owner123 · PIN login: niran / 3333
        </p>
      </motion.div>
    </div>
  );
}
