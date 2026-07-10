"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password,
          role: formData.get("role"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/events");
        router.refresh();
      }
    } catch {
      setError("Ein Fehler ist aufgetreten");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <h1 className="auth-title">Konto erstellen</h1>
        <p className="auth-subtitle">Registriere dich kostenlos bei EventHub</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Max Mustermann"
              required
            />
          </div>

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
            <label className="form-label" htmlFor="role">Ich möchte mich registrieren als</label>
            <select id="role" name="role" className="form-input form-select" required>
              <option value="VISITOR">🎫 Besucher – Events finden & buchen</option>
              <option value="ORGANIZER">🎪 Veranstalter – Events erstellen & verwalten</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Passwort bestätigen</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Passwort wiederholen"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Registrieren...</>
            ) : (
              "Registrieren"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Bereits ein Konto?{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Jetzt anmelden
          </Link>
        </div>
      </div>
    </div>
  );
}
