"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          ...(username.trim() ? { username: username.trim() } : {}),
        }),
      });
      if (!res.ok) {
        let code = "";
        try {
          const data = (await res.json()) as { code?: string; error?: string };
          code = data.code ?? "";
        } catch {
          /* ignore */
        }
        if (res.status === 503 || code === "ADMIN_PASSWORD_MISSING") {
          setError(
            "Admin password is not configured on the server. Add ADMIN_PASSWORD in EasyPanel Environment and redeploy.",
          );
        } else if (res.status === 429 || code === "RATE_LIMITED") {
          setError("Too many attempts. Wait a few minutes and try again.");
        } else {
          setError("Incorrect credentials. Please try again.");
        }
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <p className="text-lg font-extrabold tracking-tight text-foreground">TazarzitBio</p>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
            <Lock className="size-4 text-accent" />
          </div>
          <div className="text-start">
            <h1 className="text-xl font-extrabold text-foreground">Admin Panel</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Admin or confirmation agent login
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="adminUsername">Username (agents only)</Label>
          <Input
            id="adminUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Leave empty for master admin"
            autoComplete="username"
          />
        </div>
        <div>
          <Label htmlFor="adminPassword">Password</Label>
          <Input
            id="adminPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full rounded-full" disabled={loading || !password}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        {error && (
          <p className="text-center text-sm font-semibold text-destructive" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
