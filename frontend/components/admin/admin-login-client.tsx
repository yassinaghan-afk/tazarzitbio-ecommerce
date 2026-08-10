"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginClient() {
  const router = useRouter();
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
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        let code = "";
        try {
          const data = (await res.json()) as { code?: string; error?: string };
          code = data.code ?? "";
        } catch {
          /* ignore non-JSON bodies */
        }
        if (res.status === 503 || code === "ADMIN_PASSWORD_MISSING") {
          setError(
            "Admin password is not configured on the server. Add ADMIN_PASSWORD in EasyPanel Environment and redeploy.",
          );
        } else if (res.status === 429 || code === "RATE_LIMITED") {
          setError("Too many attempts. Wait a few minutes and try again.");
        } else {
          setError("Incorrect password. Please try again.");
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
    <div className="glass-card rounded-3xl border border-border/60 bg-card/70 p-6 shadow-warm-lg">
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <BrandLogo variant="admin" />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
            <Lock className="size-4 text-accent" />
          </div>
          <div className="text-start">
            <h1 className="text-display text-2xl text-foreground">Admin Panel</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Secure admin access
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="adminPassword">Password</Label>
          <Input
            id="adminPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && (
            <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full rounded-full shadow-gold"
          disabled={loading || password.trim().length === 0}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}

