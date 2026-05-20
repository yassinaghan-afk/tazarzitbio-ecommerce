"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

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
        setError("كلمة المرور غير صحيحة");
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
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
          <Lock className="size-5 text-accent" />
        </div>
        <div>
          <h1 className="text-display text-2xl text-foreground">لوحة الإدارة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تسجيل دخول بسيط لحماية الطلبات والبيانات
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="adminPassword">كلمة المرور</Label>
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
          {loading ? "جاري الدخول..." : "دخول"}
        </Button>
      </form>
    </div>
  );
}

