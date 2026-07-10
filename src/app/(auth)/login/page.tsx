"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Beaker } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/events";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Ungültige E-Mail oder Passwort");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      <h1 className="auth-title">Willkommen zurück</h1>
      <p className="auth-subtitle">Melde dich an, um fortzufahren</p>

      {error && <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><AlertTriangle size={16} /> {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">E-Mail</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="deine@email.de"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Passwort</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? (
            <><span className="spinner" /> Anmelden...</>
          ) : (
            "Anmelden"
          )}
        </button>
      </form>

      <div className="auth-footer">
        Noch kein Konto?{" "}
        <Link href="/register" style={{ fontWeight: 600 }}>
          Jetzt registrieren
        </Link>
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--bg-surface-hover)", borderRadius: "var(--radius-lg)", fontSize: "0.8rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Beaker size={16} /> Demo-Zugänge (Passwort: password123)
        </div>
        <div style={{ color: "var(--text-muted)" }}>
          Admin: admin@eventhub.de<br />
          Veranstalter: veranstalter@eventhub.de<br />
          Besucher: besucher@eventhub.de
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <Suspense fallback={<div className="loading-overlay"><span className="spinner" /></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
