"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [locked, setLocked] = React.useState(false);
  const [lockTimer, setLockTimer] = React.useState(0);

  // Client-side cooldown display (real lock is on server)
  React.useEffect(() => {
    if (!locked || lockTimer <= 0) return;
    const id = setInterval(() => {
      setLockTimer((t) => {
        if (t <= 1) { setLocked(false); clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [locked, lockTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        // Also set a client-side cookie so layout/middleware checks can read it if needed
        document.cookie = `__admin_token_client=${data.token}; path=/; max-age=28800; SameSite=Strict`;
        router.replace("/admin");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setLocked(true);
        setLockTimer(900); // show 15-min countdown
        setError("Too many attempts. Access locked for 15 minutes.");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError("Access denied. " + (5 - newAttempts > 0 ? `${5 - newAttempts} attempt${5 - newAttempts !== 1 ? "s" : ""} remaining.` : ""));
        setPassword("");
      }
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-white/2 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm mb-4">
            <ShieldCheck className="h-7 w-7 text-white/70" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">
            Restricted Access
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/5 bg-white/3 backdrop-blur-xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
              Access Key
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={locked || loading}
                autoFocus
                autoComplete="current-password"
                placeholder="Enter access key"
                className="w-full rounded-lg border border-white/5 bg-white/5 py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/10 outline-none transition-all focus:border-white/20 focus:bg-white/[0.07] disabled:opacity-40"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[11px] font-medium text-red-400">
              {error}
            </div>
          )}

          {locked && lockTimer > 0 && (
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[11px] font-medium text-amber-400">
              Locked · {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, "0")} remaining
            </div>
          )}

          <button
            type="submit"
            disabled={locked || loading || !password}
            className="w-full rounded-lg bg-white py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-black transition-all hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
            ) : (
              "Authenticate"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.3em] text-white/10">
          Zowears · Management System
        </p>
      </div>
    </div>
  );
}
